package com.foodordering.notification.kafka;

import com.foodordering.notification.kafka.events.OrderPlacedEvent;
import com.foodordering.notification.kafka.events.UserRegisteredEvent;
import com.foodordering.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;

    /**
     * Listens on topic: user-registered
     * Published by: auth-service after successful registration
     */
    @KafkaListener(
            topics = "${kafka.topics.user-registered}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "userRegisteredKafkaListenerContainerFactory"
    )
    public void consumeUserRegistered(UserRegisteredEvent event) {
        log.info("[KAFKA] Received UserRegisteredEvent: userId={}, email={}, role={}",
                event.getUserId(), event.getEmail(), event.getRole());
        notificationService.handleUserRegistered(event);
    }

    /**
     * Listens on topic: order-placed
     * Published by: order-service after order is created
     */
    @KafkaListener(
            topics = "${kafka.topics.order-placed}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "orderPlacedKafkaListenerContainerFactory"
    )
    public void consumeOrderPlaced(OrderPlacedEvent event) {
        log.info("[KAFKA] Received OrderPlacedEvent: orderId={}, userId={}, total={}",
                event.getOrderId(), event.getUserId(), event.getTotalPrice());
        notificationService.handleOrderPlaced(event);
    }
}
