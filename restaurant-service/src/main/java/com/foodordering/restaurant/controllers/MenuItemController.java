package com.foodordering.restaurant.controllers;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.services.MenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;


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
    @GetMapping("/item")
    public MenuItem getItem(
            @RequestParam Long restaurantId,
            @RequestParam String itemName
    ) {
        return menuItemService.getItemByRestaurantAndName(restaurantId, itemName);
    }

    @GetMapping("/offers")
    public List<MenuItem> getOffers() {
        return menuItemService.getOffers();
    }

    @GetMapping("/items")
    public List<MenuItem> getAllItems() {
        return menuItemService.getAllItems();
    }

    @GetMapping("/item/{id}")
    public MenuItem getItemById(@PathVariable Long id) {
        return menuItemService.getItemById(id);
    }

    // Add multiple items at once
    @PostMapping("/bulk/{restaurantId}")
    public ResponseEntity<List<MenuItem>> addBulkItems(
            @PathVariable Long restaurantId,
            @RequestBody List<MenuItem> items) {
        return ResponseEntity.ok(menuItemService.addBulkMenuItems(restaurantId, items));
    }

    // Get full menu grouped by category
    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<Map<String, List<MenuItem>>> getFullMenu(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuItemService.getMenuGroupedByCategory(restaurantId));
    }
}