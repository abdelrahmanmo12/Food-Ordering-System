package com.foodordering.restaurant.controllers;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public List<Restaurant> getAll() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    @PostMapping
    public Restaurant add(@RequestBody Restaurant restaurant, @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);

        return restaurantService.addRestaurant(restaurant, owner);
    }

    @PutMapping("/{id}")
    public Restaurant update(@PathVariable Long id, @RequestBody Restaurant restaurant,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);

        return restaurantService.updateRestaurant(id, restaurant, owner);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);

        restaurantService.deleteRestaurant(id, owner);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Restaurant> toggleStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        UserDTO owner = new UserDTO(userId, role, status);
        Restaurant updatedRestaurant = restaurantService.toggleOpeningStatus(id, owner);

        return ResponseEntity.ok(updatedRestaurant);
    }
}