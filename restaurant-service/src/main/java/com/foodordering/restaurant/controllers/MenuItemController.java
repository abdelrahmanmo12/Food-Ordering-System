package com.foodordering.restaurant.controllers;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.services.MenuItemService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;


@RestController
@RequestMapping("/api/menu")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping("/{restaurantId}")
    public MenuItem addItem(@PathVariable Long restaurantId,
                            @RequestBody MenuItem item) {
        return menuItemService.addMenuItem(restaurantId, item);
    }

    @GetMapping("/{restaurantId}")
    public List<MenuItem> getMenu(@PathVariable Long restaurantId) {
        return menuItemService.getMenuByRestaurant(restaurantId);
    }

    @PutMapping("/{id}")
    public MenuItem update(@PathVariable Long id, @RequestBody MenuItem item) {
        return menuItemService.updateMenuItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
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