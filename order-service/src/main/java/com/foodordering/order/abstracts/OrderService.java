package com.foodordering.order.abstracts;

import com.foodordering.order.DTOs.*;
import com.foodordering.order.entity.OrderStatus;

import java.util.List;

public interface OrderService {

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
}