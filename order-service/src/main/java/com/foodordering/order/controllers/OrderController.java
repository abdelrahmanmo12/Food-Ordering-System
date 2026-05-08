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
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status", required = true) String userStatus) {

        UserDTO user = new UserDTO(userId, role, userStatus);
        return ResponseEntity.ok(service.getAllOrders(user));
    }

    @PatchMapping("/admin/{orderNumber}/status") // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateStatus(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status", required = true) String userStatus,
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {

        UserDTO user = new UserDTO(userId, role, userStatus);
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, user, status));
    }

    @DeleteMapping("/admin/{orderNumber}")
    public ResponseEntity<String> deleteOrder(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status", required = true) String userStatus,
            @PathVariable String orderNumber) {

        UserDTO user = new UserDTO(userId, role, userStatus);
        service.deleteOrder(orderNumber, user);
        return ResponseEntity.ok("Order deleted successfully");
    }

    // ===== Restaurant =====

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status", required = true) String userStatus,
            @PathVariable Long restaurantId) {
        
        UserDTO user = new UserDTO(userId, role, userStatus);
        return ResponseEntity.ok(service.getOrdersByRestaurant(restaurantId, user));
    }

    @PatchMapping("/restaurant/{orderNumber}/status") // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status", required = true) String userStatus,
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        
        UserDTO user = new UserDTO(userId, role, userStatus);
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, user, status));
    }
}