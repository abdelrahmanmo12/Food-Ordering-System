package com.foodordering.order.DTOs;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String customerName;
    private String address;
}