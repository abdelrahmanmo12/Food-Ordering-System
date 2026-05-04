package com.foodordering.restaurant.services;

<<<<<<< HEAD
import com.foodordering.restaurant.dtos.UserDTO;
=======
>>>>>>> origin/Order_service
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuItemRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
<<<<<<< HEAD
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
=======
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.LinkedHashMap;

import java.util.List;
import java.util.Map;
>>>>>>> origin/Order_service

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
<<<<<<< HEAD
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ImageService imageService;

    private void validateAccess(Restaurant restaurant, UserDTO user, String action) {
        restaurantService.authorizeUser(user, action);
        if (!"ADMIN".equals(user.getRole())) {
            restaurantService.isTheSameOwner(restaurant, user);
        }
    }

    public MenuItem addMenuItem(Long restaurantId, MenuItem item, UserDTO owner) {
=======
    private RestaurantRepository restaurantRepository;

    //  Add Menu Item
    public MenuItem addMenuItem(Long restaurantId, MenuItem item) {
>>>>>>> origin/Order_service

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

<<<<<<< HEAD
        validateAccess(restaurant, owner, "add menu item");

        if (menuItemRepository.existsByNameAndRestaurant_Id(item.getName(), restaurantId)) {
            throw new RuntimeException("Menu item already exists");
        }

        item.setRestaurant(restaurant);
=======
        item.setRestaurant(restaurant); // VERY IMPORTANT
>>>>>>> origin/Order_service

        return menuItemRepository.save(item);
    }

<<<<<<< HEAD
=======
    // Get Menu by Restaurant
>>>>>>> origin/Order_service
    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

<<<<<<< HEAD
    public MenuItem updateMenuItem(Long id, MenuItem updated, UserDTO owner) {
=======
    // Update Menu Item
    public MenuItem updateMenuItem(Long id, MenuItem updated) {
>>>>>>> origin/Order_service

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

<<<<<<< HEAD
        validateAccess(item.getRestaurant(), owner, "update menu item");
        applyPartialUpdates(item, updated);
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

=======
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
>>>>>>> origin/Order_service
    public List<MenuItem> getOffers() {
        return menuItemRepository.findByDiscountGreaterThan(0);
    }

<<<<<<< HEAD
    public void applyPartialUpdates(MenuItem item, MenuItem updated) {
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

    public String uploadImage(Long id, MultipartFile file, UserDTO owner) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

         validateAccess(item.getRestaurant(), owner, "upload image");

        String imageUrl = imageService.uploadImage(file);

        item.setImageUrl(imageUrl);

        menuItemRepository.save(item); 

        return imageUrl;

    }
}
=======
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

    public List<MenuItem> getAllItems() {
        return menuItemRepository.findAll();
    }

    public MenuItem getItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
    }
}
>>>>>>> origin/Order_service
