package com.foodordering.order.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String customerName;
    private Long customerId;

    private String phone;

    private String address;
    private String orderNumber;

    private Long restaurantId;
    private String restaurantName;

    private List<OrderItem> items;

    private double totalPrice;

    private OrderStatus status;

    private LocalDateTime createdAt;
}