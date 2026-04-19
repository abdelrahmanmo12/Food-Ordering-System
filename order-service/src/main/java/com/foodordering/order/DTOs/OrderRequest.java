package com.foodordering.order.DTOs;

import java.util.List;

public class OrderRequest {

    private String restaurantName;
    private String customerName;
    private String phone;
    private String address;

    private List<OrderItemRequest> items;

    // getters
    public String getRestaurantName() {
        return restaurantName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    // setters (IMPORTANT for Postman JSON binding)
    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}