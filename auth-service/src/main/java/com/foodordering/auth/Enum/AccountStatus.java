package com.foodordering.auth.Enum;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AccountStatus {
    ACTIVE,
    REJECTED,
    PENDING,
    BANNED;
    @JsonCreator
    public static AccountStatus fromString(String value) {
        return AccountStatus.valueOf(value.toUpperCase());
    }
}