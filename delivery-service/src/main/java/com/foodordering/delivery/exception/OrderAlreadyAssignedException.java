package com.foodordering.delivery.exception;

public class OrderAlreadyAssignedException extends RuntimeException {
    
    public OrderAlreadyAssignedException(String message) {
        super(message);
    }
}
