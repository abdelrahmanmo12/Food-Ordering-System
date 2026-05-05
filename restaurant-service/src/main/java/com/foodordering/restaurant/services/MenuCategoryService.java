package com.foodordering.restaurant.services;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuCategory;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuCategoryRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuCategoryService {

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private RestaurantRepository restaurantRepository;

    private void validateAccess(Restaurant restaurant, UserDTO user, String action) {
        restaurantService.authorizeUser(user, action);
        if (!"ADMIN".equals(user.getRole())) {
            restaurantService.isTheSameOwner(restaurant, user);
        }
    }

    public MenuCategory addCategory(Long restaurantId, MenuCategory category, UserDTO owner) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        validateAccess(restaurant, owner, "add a menu category");

        category.setRestaurant(restaurant);
        return menuCategoryRepository.save(category);
    }

    public List<MenuCategory> getCategoriesByRestaurant(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantId(restaurantId);
    }

    public MenuCategory updateCategory(Long id, MenuCategory updatedCategory, UserDTO owner) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu category not found"));

        validateAccess(category.getRestaurant(), owner, "update a menu category");

        if (updatedCategory.getName() != null && !updatedCategory.getName().isEmpty()) {
            category.setName(updatedCategory.getName());
        }

        return menuCategoryRepository.save(category);
    }

    public void deleteCategory(Long id, UserDTO owner) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu category not found"));

        validateAccess(category.getRestaurant(), owner, "delete a menu category");

        menuCategoryRepository.deleteById(id);
    }
}