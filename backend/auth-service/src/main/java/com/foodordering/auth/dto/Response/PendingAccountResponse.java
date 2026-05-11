package com.foodordering.auth.dto.Response;

import java.time.Instant;

public class PendingAccountResponse {
    private Long accountId;
    private String email;
    private Instant requestedAt;

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

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    // Constructors
    public PendingAccountResponse(Long accountId, String email, Instant requestedAt) {
        this.accountId = accountId;
        this.email = email;
        this.requestedAt = requestedAt;
    }

    // Getters and Setters
}