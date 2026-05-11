package com.foodordering.order.DTOs;

import lombok.Data;

@Data
public class OrderItemRequest {

    private Long itemId;
    private int quantity;
}