package com.foodordering.user.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    @NotBlank
    private Long id;
    private String fullName;
    private String type;

    
}