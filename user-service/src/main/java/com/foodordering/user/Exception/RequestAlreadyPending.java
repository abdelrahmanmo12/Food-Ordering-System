package com.foodordering.user.Exception;

public class RequestAlreadyPending extends RuntimeException{
    public RequestAlreadyPending(String message) {
        super(message);
    }
}