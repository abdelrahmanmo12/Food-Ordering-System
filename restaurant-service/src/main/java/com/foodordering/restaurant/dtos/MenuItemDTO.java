package com.foodordering.restaurant.dtos;

public class MenuItemDTO {
    public Long id;
    public String name;
    public String description;
    public double price;
    public String category;
    public double discount;

    public double getPrice() {
        return 0;
    }

    public String getName() {
        return "";
    }
}