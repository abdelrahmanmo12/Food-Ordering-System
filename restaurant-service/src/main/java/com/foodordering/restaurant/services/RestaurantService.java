package com.foodordering.restaurant.services;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.enums.AdminStatus;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private ImageService imageService;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return (Restaurant) restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public Restaurant addRestaurant(Restaurant restaurant, UserDTO owner) {

        authorizeUser(owner, "add a new restaurant");

        try {
            Long id = Long.valueOf(owner.getId());
            restaurant.setOwnerId(id);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid User ID format");
        }

        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(Long id, Restaurant updated, UserDTO owner) {

        authorizeUser(owner, "update this restaurant");

        Restaurant restaurant = getRestaurantById(id);
        if (!"ADMIN".equals(owner.getRole())) {
            isTheSameOwner(restaurant, owner);
        }
        applyRestaurantUpdates(restaurant, updated);

        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id, UserDTO owner) {
        authorizeUser(owner, "delete this restaurant");

        Restaurant restaurant = getRestaurantById(id);

        if (!"ADMIN".equals(owner.getRole())) {
            isTheSameOwner(restaurant, owner);
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
        throw new RuntimeException("Access Denied: You must be an ADMIN or an ACTIVE OWNER to " + message);
    }

    public void isTheSameOwner(Restaurant restaurant, UserDTO owner) {
        if (!owner.getId().equals(String.valueOf(restaurant.getOwnerId()))) {
            throw new RuntimeException("You are not the owner of this restaurant");
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

    public Restaurant toggleOpeningStatus(Long id, UserDTO owner) {
        Restaurant restaurant = getRestaurantById(id);

        authorizeUser(owner, "to toggle this restaurant");

        isTheSameOwner(restaurant, owner);

        if (restaurant.getStatus() != AdminStatus.APPROVED) {
            throw new RuntimeException("You can't toggle it untill the restaurant is approved");
        }

        restaurant.setOpened(!restaurant.isOpened());
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllPendingRestaurants(String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only admins can view pending restaurants");
        }
        List<Restaurant> restaurants = restaurantRepository.findByStatus(AdminStatus.PENDING);
        return restaurants;

    }

    public String updateRestaurantStatus(Long id, String role, AdminStatus newStatus) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only admins can approve restaurants");
        }
        Restaurant restaurant = getRestaurantById(id);

        restaurant.setStatus(newStatus);

        if (newStatus == AdminStatus.BANNED) {
            restaurant.setOpened(false);
        }

        restaurantRepository.save(restaurant);
        return "Restaurant status updated to " + newStatus;
    }

    public String uploadImage(Long id, MultipartFile file, UserDTO owner) {

        if (!"OWNER".equals(owner.getRole())) {
            throw new RuntimeException("Only owners can upload images");
        }
        Restaurant restaurant = getRestaurantById(id);
        isTheSameOwner(restaurant, owner);

        String imageUrl = imageService.uploadImage(file);

        restaurant.setImageUrl(imageUrl);

        restaurantRepository.save(restaurant);

        return imageUrl;

    }



}