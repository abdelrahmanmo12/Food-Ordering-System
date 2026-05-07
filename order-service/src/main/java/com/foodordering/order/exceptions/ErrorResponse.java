package com.foodordering.order.exceptions;

import jakarta.validation.constraints.AssertFalse;

import java.time.LocalDateTime;

public class ErrorResponse {
    public static AssertFalse builder() {
        return null;
    }

    public void setMessage(String message) {
    }

    public void setStatus(int value) {
    }

    public void setTimestamp(LocalDateTime now) {
    }

    public void setPath(String requestURI) {
    }
}
