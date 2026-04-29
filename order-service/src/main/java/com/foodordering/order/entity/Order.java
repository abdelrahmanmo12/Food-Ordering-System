package com.foodordering.order.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    private String customerName;
    private String phone;
    private String address;
    private String orderNumber;

    private String restaurantId;
    private String restaurantName;

    private List<com.foodordering.order.entity.OrderItem> items;

    private double totalPrice;

    @Setter
    private com.foodordering.order.entity.OrderStatus status;

    private LocalDateTime createdAt;

}