package com.foodordering.payment.service;

import com.foodordering.payment.client.OrderServiceClient;
import com.foodordering.payment.dto.*;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentNotFoundException;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import com.foodordering.payment.service.strategy.PaymentStrategy;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderValidationService orderValidationService;
    private final OrderServiceClient orderServiceClient; // محتفظين به للـ Validation أو كـ Backup
    private final List<PaymentStrategy> strategies;
    private final StripeService stripeService;

    // 1. إضافة KafkaTemplate لإرسال الرسائل
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // اسم الـ Topic الموحد لأحداث الدفع
    private static final String PAYMENT_TOPIC = "payment-events-topic";
    private static final String NOTIFICATION_TOPIC = "send-notification";

    @Transactional
    public Object createPayment(PaymentRequest request, Authentication authentication) {
        Long currentUserId = extractUserId(authentication);
        OrderDTO order = orderValidationService.validateOrderForPayment(request, currentUserId);

        return strategies.stream()
                .filter(s -> s.supports(request.getPaymentMethod()))
                .findFirst()
                .orElseThrow(() -> new PaymentProcessingException(
                        "No strategy found for payment method: " + request.getPaymentMethod()))
                .process(request, order);
    }

    @Transactional
    public PaymentResponse processRefund(RefundRequest request) {
        log.info("Processing refund for payment: {}", request.getPaymentId());

        Payment payment = paymentRepository.findByPaymentId(request.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + request.getPaymentId()));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new PaymentProcessingException("Cannot refund payment with status: " + payment.getStatus());
        }

        java.math.BigDecimal refundAmount = java.math.BigDecimal.valueOf(request.getRefundAmount());
        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new PaymentProcessingException("Refund amount cannot exceed original payment amount");
        }

        try {
            if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
                long amountInCents = StripeService.convertToCents(refundAmount);
                stripeService.createRefund(payment.getStripePaymentIntentId(), amountInCents, "Customer requested refund");
            }

            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setTransactionId("REF-" + payment.getTransactionId());
            Payment savedPayment = paymentRepository.save(payment);

            // 2. إرسال حدث Kafka عند استرداد المبلغ لتحديث حالة الأوردر في الخدمات الأخرى
            sendPaymentEvent(savedPayment, "PAYMENT_REFUNDED");

            return paymentMapper.toResponse(savedPayment);
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process refund: " + e.getMessage());
        }
    }

    @Transactional
    public void handleStripeWebhook(String stripePaymentIntentId, String eventType) {
        log.info("Handling Stripe webhook - PaymentIntentId: {}, EventType: {}", stripePaymentIntentId, eventType);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found ID: " + stripePaymentIntentId));

        Payment.PaymentStatus newStatus = determineNewStatus(eventType);

        if (newStatus != null && newStatus != payment.getStatus()) {
            payment.setStatus(newStatus);
            paymentRepository.save(payment);

            // 3. بدلاً من استدعاء Feign Client مباشرة، نرسل Event
            // هذا يجعل النظام Event-Driven ويقلل التبعية (Decoupling)
            sendPaymentEvent(payment, "PAYMENT_STATUS_UPDATED");
            
            // Send notification to user
            sendNotification(payment.getUserId().toString(), 
                "Payment " + payment.getStatus() + " for Order #" + payment.getOrderId());
            
            log.info("Payment status updated and Kafka event sent - OrderId: {}, Status: {}", payment.getOrderId(), newStatus);
        }
    }

    // ميثود موحدة لإرسال أحداث الكافكا
    private void sendPaymentEvent(Payment payment, String eventAction) {
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("action", eventAction);
        eventPayload.put("orderId", payment.getOrderId());
        eventPayload.put("paymentId", payment.getPaymentId());
        eventPayload.put("status", payment.getStatus().toString());
        eventPayload.put("amount", payment.getAmount());
        eventPayload.put("timestamp", java.time.LocalDateTime.now().toString());

        kafkaTemplate.send(PAYMENT_TOPIC, payment.getOrderId(), eventPayload);
    }

    private Payment.PaymentStatus determineNewStatus(String eventType) {
        return switch (eventType) {
            case "payment_intent.succeeded" -> Payment.PaymentStatus.COMPLETED;
            case "payment_intent.payment_failed" -> Payment.PaymentStatus.FAILED;
            case "payment_intent.canceled" -> Payment.PaymentStatus.CANCELLED;
            case "payment_intent.processing" -> Payment.PaymentStatus.PENDING;
            default -> null;
        };
    }

    // --- ميثودز المساعدة والتحميل تفضل كما هي ---

    public PaymentResponse getPaymentByPaymentId(String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found ID: " + paymentId));
        return paymentMapper.toResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByOrderId(String orderId) {
        return mapPaymentsToResponse(paymentRepository.findByOrderId(orderId));
    }

    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return mapPaymentsToResponse(paymentRepository.findByUserId(userId));
    }

    private List<PaymentResponse> mapPaymentsToResponse(List<Payment> payments) {
        return payments.stream().map(paymentMapper::toResponse).collect(Collectors.toList());
    }

    private Long extractUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }
    // 1. ميثود تأكيد الدفع (اللي موقفة الـ Build حالياً)
    @Transactional
    public void confirmStripePayment(String paymentIntentId, String orderId, String status, Authentication authentication) {
        log.info("Confirming Stripe payment for Order: {} with status: {}", orderId, status);
        
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for Intent ID: " + paymentIntentId));

        // تحديث الحالة بناءً على اللي جاي من الـ Frontend أو الـ Status
        if ("succeeded".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        
        paymentRepository.save(payment);
        
        // إرسال حدث لكافكا عشان الـ Order Service تعرف
        sendPaymentEvent(payment, "PAYMENT_CONFIRMED");

        // Send notification to user
        sendNotification(payment.getUserId().toString(), 
            "Payment confirmed for Order #" + payment.getOrderId());
    }

    private void sendNotification(String userId, String message) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("message", message);
            event.put("type", "PAYMENT_UPDATE");
            kafkaTemplate.send(NOTIFICATION_TOPIC, event);
        } catch (Exception e) {
            log.error("Failed to send notification for user {}", userId, e);
        }
    }

    // 2. ميثود إلغاء الدفع (عشان ميعملش Error بعدها)
    @Transactional
    public PaymentResponse cancelPayment(String paymentId) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));
        
        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        Payment saved = paymentRepository.save(payment);
        
        sendPaymentEvent(saved, "PAYMENT_CANCELLED");
        return paymentMapper.toResponse(saved);
    }

    // 3. ميثود جلب الدفعات بالحالة (عشان ميعملش Error بعدها)
    public List<PaymentResponse> getPaymentsByStatus(Payment.PaymentStatus status) {
        return mapPaymentsToResponse(paymentRepository.findByStatus(status));
    }

    @Transactional
    public Map<String, String> createStripePaymentIntent(Long amount, String currency, String orderId, Long userId,
                                                        Payment.PaymentMethod paymentMethod) {
        String paymentId = UUID.randomUUID().toString();
        try {
            Map<String, String> stripeResponse = stripeService.createPaymentIntent(amount, currency, orderId, userId, paymentId);
            
            Payment payment = new Payment();
            payment.setPaymentId(paymentId);
            payment.setOrderId(orderId);
            payment.setUserId(userId);
            payment.setAmount(java.math.BigDecimal.valueOf(amount / 100.0));
            payment.setPaymentMethod(paymentMethod);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setStripePaymentIntentId(stripeResponse.get("paymentIntentId"));
            payment.setTransactionId(stripeResponse.get("paymentIntentId"));

            paymentRepository.save(payment);
            return stripeResponse;
        } catch (Exception e) {
            throw new PaymentProcessingException("Failed to create payment intent: " + e.getMessage());
        }
    }
}