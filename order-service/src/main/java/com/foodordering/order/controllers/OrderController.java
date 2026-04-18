package com.foodordering.order.controllers;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.abstracts.OrderService;
import com.foodordering.order.services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    // ORDER
    @PostMapping("/orders")
    public com.foodordering.order.DTOs.OrderResponse create(@RequestBody OrderRequest request) {
        return service.createOrder(request);
    }

    @GetMapping("/orders/{phone}")
    public List<com.foodordering.order.DTOs.OrderResponse> getOrders(@PathVariable String phone) {
        return service.getOrders(phone);
    }

    @DeleteMapping("/orders/{id}")
    public void cancel(@PathVariable String id) {
        service.cancelOrder(id);
    }

    // CART
    @PostMapping("/cart")
    public com.foodordering.order.DTOs.CartResponse addToCart(
            @RequestParam String phone,
            @RequestParam String itemName,
            @RequestParam int quantity,
            @RequestParam String restaurantName
    ) {
        return service.addToCart(phone, itemName, quantity, restaurantName);
    }

    @GetMapping("/cart/{phone}")
    public com.foodordering.order.DTOs.CartResponse getCart(@PathVariable String phone) {
        return service.getCart(phone);
    }

    @DeleteMapping("/cart/{phone}")
    public void clearCart(@PathVariable String phone) {
        service.clearCart(phone);
    }
}