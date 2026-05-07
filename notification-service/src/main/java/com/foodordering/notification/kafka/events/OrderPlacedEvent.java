package com.foodordering.notification.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Produced by: order-service  (when a new order is placed)
 * Consumed by: notification-service
 * Topic: order-placed
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent {
    private String orderId;
    private String userId;
    private String restaurantId;
    private double totalPrice;
}
