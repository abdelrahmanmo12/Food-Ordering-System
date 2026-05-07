package com.foodordering.order.DTOs;

import lombok.Data;

@Data
public class CartItemRequest {
    private String itemName;
    private int quantity;
}