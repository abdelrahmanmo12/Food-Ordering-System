package com.foodordering.auth.Config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.foodordering.auth.dto.Requests.UserProfileRequest;


// @FeignClient(name = "user-service", url = "http://localhost:8083") 
@FeignClient(name = "user-service") 

public interface UserServiceClient {

    @PostMapping("/users/internal/create") 
    void createProfile(@RequestBody UserProfileRequest request);
}