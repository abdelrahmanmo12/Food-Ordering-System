package com.foodordering.order.entity;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private String name;
<<<<<<< HEAD
    private int quantity;
    private double price;
=======
    private double price;
    private int quantity;
>>>>>>> origin/Order_service
}