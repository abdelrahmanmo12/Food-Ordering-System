package com.foodordering.user.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long profileId;
    private String fullName;
    private String type;
    private String address;
    private String phone;

}
