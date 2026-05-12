package com.foodordering.order.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    REFUNDED,
    PAID,
    CREATED
}