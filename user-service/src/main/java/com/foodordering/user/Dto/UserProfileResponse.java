package com.foodordering.user.Dto;

public class UserProfileResponse {
    private Long profileId;
    private String fullName;
    private String type;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long profileId, String fullName, String type) {
        this.profileId = profileId;
        this.fullName = fullName;
        this.type = type;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
