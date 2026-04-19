package com.foodordering.order.clients;

import com.foodordering.order.DTOs.MenuItemDTO;
import com.foodordering.order.DTOs.RestaurantDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "restaurant-service", url = "http://localhost:8080")
public interface RestaurantClient {

    @GetMapping("/api/restaurants/name/{name}")
    RestaurantDTO getByName(@PathVariable("name") String name);  // ← add "name"

    // In RestaurantClient — change to path variable style
    @GetMapping("/api/menu/item")                          // ← keep this
    MenuItemDTO getItem(
            @RequestParam("restaurantId") Long restaurantId,   // ← change String to Long, add ("restaurantId")
            @RequestParam("itemName") String itemName          // ← add ("itemName")
    );
}