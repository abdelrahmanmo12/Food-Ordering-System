package com.foodordering.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotNull(message = "Refund amount is required")
    @Positive(message = "Refund amount must be greater than 0")
    private Double refundAmount;

    private String reason;
}
