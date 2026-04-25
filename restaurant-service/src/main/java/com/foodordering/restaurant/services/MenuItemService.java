package com.foodordering.restaurant.services;

import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuItemRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    //  Add Menu Item
    public MenuItem addMenuItem(Long restaurantId, MenuItem item) {



        if(menuItemRepository.existsByNameAndRestaurant_Id(item.getName(), restaurantId)){
            throw new RuntimeException("Menu item already exists");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        item.setRestaurant(restaurant); 

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
}