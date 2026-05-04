package com.foodordering.order.DTOs;

<<<<<<< HEAD
import lombok.*;

@Data
public class OrderItemRequest {
    private String itemName;
=======
import lombok.Data;

@Data
public class OrderItemRequest {

    private Long itemId;
>>>>>>> origin/Order_service
    private int quantity;
}