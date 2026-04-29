package com.foodordering.order.DTOs;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    private Long restaurantId;
    private String address;
    private String paymentMethod;
    private List<OrderItemRequest> items;
}