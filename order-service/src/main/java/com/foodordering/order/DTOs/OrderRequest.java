package com.foodordering.order.DTOs;

<<<<<<< HEAD
import lombok.*;
=======
import lombok.Data;

>>>>>>> origin/Order_service
import java.util.List;

@Data
public class OrderRequest {

<<<<<<< HEAD
    private String customerName;
    private String phone;
    private String address;

    private String restaurantName;

=======
    private Long restaurantId;
    private String address;
    private String paymentMethod;
>>>>>>> origin/Order_service
    private List<OrderItemRequest> items;
}