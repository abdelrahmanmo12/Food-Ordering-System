package com.foodordering.order.clients;

import com.foodordering.order.DTOs.MenuItemDTO;
import com.foodordering.order.DTOs.RestaurantDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@FeignClient(name = "restaurant-service", url = "http://localhost:8080")
public interface RestaurantClient {

    @GetMapping("/api/restaurants/name/{name}")
    RestaurantDTO getByName(@PathVariable("name") String name);

    @GetMapping("/api/menu/item")
    MenuItemDTO getItem(
            @RequestParam("restaurantId") Long restaurantId,
            @RequestParam("itemName") String itemId
    );

    @GetMapping("/api/menu/item/by-name")
    MenuItemDTO getItemByName(
            @RequestParam("restaurantId") Long restaurantId,
            @RequestParam("itemName") String itemName
    );

    @GetMapping("/api/menu/items")
    List<MenuItemDTO> getAllItems();

    @GetMapping("/api/menu/item/{id}")
    MenuItemDTO getItemById(@PathVariable("id") Long id);
}