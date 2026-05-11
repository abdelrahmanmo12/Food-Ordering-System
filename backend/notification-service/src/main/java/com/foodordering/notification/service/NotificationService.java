package com.foodordering.notification.service;

import com.foodordering.notification.Dto.NotificationRequest;
import com.foodordering.notification.repository.NotificationRepository;
import com.foodordering.notification.model.OrderStatusNotification;
import com.foodordering.notification.Dto.UserDTO;
import com.foodordering.notification.aop.CheckSameUser;
import com.foodordering.notification.exception.InvalidNotificationRequestException;
import com.foodordering.notification.exception.NotificationProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    @Transactional
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

    @CheckSameUser
    @Transactional(readOnly = true)
    public List<OrderStatusNotification> getUnreadNotifications(Long userId, UserDTO user) {
        return repository.findByUserIdAndIsReadFalse(userId);
    }

    @CheckSameUser
    @Transactional
    public void markAllAsRead(Long userId, UserDTO user) {
        List<OrderStatusNotification> unreadNotifications = repository.findByUserIdAndIsReadFalse(userId);
        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(notification -> notification.setRead(true));
            repository.saveAll(unreadNotifications);
        }
    }
}
