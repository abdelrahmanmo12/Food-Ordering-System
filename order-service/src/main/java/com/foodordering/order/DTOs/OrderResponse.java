package com.foodordering.order.DTOs;

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
    private List<OrderItemRequest> items;
}