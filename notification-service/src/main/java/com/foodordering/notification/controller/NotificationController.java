package com.foodordering.notification.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.notification.Dto.NotificationRequest;
import com.foodordering.notification.model.OrderStatusNotification;
import com.foodordering.notification.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @PostMapping("/send")
    public void createNotification(@RequestBody NotificationRequest request) {
        service.saveNotification(request);
    }

    @GetMapping("/my-notifications")
    public ResponseEntity<List<OrderStatusNotification>> getUserNotifications(
        @RequestHeader("X-User-Id") Long userId
       ) {
        return ResponseEntity.ok(service.getUnreadNotifications(userId));
    }

    @PatchMapping("/mark-as-read")
    public void markAsRead(@RequestHeader("X-User-Id") Long userId) {
        service.markAllAsRead(userId);
    }
}