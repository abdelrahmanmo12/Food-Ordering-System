package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.dtos.RestaurantDTO;
import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getAll() {
        List<RestaurantDTO> restaurants = restaurantService.getAllRestaurants()
                .stream()
                .map(this::convertToDto)
                .toList();
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantDTO> getById(@PathVariable Long id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(convertToDto(restaurant)); 
    }

   @PostMapping
    public ResponseEntity<RestaurantDTO> add(@RequestBody Restaurant restaurant, 
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);
        Restaurant saved = restaurantService.addRestaurant(restaurant, owner);
        return new ResponseEntity<>(convertToDto(saved), org.springframework.http.HttpStatus.CREATED); 
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantDTO> update(@PathVariable Long id, @RequestBody Restaurant restaurant,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);
        Restaurant updated = restaurantService.updateRestaurant(id, restaurant, owner);
        return ResponseEntity.ok(convertToDto(updated)); 
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, 
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);
        restaurantService.deleteRestaurant(id, owner);
        return ResponseEntity.noContent().build(); 
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<RestaurantDTO> toggleStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);
        Restaurant updatedRestaurant = restaurantService.toggleOpeningStatus(id, owner);

        return ResponseEntity.ok(convertToDto(updatedRestaurant)); // Status 200
    }
    @PostMapping("/{id}/image")
    public String uploadRestaurantImage(@PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);

        return restaurantService.uploadImage(id, file, owner);
    }

    private RestaurantDTO convertToDto(Restaurant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setLocation(restaurant.getLocation());
        dto.setPhone(restaurant.getPhone());
        dto.setDescription(restaurant.getDescription());
        dto.setImageUrl(restaurant.getImageUrl());
        dto.setOpened(restaurant.isOpened());
        return dto;
    }
}