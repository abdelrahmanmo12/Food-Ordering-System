package com.foodordering.order.DTOs;

import lombok.*;

@Data
public class OrderItemRequest {
    private String itemName;
    private int quantity;
}