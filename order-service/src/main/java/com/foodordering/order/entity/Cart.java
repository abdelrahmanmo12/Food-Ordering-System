package com.foodordering.order.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    private String id;

    private String phone;
<<<<<<< HEAD

    private List<com.foodordering.order.entity.OrderItem> items;
=======
    private String restaurantName;
    private List<OrderItem> items;
>>>>>>> origin/Order_service
}