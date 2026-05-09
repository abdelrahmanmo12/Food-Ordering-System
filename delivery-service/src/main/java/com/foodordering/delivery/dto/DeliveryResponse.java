package com.foodordering.delivery.dto;

import com.foodordering.delivery.entity.Delivery;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    
    private Long id;
    private String orderId;
    private Long deliveryPersonId;
    private String customerId;
    private Delivery.DeliveryStatus status;
    private String pickupAddress;
    private String deliveryAddress;
    private String specialInstructions;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
