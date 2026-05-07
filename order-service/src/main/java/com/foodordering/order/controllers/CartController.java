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
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartRequest request) {
        return ResponseEntity.ok(
                orderService.addToCart(
                        request.getCustomerId(),            // ✅
                        request.getItems(),
                        request.getRestaurantName()
                )
        );
    }

    @GetMapping("/{customerId}")                                            // ✅
    public ResponseEntity<CartResponse> getCart(@PathVariable String customerId) {
        return ResponseEntity.ok(orderService.getCart(customerId));
    }

    @DeleteMapping("/{customerId}")                                         // ✅
    public ResponseEntity<String> clearCart(@PathVariable String customerId) {
        orderService.clearCart(customerId);
        return ResponseEntity.ok("Cart cleared successfully");
    }

    @DeleteMapping("/{customerId}/items/{itemName}")                        // ✅
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable String customerId,
            @PathVariable String itemName) {
        return ResponseEntity.ok(orderService.removeFromCart(customerId, itemName));
    }
}