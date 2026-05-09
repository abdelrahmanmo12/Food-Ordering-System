package com.foodordering.payment.controller;

import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.PaymentResponse;
import com.foodordering.payment.dto.RefundRequest;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.service.PaymentAccessService;
import com.foodordering.payment.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentAccessService paymentAccessService;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'USER')")
    public ResponseEntity<Object> createPayment(@Valid @RequestBody PaymentRequest request,
                                                Authentication authentication) {
        log.info("REST request to create payment for order: {}", request.getOrderId());
        paymentAccessService.assertCanAccessUserPayments(request.getUserId(), authentication);
        Object response = paymentService.createPayment(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'USER')")
    public ResponseEntity<PaymentResponse> getPaymentByPaymentId(@PathVariable String paymentId,
                                                                 Authentication authentication) {
        log.info("REST request to get payment with ID: {}", paymentId);
        PaymentResponse response = paymentService.getPaymentByPaymentId(paymentId);
        paymentAccessService.assertCanAccessPayment(response, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrderId(@PathVariable String orderId) {
        log.info("REST request to get payments for order: {}", orderId);
        List<PaymentResponse> responses = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'USER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUserId(@PathVariable Long userId,
                                                                     Authentication authentication) {
        log.info("REST request to get payments for user: {}", userId);
        paymentAccessService.assertCanAccessUserPayments(userId, authentication);
        List<PaymentResponse> responses = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable Payment.PaymentStatus status) {
        log.info("REST request to get payments with status: {}", status);
        List<PaymentResponse> responses = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<PaymentResponse> processRefund(@Valid @RequestBody RefundRequest request) {
        log.info("REST request to process refund for payment: {}", request.getPaymentId());
        PaymentResponse response = paymentService.processRefund(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{paymentId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'USER')")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable String paymentId,
                                                        Authentication authentication) {
        log.info("REST request to cancel payment: {}", paymentId);
        PaymentResponse existingPayment = paymentService.getPaymentByPaymentId(paymentId);
        paymentAccessService.assertCanAccessPayment(existingPayment, authentication);
        PaymentResponse response = paymentService.cancelPayment(paymentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getServiceInfo() {
        return ResponseEntity.ok("Payment Service is running");
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                     @RequestHeader("Stripe-Signature") String signature) {
        log.info("Received Stripe webhook");
        try {
            Event event = Webhook.constructEvent(payload, signature, stripeWebhookSecret);
            String eventType = event.getType();
            String paymentIntentId = extractPaymentIntentId(event);

            if (paymentIntentId != null && eventType != null) {
                paymentService.handleStripeWebhook(paymentIntentId, eventType);
                return ResponseEntity.ok("Webhook processed successfully");
            } else {
                log.warn("Could not extract payment intent ID or event type from webhook payload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook payload");
            }
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook signature");
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    private String extractPaymentIntentId(Event event) {
        StripeObject stripeObject = event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new PaymentProcessingException("Unable to deserialize Stripe webhook payload"));

        if (stripeObject instanceof PaymentIntent paymentIntent) {
            return paymentIntent.getId();
        }

        return null;
    }
}
