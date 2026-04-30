package com.foodordering.restaurant.services;

import com.foodordering.restaurant.dtos.UserDTO;
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
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    private void validateAccess(Restaurant restaurant, UserDTO user, String action) {
        restaurantService.autherizeUser(user, action);
        if (!"ADMIN".equals(user.getRole())) {
            restaurantService.isTheSameOwner(restaurant, user);
        }
    }

    public MenuItem addMenuItem(Long restaurantId, MenuItem item, UserDTO owner) {
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        validateAccess(restaurant, owner, "add menu item");

        if (menuItemRepository.existsByNameAndRestaurant_Id(item.getName(), restaurantId)) {
            throw new RuntimeException("Menu item already exists");
        }
       
        item.setRestaurant(restaurant);

        return menuItemRepository.save(item);
        }
    
    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updated, UserDTO owner) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        validateAccess(item.getRestaurant(), owner, "update meny item");
        applyPartialUpdates(item, updated);
        System.out.println("DEBUG: Description after update: " + item.getDescription());
        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(Long id, UserDTO owner) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        validateAccess(item.getRestaurant(), owner, "delete menu items");
        
        menuItemRepository.deleteById(id);
    }

    public List<MenuItem> getByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }

    public List<MenuItem> getOffers() {
        return menuItemRepository.findByDiscountGreaterThan(0);
    }

    public void applyPartialUpdates(MenuItem item, MenuItem updated){
        if (updated.getName() != null && !updated.getName().isEmpty()) {
            item.setName(updated.getName());
        }
        if (updated.getDescription() != null && !updated.getDescription().isEmpty()) {
            item.setDescription(updated.getDescription());
        }

        if (updated.getPrice() != null && updated.getPrice() != 0) {
            item.setPrice(updated.getPrice());
        }

        if (updated.getCategory() != null) {
            item.setCategory(updated.getCategory());
        }
    
        if (updated.getAvailable() != null) {
            item.setAvailable(updated.getAvailable());
        }        

        if (updated.getDiscount() != null && updated.getDiscount() >= 0) {
            item.setDiscount(updated.getDiscount());
        }
    }
}

