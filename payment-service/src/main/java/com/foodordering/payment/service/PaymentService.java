package com.foodordering.payment.service;

import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.PaymentResponse;
import com.foodordering.payment.dto.RefundRequest;
import com.foodordering.payment.dto.StripePaymentIntentResponse;
import com.foodordering.payment.config.PaymentSchemaMigration;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentNotFoundException;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final StripeService stripeService;
    private final PaymentSchemaMigration paymentSchemaMigration;

    /**
     * Create a payment using the correct flow for the selected payment method.
     * Card, wallet, and PayPal payments use Stripe. Cash-on-delivery and bank
     * transfer are recorded as pending offline/manual payments.
     */
    @Transactional
    public Object createPayment(PaymentRequest request) {
        if (requiresStripe(request.getPaymentMethod())) {
            return createPaymentIntent(request);
        }

        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymentId(generatePaymentId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId("MANUAL-" + payment.getPaymentId());

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Manual/offline payment recorded - PaymentId: {}, Method: {}",
                savedPayment.getPaymentId(), savedPayment.getPaymentMethod());

        return paymentMapper.toResponse(savedPayment);
    }

    /**
     * Create a Payment Intent with Stripe
     * This is the first step in the payment flow
     * Returns client secret for frontend to complete the payment
     */
    @Transactional
    public StripePaymentIntentResponse createPaymentIntent(PaymentRequest request) {
        log.info("Creating Stripe Payment Intent for order: {}, user: {}", request.getOrderId(), request.getUserId());

        if (!requiresStripe(request.getPaymentMethod())) {
            throw new PaymentProcessingException("Payment method " + request.getPaymentMethod()
                    + " is not an online Stripe payment method. Use POST /api/payments to record it.");
        }

        // Create payment record with PENDING status
        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymentId(generatePaymentId());
        payment.setStatus(Payment.PaymentStatus.PENDING);

        try {
            // Convert amount to cents for Stripe
            long amountInCents = StripeService.convertToCents(request.getAmount());

            // Create Stripe Payment Intent
            Map<String, String> stripeResponse = stripeService.createPaymentIntent(
                    amountInCents,
                    "usd",
                    request.getOrderId(),
                    request.getUserId(),
                    payment.getPaymentId()
            );

            // Store Stripe Payment Intent ID
            payment.setStripePaymentIntentId(stripeResponse.get("paymentIntentId"));
            payment.setTransactionId(stripeResponse.get("paymentIntentId"));

            // Save payment to database
            paymentRepository.save(payment);

            // Build response with client secret
            StripePaymentIntentResponse response = StripePaymentIntentResponse.builder()
                    .paymentId(payment.getPaymentId())
                    .stripePaymentIntentId(stripeResponse.get("paymentIntentId"))
                    .clientSecret(stripeResponse.get("clientSecret"))
                    .amount(request.getAmount())
                    .status(Payment.PaymentStatus.PENDING)
                    .message("Payment Intent created successfully")
                    .build();

            log.info("Payment Intent created successfully - PaymentId: {}, StripeIntentId: {}",
                    payment.getPaymentId(), stripeResponse.get("paymentIntentId"));

            return response;

        } catch (StripeException e) {
            log.error("Failed to create Stripe Payment Intent: {}", e.getMessage());
            throw new PaymentProcessingException("Failed to create payment: " + e.getMessage());
        }
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
            // Use Stripe for refund if payment has Stripe Payment Intent ID
            if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
                long amountInCents = StripeService.convertToCents(refundAmount);
                stripeService.createRefund(payment.getStripePaymentIntentId(), amountInCents, "Customer requested refund");
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
        paymentSchemaMigration.sanitizePaymentData();

        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));

        // Sync status with Stripe if payment has Stripe Payment Intent
        if (payment.getStripePaymentIntentId() != null && !payment.getStripePaymentIntentId().isEmpty()) {
            try {
                com.stripe.model.PaymentIntent stripeIntent = stripeService.retrievePaymentIntent(payment.getStripePaymentIntentId());
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

    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        log.info("Fetching payments for order: {}", orderId);
        paymentSchemaMigration.sanitizePaymentData();
        return mapPaymentsToResponse(paymentRepository.findByOrderId(orderId));
    }

    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        log.info("Fetching payments for user: {}", userId);
        paymentSchemaMigration.sanitizePaymentData();
        return mapPaymentsToResponse(paymentRepository.findByUserId(userId));
    }

    public List<PaymentResponse> getPaymentsByStatus(Payment.PaymentStatus status) {
        log.info("Fetching payments with status: {}", status);
        paymentSchemaMigration.sanitizePaymentData();
        return mapPaymentsToResponse(paymentRepository.findByStatus(status));
    }

    private List<PaymentResponse> mapPaymentsToResponse(List<Payment> payments) {
        return payments.stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private boolean requiresStripe(Payment.PaymentMethod paymentMethod) {
        return paymentMethod == Payment.PaymentMethod.CREDIT_CARD
                || paymentMethod == Payment.PaymentMethod.DEBIT_CARD
                || paymentMethod == Payment.PaymentMethod.DIGITAL_WALLET
                || paymentMethod == Payment.PaymentMethod.PAYPAL;
    }

    private String generatePaymentId() {
        return "PAY-" + UUID.randomUUID();
    }

    @Transactional
    public PaymentResponse cancelPayment(String paymentId) {
        log.info("Cancelling payment: {}", paymentId);

        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new PaymentProcessingException("Cannot cancel completed payment");
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

    /**
     * Handle Stripe webhook events
     * Updates payment status based on Stripe events
     */
    @Transactional
    public void handleStripeWebhook(String stripePaymentIntentId, String eventType) {
        log.info("Handling Stripe webhook - PaymentIntentId: {}, EventType: {}", stripePaymentIntentId, eventType);

        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with Stripe Payment Intent ID: " + stripePaymentIntentId));

        Payment.PaymentStatus newStatus = null;

        switch (eventType) {
            case "payment_intent.succeeded":
                newStatus = Payment.PaymentStatus.COMPLETED;
                break;
            case "payment_intent.payment_failed":
            case "payment_intent.canceled":
                newStatus = Payment.PaymentStatus.FAILED;
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
            log.info("Payment status updated via webhook - PaymentId: {}, NewStatus: {}", payment.getPaymentId(), newStatus);
        }
    }

}
