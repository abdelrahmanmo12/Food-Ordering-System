package com.foodordering.notification.service;

import com.foodordering.notification.Dto.NotificationRequest;
import com.foodordering.notification.Repository.NotificationRepository;
import com.foodordering.notification.model.OrderStatusNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public void saveNotification(NotificationRequest request) {
        OrderStatusNotification notification = OrderStatusNotification.builder()
                .userId(request.getUserId())
                .orderNumber(request.getOrderNumber())
                .message(request.getMessage())
                .createdAt(Instant.now())
                .isRead(false)
                .build();
        repository.save(notification);
    }

    public List<OrderStatusNotification> getUnreadNotifications(Long userId) {
        return repository.findByUserIdAndIsReadFalse(userId);
    }

    public void markAllAsRead(Long userId) {
        List<OrderStatusNotification> unreadNotifications = repository.findByUserIdAndIsReadFalse(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        repository.saveAll(unreadNotifications);
    }
}
