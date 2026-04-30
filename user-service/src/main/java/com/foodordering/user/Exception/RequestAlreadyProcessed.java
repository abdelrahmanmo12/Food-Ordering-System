package com.foodordering.user.Exception;

public class RequestAlreadyProcessed extends RuntimeException{
    public RequestAlreadyProcessed(String message) {
        super(message);
    }
}