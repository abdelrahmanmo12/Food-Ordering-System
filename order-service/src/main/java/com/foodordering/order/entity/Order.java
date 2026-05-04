package com.foodordering.order.entity;

<<<<<<< HEAD
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
=======
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
>>>>>>> origin/Order_service
public class Order {

    @Id
    private String id;

<<<<<<< HEAD
    private String userId;
    private String restaurantId;
    private double totalPrice;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }
=======
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

>>>>>>> origin/Order_service
}