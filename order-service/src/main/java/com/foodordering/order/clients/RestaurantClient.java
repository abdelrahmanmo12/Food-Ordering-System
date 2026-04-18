package com.foodordering.order.clients;


import com.foodordering.restaurant.dtos.MenuItemDTO;
import com.foodordering.restaurant.dtos.RestaurantDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@com.foodordering.order.clients.FeignClient(name = "restaurant-service", url = """
        http://localhost:8082""")
public interface RestaurantClient {

    @GetMapping("/api/restaurants/name/{name}")
    RestaurantDTO getByName(@PathVariable String name);

    @GetMapping("/api/menu/item")
    MenuItemDTO getItem(
            @RequestParam String restaurantId,
            @RequestParam String itemName
    );
}