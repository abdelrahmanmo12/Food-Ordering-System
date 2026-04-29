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

    @PostMapping
    public ResponseEntity<OrderCreationResponse> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(service.createOrder(request));
    }

    @GetMapping("/orders/me/{phone}")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@PathVariable String phone) {
        return ResponseEntity.ok(service.getOrders(phone));
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<String> cancel(@PathVariable String id) {
        service.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }


    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(id, status));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable String id) {
        service.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }


    @GetMapping("/restaurant/{restaurantName}")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @PathVariable String restaurantName) {
        return ResponseEntity.ok(service.getOrdersByRestaurant(restaurantName));
    }

    @PutMapping("/restaurant/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(service.updateOrderStatus(orderNumber, status));
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderTrackingResponse> trackOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(service.trackOrder(orderNumber));
    }
}