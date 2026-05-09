package com.foodordering.restaurant.services;

import com.foodordering.restaurant.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.restaurant.aspect.Interfaces.OnlySpecificOwner;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.MenuCategory;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuCategoryRepository;
import com.foodordering.restaurant.repository.RestaurantRepository;
import com.foodordering.restaurant.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuCategoryService {

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @OnlySpecificOwner
    @Transactional
    public MenuCategory addCategory(Long restaurantId, UserDTO owner, MenuCategory category) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        category.setRestaurant(restaurant);
        return menuCategoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<MenuCategory> getCategoriesByRestaurant(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantId(restaurantId);
    }

    @OnlySpecificOwner
    @Transactional
    public MenuCategory updateCategory(Long id, UserDTO owner, MenuCategory updatedCategory) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu category not found"));

        if (updatedCategory.getName() != null && !updatedCategory.getName().isEmpty()) {
            category.setName(updatedCategory.getName());
        }

        return menuCategoryRepository.save(category);
    }

    @CheckOwnerAndAdmin
    @Transactional
    public void deleteCategory(Long id, UserDTO owner) {
        menuCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu category not found"));

        menuCategoryRepository.deleteById(id);
    }
}