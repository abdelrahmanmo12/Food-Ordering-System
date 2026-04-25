package com.foodordering.auth.Enum;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    USER,
    OWNER,
    ADMIN;
    @JsonCreator
    public static Role fromString(String value) {
        return Role.valueOf(value.toUpperCase());
    }
}