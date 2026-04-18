package com.foodordering.user.Exception;

public class RequestNotFound extends RuntimeException{
    public RequestNotFound(String message) {
        super(message);
    }
}