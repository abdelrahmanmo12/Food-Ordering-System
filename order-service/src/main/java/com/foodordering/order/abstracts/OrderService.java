package com.foodordering.order.abstracts;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderCreationResponse createOrder(OrderRequest request);
    List<OrderResponse> getOrders(String customerId);           // ✅
    void cancelOrder(String orderNumber);

    CartResponse addToCart(String customerId, String itemName, int quantity, String restaurantName);
    CartResponse addToCart(String customerId, String itemName, int quantity, Long restaurantId);
    CartResponse addToCart(String customerId, List<CartItemRequest> items, String restaurantName);
    CartResponse getCart(String customerId);                    // ✅
    void clearCart(String customerId);                          // ✅
    CartResponse removeFromCart(String customerId, String itemName); // ✅

    OrderResponse checkout(String customerId, CheckoutRequest request); // ✅

    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(String orderNumber, OrderStatus status);
    void deleteOrder(String orderNumber);

    List<RestaurantOrderResponse> getOrdersByRestaurant(String restaurantName);
    OrderTrackingResponse trackOrder(String orderNumber);
}