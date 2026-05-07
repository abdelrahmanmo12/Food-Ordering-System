package com.foodordering.order.controllers;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.OrderStatus;
import com.foodordering.order.services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderServiceImpl service;

    // Customer places a direct order
    @PostMapping
    public ResponseEntity<OrderCreationResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(service.createOrder(request));
    }

    // Customer views their order history
    @GetMapping("/me/{customerId}")                                          // ✅
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @PathVariable String customerId) {
        return ResponseEntity.ok(service.getOrders(customerId));
    }

    // Customer tracks a specific order by order number
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderTrackingResponse> trackOrder(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(service.trackOrder(orderNumber));
    }

    // Customer cancels their order
    @PatchMapping("/{orderNumber}/cancel")                                  // ✅ PATCH is more semantic
    public ResponseEntity<String> cancel(@PathVariable String orderNumber) {
        service.cancelOrder(orderNumber);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    // Customer checks out from cart
    @PostMapping("/checkout/{customerId}")                                   // ✅
    public ResponseEntity<OrderResponse> checkout(
            @PathVariable String customerId,
            @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(service.checkout(customerId, request));
    }

    // ===== Admin =====

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @PatchMapping("/admin/{orderNumber}/status")                            // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }

    @DeleteMapping("/admin/{orderNumber}")
    public ResponseEntity<String> deleteOrder(@PathVariable String orderNumber) {
        service.deleteOrder(orderNumber);
        return ResponseEntity.ok("Order deleted successfully");
    }

    // ===== Restaurant =====

    @GetMapping("/restaurant/{restaurantName}")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @PathVariable String restaurantName) {
        return ResponseEntity.ok(service.getOrdersByRestaurant(restaurantName));
    }

    @PatchMapping("/restaurant/{orderNumber}/status")                       // ✅ PATCH not PUT
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }
}