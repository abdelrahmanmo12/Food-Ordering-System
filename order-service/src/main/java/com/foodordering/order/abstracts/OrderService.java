package com.foodordering.order.abstracts;

import com.foodordering.order.DTOs.*;

import java.util.List;

public interface OrderService {

    com.foodordering.order.DTOs.OrderResponse createOrder(com.foodordering.order.DTOs.OrderRequest request);

    List<com.foodordering.order.DTOs.OrderResponse> getOrders(String phone);

    void cancelOrder(String id);

    // CART
    com.foodordering.order.DTOs.CartResponse getCart(String phone);
    com.foodordering.order.DTOs.CartResponse addToCart(String phone, String itemName, int quantity, String restaurantName);
    void clearCart(String phone);
}