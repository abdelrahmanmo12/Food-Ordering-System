package com.foodordering.auth.dto.Response;

import java.time.LocalDateTime;

public class PendingAccountResponse {
    private Long accountId;
    private String email;
    private LocalDateTime requestedAt;

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    // Constructors
    public PendingAccountResponse(Long accountId, String email, LocalDateTime requestedAt) {
        this.accountId = accountId;
        this.email = email;
        this.requestedAt = requestedAt;
    }

    // Getters and Setters
}