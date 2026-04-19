package com.foodordering.order.DTOs;

import com.foodordering.order.entity.OrderStatus;
import lombok.*;

@Data
@Builder
public class OrderTrackingResponse {
    private String orderNumber;
    private String restaurantName;
    private String customerName;
    private String address;
    private OrderStatus status;
    private String statusMessage;  // human readable message
    private String createdAt;
}