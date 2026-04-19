package com.foodordering.payment.controller;

import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.PaymentResponse;
import com.foodordering.payment.dto.RefundRequest;
import com.foodordering.payment.dto.StripePaymentIntentResponse;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<StripePaymentIntentResponse> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        log.info("REST request to create Stripe payment intent for order: {}", request.getOrderId());
        StripePaymentIntentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<PaymentResponse> getPaymentByPaymentId(@PathVariable String paymentId) {
        log.info("REST request to get payment with ID: {}", paymentId);
        PaymentResponse response = paymentService.getPaymentByPaymentId(paymentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrderId(@PathVariable Long orderId) {
        log.info("REST request to get payments for order: {}", orderId);
        List<PaymentResponse> responses = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUserId(@PathVariable Long userId) {
        log.info("REST request to get payments for user: {}", userId);
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
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<PaymentResponse> processRefund(@Valid @RequestBody RefundRequest request) {
        log.info("REST request to process refund for payment: {}", request.getPaymentId());
        PaymentResponse response = paymentService.processRefund(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{paymentId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<PaymentResponse> cancelPayment(@PathVariable String paymentId) {
        log.info("REST request to cancel payment: {}", paymentId);
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
            String paymentIntentId = extractPaymentIntentId(payload);
            String eventType = extractEventType(payload);

            if (paymentIntentId != null && eventType != null) {
                paymentService.handleStripeWebhook(paymentIntentId, eventType);
                return ResponseEntity.ok("Webhook processed successfully");
            } else {
                log.warn("Could not extract payment intent ID or event type from webhook payload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook payload");
            }
        } catch (Exception e) {
            log.error("Error processing webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    private String extractPaymentIntentId(String payload) {
        if (payload.contains("\"payment_intent\"")) {
            int start = payload.indexOf("\"payment_intent\"");
            if (start > 0) {
                int idStart = payload.indexOf("\"", start + 17) + 1;
                int idEnd = payload.indexOf("\"", idStart);
                if (idEnd > idStart) {
                    return payload.substring(idStart, idEnd);
                }
            }
        }
        return null;
    }

    private String extractEventType(String payload) {
        if (payload.contains("\"type\"")) {
            int start = payload.indexOf("\"type\"");
            if (start > 0) {
                int valueStart = payload.indexOf("\"", start + 6) + 1;
                int valueEnd = payload.indexOf("\"", valueStart);
                if (valueEnd > valueStart) {
                    return payload.substring(valueStart, valueEnd);
                }
            }
        }
        return null;
    }
}
