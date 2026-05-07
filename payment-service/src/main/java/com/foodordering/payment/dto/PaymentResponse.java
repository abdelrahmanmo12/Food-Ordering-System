package com.foodordering.payment.dto;

import com.foodordering.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private String paymentId;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private Payment.PaymentMethod paymentMethod;
    private String transactionId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
