package com.foodordering.delivery.clients;

import com.foodordering.delivery.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/users/{userId}")
    UserDTO getUserById(@PathVariable Long userId);
}
