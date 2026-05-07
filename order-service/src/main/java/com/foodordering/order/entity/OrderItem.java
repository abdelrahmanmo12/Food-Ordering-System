package com.foodordering.order.entity;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String name;
    private double price;
    private int quantity;
}