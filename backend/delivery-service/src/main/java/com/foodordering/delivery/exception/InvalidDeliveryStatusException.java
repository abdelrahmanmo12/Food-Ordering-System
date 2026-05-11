package com.foodordering.delivery.exception;

public class InvalidDeliveryStatusException extends RuntimeException {
    
    public InvalidDeliveryStatusException(String message) {
        super(message);
    }
}
