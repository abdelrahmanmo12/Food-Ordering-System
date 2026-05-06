package com.foodordering.restaurant.services;

import com.foodordering.restaurant.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.restaurant.aspect.Interfaces.OnlySpecificOwner;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuItemRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import com.foodordering.restaurant.exceptions.ResourceNotFoundException;
import com.foodordering.restaurant.exceptions.DuplicateResourceException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class MenuItemService {

    @Autowired
    private MenuItemRepository menuItemRepository;


    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ImageService imageService;

    @OnlySpecificOwner
    public MenuItem addMenuItem(Long restaurantId, UserDTO owner, MenuItem item) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        if (menuItemRepository.existsByNameAndRestaurant_Id(item.getName(), restaurantId)) {
            throw new DuplicateResourceException("Menu item already exists");
        }

        item.setRestaurant(restaurant);

        return menuItemRepository.save(item);
    }

    public List<MenuItem> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @OnlySpecificOwner
    public MenuItem updateMenuItem(Long id, UserDTO owner, MenuItem updated) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        applyPartialUpdates(item, updated);
        return menuItemRepository.save(item);
    }

    @CheckOwnerAndAdmin
    public void deleteMenuItem(Long id, UserDTO owner) {
        menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        menuItemRepository.deleteById(id);
    }

    public List<MenuItem> getByCategory(String category) {
        return menuItemRepository.findByCategoryName(category);
    }

    public List<MenuItem> getOffers() {
        return menuItemRepository.findByDiscountGreaterThan(0);
    }

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

    @OnlySpecificOwner
    public String uploadImage(Long id, UserDTO owner, MultipartFile file) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        String imageUrl = imageService.uploadImage(file);

        item.setImageUrl(imageUrl);

        menuItemRepository.save(item); 

        return imageUrl;

    }
}
