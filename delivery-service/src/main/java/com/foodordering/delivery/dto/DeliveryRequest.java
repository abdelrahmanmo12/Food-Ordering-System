package com.foodordering.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRequest {
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @NotNull(message = "Delivery person ID is required")
    private Long deliveryPersonId;
    
    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;
    
    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
    
    private String specialInstructions;
    
    @NotNull(message = "Estimated delivery time is required")
    private LocalDateTime estimatedDeliveryTime;
}
