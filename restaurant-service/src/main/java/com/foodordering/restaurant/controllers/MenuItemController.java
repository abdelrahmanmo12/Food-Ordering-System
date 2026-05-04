package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.config.UserContext;
import com.foodordering.restaurant.dtos.MenuItemDTO;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.services.MenuItemService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/menu")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @PostMapping("/{restaurantId}")
    public ResponseEntity<MenuItem> addItem(@PathVariable Long restaurantId,
            @RequestBody MenuItem item) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        MenuItem saved = menuItemService.addMenuItem(restaurantId, item, owner);
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

        MenuItem updated = menuItemService.updateMenuItem(id, item, owner);
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

    @GetMapping("/offers")
    public ResponseEntity<List<MenuItem>> getOffers() {

        List<MenuItem> items = menuItemService.getOffers();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadItemImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        UserDTO owner = UserContext.getUser();
        if (owner == null) {
            return ResponseEntity.status(401).build();
        }

        String url = menuItemService.uploadImage(id, file, owner);
        return ResponseEntity.ok(url);
    }
}