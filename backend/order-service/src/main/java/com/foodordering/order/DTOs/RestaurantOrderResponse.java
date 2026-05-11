package com.foodordering.order.DTOs;

import com.foodordering.order.entity.OrderItem;
import com.foodordering.order.entity.OrderStatus;
import lombok.*;

import java.util.List;

@Data
@Builder
public class RestaurantOrderResponse {
    private String id;
    private String orderNumber;
    private String customerName;
    private String customerId;
    private String address;
    private List<OrderItem> items;
    private double totalPrice;
    private OrderStatus status;
    private String statusMessage;  // human readable
    private String createdAt;
}