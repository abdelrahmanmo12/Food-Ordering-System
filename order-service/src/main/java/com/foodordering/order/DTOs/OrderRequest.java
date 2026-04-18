package com.foodordering.order.DTOs;

import lombok.*;
import java.util.List;

@Data
public class OrderRequest {

    private String customerName;
    private String phone;
    private String address;

    private String restaurantName;

    private List<OrderItemRequest> items;
}