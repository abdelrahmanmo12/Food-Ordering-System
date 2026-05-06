package com.foodordering.restaurant.services;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.enums.AdminStatus;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.RestaurantRepository;
import com.foodordering.restaurant.exceptions.ResourceNotFoundException;
import com.foodordering.restaurant.exceptions.UnauthorizedAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import com.foodordering.restaurant.aspect.Interfaces.AdminOnly;
import com.foodordering.restaurant.aspect.Interfaces.CheckOwnerAndAdmin;
import com.foodordering.restaurant.aspect.Interfaces.OnlyOwner;
import com.foodordering.restaurant.aspect.Interfaces.OnlySpecificOwner;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ImageService imageService;

    @Transactional(readOnly = true)
    public List<Restaurant> getAllPublicRestaurants() {
        return restaurantRepository.findByStatus(AdminStatus.APPROVED);
    }

    public Restaurant getRestaurantById(Long id) {
        return (Restaurant) restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
    }

    @OnlyOwner
    public Restaurant addRestaurant(UserDTO owner, Restaurant restaurant) {
        
        try {
            Long id = Long.valueOf(owner.getId());
            restaurant.setOwnerId(id);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid User ID format");
        }

        return restaurantRepository.save(restaurant);
    }

    @OnlySpecificOwner
    public Restaurant updateRestaurant(Long id, UserDTO owner, Restaurant updated) {

        System.out.println("=== SERVICE ===");
        System.out.println("THREAD: " + Thread.currentThread().getId());
        System.out.println("OWNER: " + owner);

        System.out.println(owner.getRole());

        Restaurant restaurant = getRestaurantById(id);
        applyRestaurantUpdates(restaurant, updated);

        return restaurantRepository.save(restaurant);
    }

    @CheckOwnerAndAdmin
    public void deleteRestaurant(Long id, UserDTO owner) {
        if (!existsById(id)) {
            throw new ResourceNotFoundException("Restaurant not found");
        }
        
        restaurantRepository.deleteById(id);
    }

    public void authorizeUser(UserDTO owner, String message) {
        String role = owner.getRole();

        if ("ADMIN".equals(role)) {
            return;
        }

        if ("OWNER".equals(role) && "ACTIVE".equals(owner.getStatus())) {
            return;
        }
        throw new UnauthorizedAccessException("Access Denied: You must be an ADMIN or an ACTIVE OWNER to " + message);
    }

    public void isTheSameOwner(Restaurant restaurant, UserDTO owner) {
        if (!owner.getId().equals(String.valueOf(restaurant.getOwnerId()))) {
            throw new UnauthorizedAccessException("You are not the owner of this restaurant");
        }
    }

    private void applyRestaurantUpdates(Restaurant restaurant, Restaurant updated) {
        if (updated.getName() != null && !updated.getName().isEmpty()) {
            restaurant.setName(updated.getName());
        }
        if (updated.getLocation() != null && !updated.getLocation().isEmpty()) {
            restaurant.setLocation(updated.getLocation());
        }
        if (updated.getPhone() != null && !updated.getPhone().isEmpty()) {
            restaurant.setPhone(updated.getPhone());
        }
        if (updated.getDescription() != null && !updated.getDescription().isEmpty()) {
            restaurant.setDescription(updated.getDescription());
        }
    }

    @CheckOwnerAndAdmin
    public Restaurant toggleOpeningStatus(Long id, UserDTO owner) {
        Restaurant restaurant = getRestaurantById(id);

        if (restaurant.getStatus() != AdminStatus.APPROVED) {
            throw new IllegalStateException("You can't toggle it until the restaurant is approved");
        }

        restaurant.setOpened(!restaurant.isOpened());
        return restaurantRepository.save(restaurant);
    }

    @AdminOnly
    public List<Restaurant> getAllPendingRestaurants(String role) {
        if (!"ADMIN".equals(role)) {
            throw new UnauthorizedAccessException("Only admins can view pending restaurants");
        }
        List<Restaurant> restaurants = restaurantRepository.findByStatus(AdminStatus.PENDING);
        return restaurants;

    }

    @AdminOnly
    public String updateRestaurantStatus(Long id, String role, AdminStatus newStatus) {
        if (!"ADMIN".equals(role)) {
            throw new UnauthorizedAccessException("Only admins can approve restaurants");
        }
        Restaurant restaurant = getRestaurantById(id);

        restaurant.setStatus(newStatus);

        if (newStatus == AdminStatus.BANNED) {
            restaurant.setOpened(false);
        }

        restaurantRepository.save(restaurant);
        return "Restaurant status updated to " + newStatus;
    }

    @OnlySpecificOwner
    public String uploadImage(Long id, UserDTO owner, MultipartFile file) {
        Restaurant restaurant = getRestaurantById(id);

        String imageUrl = imageService.uploadImage(file);

        restaurant.setImageUrl(imageUrl);

        restaurantRepository.save(restaurant);

        return imageUrl;

    }

    @CheckOwnerAndAdmin
    public void deleteImage(Long id, UserDTO admin) {
        
        Restaurant restaurant = getRestaurantById(id);
        if (restaurant.getImageUrl() != null) {
            imageService.deleteImage(restaurant.getImageUrl());
            restaurant.setImageUrl(null);
            restaurantRepository.save(restaurant);
        }
    }

    public boolean existsById(Long id) {
        return restaurantRepository.existsById(id);
    }

}