package com.foodordering.order.controllers;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.OrderStatus;
import com.foodordering.order.services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/orders")
// public class OrderController {

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderServiceImpl service;

    // Customer places a direct order
    @PostMapping
    public ResponseEntity<OrderCreationResponse> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody OrderRequest request) {

        // Enforce the logged-in user's ID
        request.setCustomerId(userId);
        return ResponseEntity.ok(service.createOrder(request));
    }

    // Customer views their order history
    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(service.getOrders(userId));
    }

    // Customer tracks a specific order by order number
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderTrackingResponse> trackOrder(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(service.trackOrder(orderNumber));
    }

    // Customer cancels their order
    @PatchMapping("/{orderNumber}/cancel") // ✅ PATCH is more semantic
    public ResponseEntity<String> cancel(@PathVariable String orderNumber) {
        service.cancelOrder(orderNumber);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    // Customer checks out from cart
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(service.checkout(userId, request));
    }

    // ===== Admin =====

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestHeader(value = "X-User-Role") String role) {

        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(service.getAllOrders());
    }

    @PatchMapping("/admin/{orderNumber}/status") // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateStatus(
            @RequestHeader(value = "X-User-Role") String role,
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }

    @DeleteMapping("/admin/{orderNumber}")
    public ResponseEntity<String> deleteOrder(@RequestHeader(value = "X-User-Role") String role,
            @PathVariable String orderNumber) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        service.deleteOrder(orderNumber);
        return ResponseEntity.ok("Order deleted successfully");
    }

    // ===== Restaurant =====

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @RequestHeader(value = "X-User-Role") String role,
            @PathVariable Long restaurantId) {
        if (!"OWNER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        return ResponseEntity.ok(service.getOrdersByRestaurant(restaurantId));
    }

    @PatchMapping("/restaurant/{orderNumber}/status") // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }
}