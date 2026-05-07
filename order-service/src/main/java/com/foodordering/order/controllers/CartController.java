package com.foodordering.order.controllers;

import com.foodordering.order.DTOs.CartRequest;
import com.foodordering.order.DTOs.CartResponse;
import com.foodordering.order.services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final OrderServiceImpl orderService;

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CartRequest request) {
        return ResponseEntity.ok(
                orderService.addToCart(
                        userId,            // Securely uses the authenticated ID
                        request.getItems(),
                        request.getRestaurantName()
                )
        );
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(orderService.getCart(userId));
    }

    @DeleteMapping
    public ResponseEntity<String> clearCart(@RequestHeader("X-User-Id") Long userId) {
        orderService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared successfully");
    }

    @DeleteMapping("/items/{itemName}")
    public ResponseEntity<CartResponse> removeFromCart(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String itemName) {
        return ResponseEntity.ok(orderService.removeFromCart(userId, itemName));
    }
}