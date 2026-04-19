package com.foodordering.order.DTOs;

import lombok.Getter;

@Getter
public class OrderItemRequest {

    private String itemName;
    private int quantity;

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}