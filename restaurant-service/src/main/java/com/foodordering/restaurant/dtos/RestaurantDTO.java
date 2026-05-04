package com.foodordering.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDTO {
    private Long id;
    private String name;
    private String location;
    private String phone;
    private String description;
    private String imageUrl;
    private boolean isOpened;
}