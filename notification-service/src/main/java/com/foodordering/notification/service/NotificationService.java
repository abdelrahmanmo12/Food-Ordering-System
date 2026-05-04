package com.foodordering.notification.service;

import com.foodordering.notification.dto.NotificationResponse;
import com.foodordering.notification.entity.Notification;
import com.foodordering.notification.exception.NotificationNotFoundException;
import com.foodordering.notification.kafka.events.OrderPlacedEvent;
import com.foodordering.notification.kafka.events.UserRegisteredEvent;
import com.foodordering.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ─── Called by Kafka Consumer ──────────────────────────────────────────────

    @Transactional
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Handling UserRegisteredEvent for userId={}, email={}", event.getUserId(), event.getEmail());

        String message = event.getRole().equals("OWNER")
                ? "Welcome, " + event.getEmail() + "! Your owner account is pending admin approval."
                : "Welcome, " + event.getEmail() + "! Your account has been created successfully.";

        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .type(Notification.NotificationType.USER_REGISTERED)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Saved USER_REGISTERED notification for userId={}", event.getUserId());
    }

    @Transactional
    public void handleOrderPlaced(OrderPlacedEvent event) {
        log.info("Handling OrderPlacedEvent for orderId={}, userId={}", event.getOrderId(), event.getUserId());

        String message = String.format(
                "Your order #%s has been placed successfully! Total: %.2f EGP. We'll notify you when it's confirmed.",
                event.getOrderId(), event.getTotalPrice()
        );

        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .type(Notification.NotificationType.ORDER_PLACED)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Saved ORDER_PLACED notification for userId={}", event.getUserId());
    }

    // ─── REST API Methods ──────────────────────────────────────────────────────

    public List<NotificationResponse> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public List<NotificationResponse> getUnreadNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException("Notification does not belong to user: " + userId);
        }

        notification.setRead(true);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for userId={}", unread.size(), userId);
    }
}
