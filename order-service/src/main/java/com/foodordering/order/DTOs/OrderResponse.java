package com.foodordering.order.DTOs;

<<<<<<< HEAD
=======
import com.foodordering.order.entity.OrderItem;
>>>>>>> origin/Order_service
import com.foodordering.order.entity.OrderStatus;
import lombok.*;

import java.util.List;

@Data
@Builder
public class OrderResponse {

    private String orderId;
    private String restaurantName;
    private double totalPrice;
    private OrderStatus status;
<<<<<<< HEAD
    private List<OrderItemRequest> items;
=======
    private List<OrderItem> items;
    private String orderNumber;  // ← add this field// ← keep only this one, remove the other
>>>>>>> origin/Order_service
}