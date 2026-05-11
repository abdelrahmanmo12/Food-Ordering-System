package com.foodordering.user.Dto;

public class ErrorResponse {

    private String message;
    private String status;

    
    public ErrorResponse(String message,String status) {
        this.message = message;
        this.status = status;
    }
    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}