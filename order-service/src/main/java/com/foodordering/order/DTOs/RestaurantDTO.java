package com.foodordering.order.DTOs;

import lombok.Data;

@Data
public class RestaurantDTO {
    private String id;
    private String name;
    private Long ownerId;
    private boolean isOpened;
    private String status;
}