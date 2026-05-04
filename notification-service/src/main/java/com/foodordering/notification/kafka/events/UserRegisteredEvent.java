package com.foodordering.notification.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Produced by: auth-service  (on /auth/register/customer and /auth/register/owner)
 * Consumed by: notification-service
 * Topic: user-registered
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    private String userId;
    private String email;
    private String role;       // USER | OWNER
}
