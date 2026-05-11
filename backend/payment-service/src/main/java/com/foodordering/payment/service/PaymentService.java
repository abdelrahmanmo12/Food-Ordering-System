package com.foodordering.payment.service;

import com.foodordering.payment.client.OrderServiceClient;
import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.OrderStatusUpdateRequest;
import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.PaymentResponse;
import com.foodordering.payment.dto.RefundRequest;
import com.foodordering.payment.dto.StripePaymentIntentResponse;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentNotFoundException;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import com.foodordering.payment.service.strategy.PaymentStrategy;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final OrderServiceClient orderServiceClient;
    private final List<PaymentStrategy> strategies;

    @Transactional
    public Object createPayment(PaymentRequest request, Authentication authentication) {
        // Extract current user ID from authentication
        Long currentUserId = extractUserId(authentication);

        // Validate order before proceeding with payment
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
                .orElseThrow(
                        () -> new PaymentNotFoundException("Payment not found with ID: " + request.getPaymentId()));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new PaymentProcessingException("Cannot refund payment with status: " + payment.getStatus());
        }

        java.math.BigDecimal refundAmount = java.math.BigDecimal.valueOf(request.getRefundAmount());
        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new PaymentProcessingException("Refund amount cannot exceed original payment amount");
        }

        try {
            // Use Stripe for refund if payment has Stripe Payment Intent ID
            if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
                long amountInCents = StripeService.convertToCents(refundAmount);
                stripeService.createRefund(payment.getStripePaymentIntentId(), amountInCents,
                        "Customer requested refund");
                log.info("Stripe refund created for payment: {}", request.getPaymentId());
            }

            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setTransactionId("REF-" + payment.getTransactionId());

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Refund processed successfully for payment: {}", request.getPaymentId());

            return paymentMapper.toResponse(savedPayment);

        } catch (StripeException e) {
            log.error("Failed to process Stripe refund: {}", e.getMessage());
            throw new PaymentProcessingException("Failed to process refund: " + e.getMessage());
        }
    }

    public PaymentResponse getPaymentByPaymentId(String paymentId) {
        log.info("Fetching payment with ID: {}", paymentId);

        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));

        // Sync status with Stripe if payment has Stripe Payment Intent
        if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
            try {
                com.stripe.model.PaymentIntent stripeIntent = stripeService
                        .retrievePaymentIntent(payment.getStripePaymentIntentId());
                Payment.PaymentStatus newStatus = StripeService.mapStripeStatus(stripeIntent.getStatus());

                if (newStatus != payment.getStatus()) {
                    payment.setStatus(newStatus);
                    payment = paymentRepository.save(payment);
                    log.info("Payment status synced with Stripe - PaymentId: {}, NewStatus: {}", paymentId, newStatus);
                }
            } catch (StripeException e) {
                log.warn("Failed to sync status with Stripe: {}", e.getMessage());
            }
        }

        return paymentMapper.toResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByOrderId(String orderId) {
        log.info("Fetching payments for order: {}", orderId);
        return mapPaymentsToResponse(paymentRepository.findByOrderId(orderId));
    }

    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        log.info("Fetching payments for user: {}", userId);
        return mapPaymentsToResponse(paymentRepository.findByUserId(userId));
    }

    public List<PaymentResponse> getPaymentsByStatus(Payment.PaymentStatus status) {
        log.info("Fetching payments with status: {}", status);
        return mapPaymentsToResponse(paymentRepository.findByStatus(status));
    }

    private List<PaymentResponse> mapPaymentsToResponse(List<Payment> payments) {
        return payments.stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Long extractUserId(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new PaymentProcessingException("Unable to extract user ID from authentication");
        }
    }

    @Transactional
    public PaymentResponse cancelPayment(String paymentId) {
        log.info("Cancelling payment: {}", paymentId);

        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new PaymentProcessingException(
                    "Only pending payments can be cancelled. Current status: " + payment.getStatus());
        }

        try {
            // Cancel Stripe Payment Intent if exists
            if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
                stripeService.cancelPaymentIntent(payment.getStripePaymentIntentId());
                log.info("Stripe Payment Intent cancelled: {}", payment.getStripePaymentIntentId());
            }

            payment.setStatus(Payment.PaymentStatus.CANCELLED);

            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment cancelled successfully: {}", paymentId);

            return paymentMapper.toResponse(savedPayment);

        } catch (StripeException e) {
            log.error("Failed to cancel Stripe Payment Intent: {}", e.getMessage());
            throw new PaymentProcessingException("Failed to cancel payment: " + e.getMessage());
        }
    }

    @Transactional
    public void handleStripeWebhook(String stripePaymentIntentId, String eventType) {
        log.info("Handling Stripe webhook - PaymentIntentId: {}, EventType: {}", stripePaymentIntentId, eventType);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Payment not found with Stripe Payment Intent ID: " + stripePaymentIntentId));

        Payment.PaymentStatus newStatus = null;

        switch (eventType) {
            case "payment_intent.succeeded":
                newStatus = Payment.PaymentStatus.COMPLETED;
                break;
            case "payment_intent.payment_failed":
                newStatus = Payment.PaymentStatus.FAILED;
                break;
            case "payment_intent.canceled":
                newStatus = Payment.PaymentStatus.CANCELLED;
                break;
            case "payment_intent.processing":
                newStatus = Payment.PaymentStatus.PENDING;
                break;
            default:
                log.warn("Unhandled Stripe event type: {}", eventType);
                return;
        }

        if (newStatus != null && newStatus != payment.getStatus()) {
            payment.setStatus(newStatus);
            paymentRepository.save(payment);

            log.info("Payment status updated - PaymentId: {}, NewStatus: {}", stripePaymentIntentId, newStatus);

            // Update order status when payment is completed
            if (newStatus == Payment.PaymentStatus.COMPLETED) {
                try {
                    OrderStatusUpdateRequest statusRequest = new OrderStatusUpdateRequest();
                    statusRequest.setStatus(OrderDTO.OrderStatus.CONFIRMED);
                    orderServiceClient.updateOrderStatus(payment.getOrderId(), statusRequest);
                    log.info("Order status updated to CONFIRMED for orderId: {}", payment.getOrderId());
                } catch (Exception e) {
                    log.warn("Failed to update order status: {}", e.getMessage());
                    // Don't fail the payment if order status update fails
                }
            }
        }
    }

    public Map<String, String> createStripePaymentIntent(Long amount, String currency, String orderId, Long userId,
            Payment.PaymentMethod paymentMethod) {
        try {
            log.info("Creating Stripe Payment Intent - Amount: {}, OrderId: {}, UserId: {}, Method: {}",
                    amount, orderId, userId, paymentMethod);

            // Generate a unique payment ID
            String paymentId = UUID.randomUUID().toString();

            // Use Stripe service to create payment intent
            Map<String, String> stripeResponse = stripeService.createPaymentIntent(amount, currency, orderId, userId,
                    paymentId);

            // Create payment record in database with the real payment method
            Payment payment = new Payment();
            payment.setPaymentId(paymentId);
            payment.setOrderId(orderId);
            payment.setUserId(userId);
            payment.setAmount(java.math.BigDecimal.valueOf(amount / 100.0)); // Convert from cents to dollars
            payment.setPaymentMethod(paymentMethod); // use the actual method, not the generic STRIPE value
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setStripePaymentIntentId(stripeResponse.get("paymentIntentId"));
            payment.setTransactionId(stripeResponse.get("paymentIntentId"));

            paymentRepository.save(payment);

            log.info("Payment Intent created successfully - PaymentId: {}, StripePaymentIntentId: {}",
                    paymentId, stripeResponse.get("paymentIntentId"));

            return stripeResponse;

        } catch (Exception e) {
            log.error("Failed to create Stripe Payment Intent: {}", e.getMessage());
            throw new PaymentProcessingException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public void confirmStripePayment(String paymentIntentId, String orderId, String status,
            Authentication authentication) {
        try {
            log.info("Confirming Stripe payment - PaymentIntentId: {}, OrderId: {}, Status: {}",
                    paymentIntentId, orderId, status);

            // Find payment by Stripe Payment Intent ID
            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new PaymentNotFoundException(
                            "Payment not found with Payment Intent ID: " + paymentIntentId));

            // Update payment status and order ID
            Payment.PaymentStatus newStatus = "COMPLETED".equals(status) ? Payment.PaymentStatus.COMPLETED
                    : Payment.PaymentStatus.FAILED;

            payment.setStatus(newStatus);
            payment.setOrderId(orderId); // Update with actual order ID
            paymentRepository.save(payment);

            log.info("Payment confirmed successfully - PaymentId: {}, OrderId: {}, Status: {}",
                    payment.getId(), orderId, newStatus);

        } catch (Exception e) {
            log.error("Failed to confirm Stripe payment: {}", e.getMessage());
            throw new PaymentProcessingException("Failed to confirm payment: " + e.getMessage());
        }
    }

}
