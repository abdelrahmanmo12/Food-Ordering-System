package com.foodordering.order.DTOs;

import lombok.Data;

@Data
public class MenuItemDTO {
    private String id;
    private String name;
    private double price;
}