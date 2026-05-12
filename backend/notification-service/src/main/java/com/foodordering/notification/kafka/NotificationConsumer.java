package com.foodordering.notification.kafka;

import com.foodordering.notification.kafka.events.NotificationEvent;
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

    @KafkaListener(
            topics = "${kafka.topics.user-registered}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeUserRegistered(java.util.Map<String, Object> eventData) {
        log.info("[KAFKA] consumeUserRegistered triggered with data: {}", eventData);
        try {
            UserRegisteredEvent event = new UserRegisteredEvent();
            event.setUserId(String.valueOf(eventData.get("userId")));
            event.setEmail((String) eventData.get("email"));
            event.setRole((String) eventData.get("role"));
            notificationService.handleUserRegistered(event);
        } catch (Exception e) {
            log.error("[KAFKA] Error in consumeUserRegistered: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "${kafka.topics.order-placed}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeOrderPlaced(java.util.Map<String, Object> eventData) {
        log.info("[KAFKA] Received OrderPlacedEvent: {}", eventData);
        OrderPlacedEvent event = new OrderPlacedEvent();
        event.setOrderId(String.valueOf(eventData.get("orderId")));
        event.setUserId(String.valueOf(eventData.get("userId")));
        event.setTotalPrice(Double.parseDouble(String.valueOf(eventData.get("totalPrice"))));
        notificationService.handleOrderPlaced(event);
    }

    @KafkaListener(
            topics = "send-notification",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeNotification(java.util.Map<String, Object> eventData) {
        log.info("[KAFKA] Received NotificationEvent data: {}", eventData);
        
        try {
            NotificationEvent event = new NotificationEvent();
            Object userIdObj = eventData.get("userId");
            if (userIdObj == null) {
                log.error("[KAFKA] userId is missing in NotificationEvent!");
                return;
            }
            
            event.setUserId(String.valueOf(userIdObj));
            event.setMessage((String) eventData.get("message"));
            event.setType((String) eventData.get("type"));
            
            log.info("[KAFKA] Processing notification for userId: {}, type: {}", event.getUserId(), event.getType());
            notificationService.handleGeneralNotification(event);
        } catch (Exception e) {
            log.error("[KAFKA] Error processing NotificationEvent: {}", e.getMessage(), e);
        }
    }
}
