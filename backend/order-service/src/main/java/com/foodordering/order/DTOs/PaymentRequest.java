package com.foodordering.order.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    private String orderId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod;
    private String description;
}
