package com.foodordering.auth.dto.Events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegisteredEvent {
    private String userId;
    private String email;
    private String role;
}
