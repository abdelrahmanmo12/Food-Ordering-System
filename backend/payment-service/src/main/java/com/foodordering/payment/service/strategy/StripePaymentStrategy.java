package com.foodordering.payment.service.strategy;

import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.dto.StripePaymentIntentResponse;
import com.foodordering.payment.entity.Payment;
import com.foodordering.payment.exception.PaymentProcessingException;
import com.foodordering.payment.mapper.PaymentMapper;
import com.foodordering.payment.repository.PaymentRepository;
import com.foodordering.payment.service.StripeService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class StripePaymentStrategy implements PaymentStrategy {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public boolean supports(Payment.PaymentMethod method) {
        return method == Payment.PaymentMethod.CREDIT_CARD ||
               method == Payment.PaymentMethod.DEBIT_CARD ||
               method == Payment.PaymentMethod.DIGITAL_WALLET ||
               method == Payment.PaymentMethod.PAYPAL ||
               method == Payment.PaymentMethod.STRIPE;
    }

    @Override
    public Object process(PaymentRequest request, OrderDTO order) {
        log.info("Processing Stripe payment strategy for order: {}", request.getOrderId());

        // Create payment record with PENDING status
        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymentId(generatePaymentId());
        payment.setStatus(Payment.PaymentStatus.PENDING);

        try {
            long amountInCents = StripeService.convertToCents(request.getAmount());

            // Interact with Stripe API
            Map<String, String> stripeResponse = stripeService.createPaymentIntent(
                    amountInCents,
                    "usd",
                    request.getOrderId(),
                    request.getUserId(),
                    payment.getPaymentId()
            );

            payment.setStripePaymentIntentId(stripeResponse.get("paymentIntentId"));
            paymentRepository.save(payment);

            return StripePaymentIntentResponse.builder()
                    .paymentId(payment.getPaymentId())
                    .stripePaymentIntentId(stripeResponse.get("paymentIntentId"))
                    .clientSecret(stripeResponse.get("clientSecret"))
                    .amount(request.getAmount())
                    .status(Payment.PaymentStatus.PENDING)
                    .message("Stripe Payment Intent created successfully")
                    .build();

        } catch (StripeException e) {
            log.error("Stripe processing failed: {}", e.getMessage());
            throw new PaymentProcessingException("Stripe payment failed: " + e.getMessage());
        }
    }

    private String generatePaymentId() {
        return "PAY-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
