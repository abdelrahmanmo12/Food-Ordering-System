package com.foodordering.gateway.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ValidationResponse {
    private boolean valid;
    private String role;
    private String status;
    private Long accountId;
    public ValidationResponse(boolean valid, String role, String status, Long accountId) {
        this.valid = valid;
        this.role = role;
        this.status = status;
        this.accountId = accountId;
    }

}