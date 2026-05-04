package com.foodordering.order.abstracts;

import com.foodordering.order.DTOs.*;
<<<<<<< HEAD
=======
import com.foodordering.order.entity.OrderStatus;
>>>>>>> origin/Order_service

import java.util.List;

public interface OrderService {

<<<<<<< HEAD
    com.foodordering.order.DTOs.OrderResponse createOrder(com.foodordering.order.DTOs.OrderRequest request);

    List<com.foodordering.order.DTOs.OrderResponse> getOrders(String phone);

    void cancelOrder(String id);

    // CART
    com.foodordering.order.DTOs.CartResponse getCart(String phone);
    com.foodordering.order.DTOs.CartResponse addToCart(String phone, String itemName, int quantity, String restaurantName);
    void clearCart(String phone);
=======
    // ================= ORDER =================

    OrderCreationResponse createOrder(OrderRequest request);

    List<OrderResponse> getOrders(String phone);

    void cancelOrder(String id);


    // ================= CART =================

    CartResponse addToCart(String phone, String itemName, int quantity, String restaurantName);

    CartResponse addToCart(String phone, String itemName, int quantity, Long restaurantId);

    CartResponse addToCart(String phone, List<CartItemRequest> items, String restaurantName);

    CartResponse getCart(String phone);

    void clearCart(String phone);


    // ================= CHECKOUT =================

    OrderResponse checkout(String phone, CheckoutRequest request);


    // ================= ADMIN =================

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(String id, OrderStatus status);

    void deleteOrder(String id);


    // ================= RESTAURANT =================

    List<RestaurantOrderResponse> getOrdersByRestaurant(String restaurantName);


    // ================= TRACKING =================

    OrderTrackingResponse trackOrder(String orderNumber);
>>>>>>> origin/Order_service
}