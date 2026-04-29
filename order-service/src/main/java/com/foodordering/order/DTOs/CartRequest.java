package com.foodordering.order.DTOs;

import lombok.Data;

import java.util.List;

@Data
public class CartRequest {
    private String phone;
    private String restaurantName;
    private List<CartItemRequest> items;
}