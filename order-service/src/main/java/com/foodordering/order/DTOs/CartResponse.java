package com.foodordering.order.DTOs;

import com.foodordering.order.entity.OrderItem;
import lombok.*;

import java.util.List;

@Data
@Builder
public class CartResponse {
    private String phone;
    private String restaurantName;  // ← make sure this exists
    private List<OrderItem> items;
    private double totalPrice;
    private String message;

}