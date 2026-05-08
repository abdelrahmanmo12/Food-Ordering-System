package com.foodordering.order.clients;

import com.foodordering.order.DTOs.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    UserProfileResponse getUserById(@PathVariable("id") Long id);
}
