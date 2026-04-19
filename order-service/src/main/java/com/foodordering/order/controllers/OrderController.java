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

    // ================= USER =================

    @PostMapping("/cart")
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartRequest request) {
        return ResponseEntity.ok(service.addToCart(
                request.getPhone(),
                request.getItemName(),
                request.getQuantity(),
                request.getRestaurantName()
        ));
    }

    @GetMapping("/cart/{phone}")
    public ResponseEntity<CartResponse> getCart(@PathVariable String phone) {
        return ResponseEntity.ok(service.getCart(phone));
    }

    @DeleteMapping("/cart/{phone}")
    public ResponseEntity<String> clearCart(@PathVariable String phone) {
        service.clearCart(phone);
        return ResponseEntity.ok("Cart cleared successfully");
    }

    @PostMapping("/checkout/{phone}")
    public ResponseEntity<OrderResponse> checkout(
            @PathVariable String phone,
            @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(service.checkout(phone, request));
    }

    @GetMapping("/my-orders/{phone}")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@PathVariable String phone) {
        return ResponseEntity.ok(service.getOrders(phone));
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<String> cancel(@PathVariable String id) {
        service.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    // ================= ADMIN =================

    // Admin: get all orders
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    // Admin: update any order status
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(id, status));
    }

    // Admin: delete order
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable String id) {
        service.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    // ================= RESTAURANT OWNER =================

    // Restaurant owner: see all orders for their restaurant
    @GetMapping("/restaurant/{restaurantName}")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @PathVariable String restaurantName) {
        return ResponseEntity.ok(service.getOrdersByRestaurant(restaurantName));
    }

    // Restaurant owner: update order status (preparing, on the way, delivered)
    // ✅ correct — let GlobalExceptionHandler handle it
    @PutMapping("/restaurant/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }
    // User tracks their order status
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(service.trackOrder(orderNumber));
    }
}