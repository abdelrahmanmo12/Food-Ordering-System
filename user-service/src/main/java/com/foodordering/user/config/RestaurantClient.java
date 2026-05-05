package com.foodordering.user.config;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "restaurant-service") 
public interface RestaurantClient {

    @GetMapping("/restaurants/internal/exists/{id}")
    Boolean checkRestaurantExists(@PathVariable("id") Long id);
}