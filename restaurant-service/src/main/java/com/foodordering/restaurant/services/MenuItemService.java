package com.foodordering.restaurant.services;

import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuItemRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.LinkedHashMap;

import java.util.List;
import java.util.Map;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    //  Add Menu Item
    public MenuItem addMenuItem(Long restaurantId, MenuItem item) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        item.setRestaurant(restaurant); // VERY IMPORTANT

        return menuItemRepository.save(item);
    }

    // Get Menu by Restaurant
    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    // Update Menu Item
    public MenuItem updateMenuItem(Long id, MenuItem updated) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setCategory(updated.getCategory());
        item.setAvailable(updated.isAvailable());
        item.setDiscount(updated.getDiscount());

        return menuItemRepository.save(item);
    }

    // Delete Menu Item
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
    public List<MenuItem> getByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }
    public List<MenuItem> getOffers() {
        return menuItemRepository.findByDiscountGreaterThan(0);
    }

    public MenuItem getItemByRestaurantAndName(Long restaurantId, String itemName) {
        return menuItemRepository.findByRestaurantIdAndNameIgnoreCase(restaurantId, itemName);
    }
    public List<MenuItem> addBulkMenuItems(Long restaurantId, List<MenuItem> items) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        items.forEach(item -> item.setRestaurant(restaurant));

        return menuItemRepository.saveAll(items);
    }

    public Map<String, List<MenuItem>> getMenuGroupedByCategory(Long restaurantId) {
        List<MenuItem> items = menuItemRepository.findByRestaurantId(restaurantId);

        if (items.isEmpty()) {
            throw new RuntimeException("No menu items found for this restaurant");
        }

        // Group items by category automatically
        Map<String, List<MenuItem>> menu = new LinkedHashMap<>();
        for (MenuItem item : items) {
            menu.computeIfAbsent(item.getCategory(), k -> new ArrayList<>()).add(item);
        }

        return menu;
    }
}