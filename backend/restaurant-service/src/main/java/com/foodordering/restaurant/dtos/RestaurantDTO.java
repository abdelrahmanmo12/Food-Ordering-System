package com.foodordering.restaurant.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.foodordering.restaurant.dtos.MenuItemDTO;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDTO {
    private Long id;
    private String name;
    private Long ownerId;
    private String location;
    private String phone;
    private String description;
    private String imageUrl;
    private boolean isOpened;
    private String status;
    private String cuisine = "General";
    private double rating = 4.5;
    private int minOrder = 50;
    private DeliveryTime deliveryTime = new DeliveryTime(20, 40);
    private List<MenuItemDTO> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DeliveryTime {
        private int min;
        private int max;
    }
}