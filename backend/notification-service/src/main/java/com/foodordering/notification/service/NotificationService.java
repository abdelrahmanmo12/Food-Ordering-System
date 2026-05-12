package com.foodordering.notification.service;

import com.foodordering.notification.dto.NotificationResponse;
import com.foodordering.notification.entity.Notification;
import com.foodordering.notification.exception.NotificationNotFoundException;
import com.foodordering.notification.kafka.events.NotificationEvent;
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



    @Transactional
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Handling UserRegisteredEvent for userId={}, email={}", event.getUserId(), event.getEmail());

        String welcomeMessage = event.getRole().equals("OWNER")
                ? "Welcome, " + event.getEmail() + "! Your owner account is pending admin approval."
                : "Welcome, " + event.getEmail() + "! Your account has been created successfully.";

        Notification userNotification = Notification.builder()
                .userId(event.getUserId())
                .type(Notification.NotificationType.USER_REGISTERED)
                .message(welcomeMessage)
                .isRead(false)
                .build();

        notificationRepository.save(userNotification);
        log.info("Saved welcome notification for userId={}", event.getUserId());

        if ("OWNER".equals(event.getRole())) {
            String adminId = "1";
            String adminMessage = String.format("New owner registration: %s (ID: %s). Please review and approve the account.", 
                                                event.getEmail(), event.getUserId());
            
            Notification adminNotification = Notification.builder()
                    .userId(adminId)
                    .type(Notification.NotificationType.GENERAL)
                    .message(adminMessage)
                    .isRead(false)
                    .build();
            
            notificationRepository.save(adminNotification);
            log.info("Saved admin notification for new owner registration from email={}", event.getEmail());
        }
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

    @Transactional
    public void handleGeneralNotification(NotificationEvent event) {
        log.info("Handling NotificationEvent for userId={}, type={}", event.getUserId(), event.getType());

        Notification.NotificationType type = Notification.NotificationType.GENERAL;
        if ("ORDER_UPDATE".equals(event.getType())) {
            type = Notification.NotificationType.ORDER_UPDATE;
        }

        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .type(type)
                .message(event.getMessage())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Saved {} notification for userId={}", type, event.getUserId());
    }



    public List<NotificationResponse> getNotificationsForUser(String userId) {
        log.info("Fetching notifications for userId: {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        log.info("Found {} notifications for userId: {}", notifications.size(), userId);
        return notifications.stream()
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
