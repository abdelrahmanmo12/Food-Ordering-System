package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.services.MenuItemService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping("/{restaurantId}")
    public MenuItem addItem(@PathVariable Long restaurantId,
            @RequestBody MenuItem item, @RequestHeader("X-User-Id") String id,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {
        UserDTO user = new UserDTO(id, role, status);
        return menuItemService.addMenuItem(restaurantId, item, user);
    }

    @GetMapping("/{restaurantId}")
    public List<MenuItem> getMenu(@PathVariable Long restaurantId) {
        return menuItemService.getMenuByRestaurant(restaurantId);
    }

    @PutMapping("/{id}")
    public MenuItem update(@PathVariable Long id, @RequestBody MenuItem item,
         @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {
                        UserDTO user = new UserDTO(userId, role, status);

        return menuItemService.updateMenuItem(id, item, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,@RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {
                        UserDTO user = new UserDTO(userId, role, status);
        menuItemService.deleteMenuItem(id,user);
    }

    @GetMapping("/category/{category}")
    public List<MenuItem> getByCategory(@PathVariable String category) {
        return menuItemService.getByCategory(category);
    }

    @GetMapping("/offers")
    public List<MenuItem> getOffers() {
        return menuItemService.getOffers();
    }
}