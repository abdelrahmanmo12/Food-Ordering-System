        package com.foodordering.order.clients;

        import com.foodordering.order.DTOs.MenuItemDTO;
        import com.foodordering.order.DTOs.RestaurantDTO;
        import org.springframework.cloud.openfeign.FeignClient;
        import org.springframework.web.bind.annotation.*;
        import java.util.List;

        @FeignClient(name = "restaurant-service")
        public interface RestaurantClient {

        @GetMapping("/restaurants/name/{name}")
        RestaurantDTO getByName(@PathVariable("name") String name);

        @GetMapping("/restaurants/{id}")
        RestaurantDTO getById(@PathVariable("id") Long id);

        @GetMapping("/menu/item")
        MenuItemDTO getItem(
                @RequestParam("restaurantId") Long restaurantId,
                @RequestParam("itemId") Long itemId
        );

        @GetMapping("/menu/item/by-name")
        MenuItemDTO getItemByName(
                @RequestParam("restaurantId") Long restaurantId,
                @RequestParam("itemName") String itemName
        );

        @GetMapping("/menu/items")
        List<MenuItemDTO> getAllItems();

        @GetMapping("/menu/item/{id}")
        MenuItemDTO getItemById(@PathVariable("id") Long id);
        }
