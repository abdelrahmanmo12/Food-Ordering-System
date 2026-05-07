package com.foodordering.order.abstracts;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderCreationResponse createOrder(OrderRequest request);
    List<OrderResponse> getOrders(Long customerId);           // ✅
    void cancelOrder(String orderNumber);

    // CartResponse addToCart(Long customerId, String itemName, int quantity, String restaurantName);
    // CartResponse addToCart(Long customerId, String itemName, int quantity, Long restaurantId);
    CartResponse addToCart(Long customerId, List<CartItemRequest> items, String restaurantName);
    CartResponse getCart(Long customerId);                    // ✅
    void clearCart(Long customerId);                          // ✅
    CartResponse removeFromCart(Long customerId, String itemName); // ✅

    OrderResponse checkout(Long customerId, CheckoutRequest request); // ✅

    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(String orderNumber, OrderStatus status);
    void deleteOrder(String orderNumber);

    List<RestaurantOrderResponse> getOrdersByRestaurant(Long restaurantId);
    OrderTrackingResponse trackOrder(String orderNumber);
}