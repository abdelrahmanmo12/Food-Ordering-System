package com.foodordering.payment.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public StripeService() {
        // Stripe API key will be set when needed
    }

    /**
     * Initialize Stripe with the secret key
     */
    private void initializeStripe() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Create a Payment Intent with Stripe
     *
     * @param amount Amount in cents (Stripe uses cents, not dollars)
     * @param currency Currency code (e.g., "usd")
     * @param orderId Order ID for metadata
     * @param userId User ID for metadata
     * @param paymentId Payment ID for metadata
     * @return Map containing paymentIntentId and clientSecret
     * @throws StripeException if Stripe API call fails
     */
    public Map<String, String> createPaymentIntent(long amount, String currency, Long orderId, Long userId, String paymentId) throws StripeException {
        initializeStripe();

        log.info("Creating Stripe Payment Intent - Amount: {} cents, Currency: {}, OrderId: {}, UserId: {}",
                amount, currency, orderId, userId);

        // Build metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("orderId", String.valueOf(orderId));
        metadata.put("userId", String.valueOf(userId));
        metadata.put("paymentId", paymentId);

        // Create Payment Intent parameters
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .putAllMetadata(metadata)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                .build()
                )
                .build();

        // Create Payment Intent
        PaymentIntent paymentIntent = PaymentIntent.create(params);

        log.info("Payment Intent created successfully - ID: {}, Status: {}",
                paymentIntent.getId(), paymentIntent.getStatus());

        // Return response
        Map<String, String> response = new HashMap<>();
        response.put("paymentIntentId", paymentIntent.getId());
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("status", paymentIntent.getStatus());

        return response;
    }

    /**
     * Retrieve a Payment Intent by ID
     *
     * @param paymentIntentId Stripe Payment Intent ID
     * @return PaymentIntent object
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        initializeStripe();

        log.info("Retrieving Payment Intent - ID: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

        log.info("Payment Intent retrieved - ID: {}, Status: {}", paymentIntentId, paymentIntent.getStatus());

        return paymentIntent;
    }

    /**
     * Cancel a Payment Intent
     *
     * @param paymentIntentId Stripe Payment Intent ID
     * @return Cancelled PaymentIntent
     * @throws StripeException if Stripe API call fails
     */
    public PaymentIntent cancelPaymentIntent(String paymentIntentId) throws StripeException {
        initializeStripe();

        log.info("Cancelling Payment Intent - ID: {}", paymentIntentId);

        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        paymentIntent = paymentIntent.cancel();

        log.info("Payment Intent cancelled - ID: {}, Status: {}", paymentIntentId, paymentIntent.getStatus());

        return paymentIntent;
    }

    /**
     * Create a Refund for a Payment Intent
     *
     * @param paymentIntentId Stripe Payment Intent ID
     * @param amountInCents Amount to refund in cents (null for full refund)
     * @param reason Refund reason
     * @return Refund object
     * @throws StripeException if Stripe API call fails
     */
    public Refund createRefund(String paymentIntentId, Long amountInCents, String reason) throws StripeException {
        initializeStripe();

        log.info("Creating Refund - PaymentIntentId: {}, Amount: {} cents, Reason: {}",
                paymentIntentId, amountInCents, reason);

        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER);

        if (amountInCents != null) {
            paramsBuilder.setAmount(amountInCents);
        }

        Refund refund = Refund.create(paramsBuilder.build());

        log.info("Refund created successfully - ID: {}, Amount: {} cents",
                refund.getId(), refund.getAmount());

        return refund;
    }

    /**
     * Convert BigDecimal amount to cents for Stripe
     *
     * @param amount Amount in dollars (e.g., 100.50)
     * @return Amount in cents (e.g., 10050)
     */
    public static long convertToCents(BigDecimal amount) {
        return amount.multiply(new java.math.BigDecimal("100")).longValue();
    }

    /**
     * Map Stripe status to PaymentStatus enum
     *
     * @param stripeStatus Stripe status string
     * @return PaymentStatus enum
     */
    public static com.foodordering.payment.entity.Payment.PaymentStatus mapStripeStatus(String stripeStatus) {
        if (stripeStatus == null) {
            return com.foodordering.payment.entity.Payment.PaymentStatus.FAILED;
        }

        switch (stripeStatus.toLowerCase()) {
            case "succeeded":
                return com.foodordering.payment.entity.Payment.PaymentStatus.COMPLETED;
            case "processing":
                return com.foodordering.payment.entity.Payment.PaymentStatus.PENDING;
            case "requires_payment_method":
            case "requires_confirmation":
            case "requires_action":
            case "requires_capture":
                return com.foodordering.payment.entity.Payment.PaymentStatus.PENDING;
            case "canceled":
                return com.foodordering.payment.entity.Payment.PaymentStatus.CANCELLED;
            case "payment_failed":
            default:
                return com.foodordering.payment.entity.Payment.PaymentStatus.FAILED;
        }
    }
}
