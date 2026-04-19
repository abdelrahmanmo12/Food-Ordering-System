package com.foodordering.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private Double refundAmount;

    private String reason;
}
