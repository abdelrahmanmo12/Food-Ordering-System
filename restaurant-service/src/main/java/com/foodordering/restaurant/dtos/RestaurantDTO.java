package com.foodordering.restaurant.dtos;

<<<<<<< HEAD
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
=======
public class RestaurantDTO {
    public Long id;
    public String name;
    public String location;
    public String phone;

    public String getId() {
        return "";
    }

    public String getName() {
        return "";
    }
>>>>>>> origin/Order_service
}