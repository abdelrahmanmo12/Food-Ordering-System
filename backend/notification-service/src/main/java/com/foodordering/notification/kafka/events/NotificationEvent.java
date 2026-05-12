package com.foodordering.notification.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Produced by: Any service that needs to send a notification
 * Consumed by: notification-service
 * Topic: send-notification
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String userId;
    private String message;
    private String type; // e.g., ORDER_STATUS, PROMO, SYSTEM
}
