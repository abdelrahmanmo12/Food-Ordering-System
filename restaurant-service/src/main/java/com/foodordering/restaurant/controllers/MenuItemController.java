package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.config.UserContext;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuCategory;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.services.MenuCategoryService;
import com.foodordering.restaurant.services.MenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/menu")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private MenuCategoryService menuCategoryService;

    @PostMapping("/{restaurantId}")
    public ResponseEntity<MenuItem> addItem(@PathVariable Long restaurantId,
            @RequestBody MenuItem item) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        MenuItem saved = menuItemService.addMenuItem(restaurantId, owner, item);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenu(@PathVariable Long restaurantId) {

        List<MenuItem> items = menuItemService.getMenuByRestaurant(restaurantId);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> update(@PathVariable Long id,
            @RequestBody MenuItem item) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        MenuItem updated = menuItemService.updateMenuItem(id, owner, item);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        menuItemService.deleteMenuItem(id, owner);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItem>> getByCategory(@PathVariable String category) {

        List<MenuItem> items = menuItemService.getByCategory(category);
        return ResponseEntity.ok(items);
    }
    @GetMapping("/item")
    public MenuItem getItem(
            @RequestParam("restaurantId") Long restaurantId,
            @RequestParam("itemId") Long itemId
    ) {
        return menuItemService.getItemByRestaurantAndId(restaurantId, itemId);
    }

    @GetMapping("/item/by-name")
    public MenuItem getItemByName(
            @RequestParam("restaurantId") Long restaurantId,
            @RequestParam("itemName") String itemName
    ) {
        return menuItemService.getItemByRestaurantAndName(restaurantId, itemName);
    }

    @GetMapping("/discounts")
    public ResponseEntity<List<MenuItem>> getDiscounts() {

        List<MenuItem> items = menuItemService.getDiscounts();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadItemImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        String url = menuItemService.uploadImage(id, owner, file);
        return ResponseEntity.ok(url);
    }

    @PostMapping("/categories/{restaurantId}")
    public ResponseEntity<MenuCategory> createCategory(@PathVariable Long restaurantId, 
                                                     @RequestBody MenuCategory category) {
        UserDTO owner = UserContext.getUser();
        MenuCategory saved = menuCategoryService.addCategory(restaurantId, owner, category);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/categories/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuCategory>> getCategoriesByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuCategoryService.getCategoriesByRestaurant(restaurantId));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<MenuCategory> updateCategory(@PathVariable Long id, 
                                                     @RequestBody MenuCategory category) {
        UserDTO owner = UserContext.getUser();
        return ResponseEntity.ok(menuCategoryService.updateCategory(id, owner, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        UserDTO owner = UserContext.getUser();
        menuCategoryService.deleteCategory(id, owner);
        return ResponseEntity.noContent().build();
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