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

    // Add multiple items to cart at once
    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartRequest request) {
        return ResponseEntity.ok(
                orderService.addToCart(
                        request.getPhone(),
                        request.getItems(),           // ← list not single item
                        request.getRestaurantName()
                )
        );
    }

    // View cart
    @GetMapping("/{phone}")
    public ResponseEntity<CartResponse> getCart(@PathVariable String phone) {
        return ResponseEntity.ok(orderService.getCart(phone));
    }

    // Clear cart
    @DeleteMapping("/{phone}")
    public ResponseEntity<String> clearCart(@PathVariable String phone) {
        orderService.clearCart(phone);
        return ResponseEntity.ok("Cart cleared successfully");
    }
}