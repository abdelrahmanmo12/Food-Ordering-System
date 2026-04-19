package com.foodordering.payment.dto;

import com.foodordering.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentIntentResponse {
    private String paymentId;
    private String stripePaymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private String message;
}
