package com.foodordering.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuCategoryResponse {
    private Long id;
    private String name;
    private boolean active;
    private Long restaurantId;
    private String restaurantName;
}