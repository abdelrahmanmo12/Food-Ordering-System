package com.foodordering.notification.controller;

import com.foodordering.notification.dto.NotificationResponse;
import com.foodordering.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * All endpoints expect the API Gateway to inject X-User-Id header.
 * Routes must be added to the gateway config (see notes below).
 */
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /notifications
     * Returns all notifications for the authenticated user.
     * Header: X-User-Id (injected by API Gateway from JWT)
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader("X-User-Id") String userId) {
        log.info("GET /notifications for userId={}", userId);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /**
     * GET /notifications/unread
     * Returns only unread notifications.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId));
    }

    /**
     * GET /notifications/unread/count
     * Returns number of unread notifications (useful for badge counter).
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Id") String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * PATCH /notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    /**
     * PATCH /notifications/read-all
     * Marks all user notifications as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @RequestHeader("X-User-Id") String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
