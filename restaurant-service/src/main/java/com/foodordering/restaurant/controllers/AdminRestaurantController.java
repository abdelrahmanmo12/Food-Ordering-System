package com.foodordering.restaurant.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.restaurant.enums.AdminStatus;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/restaurants/admin/requests")
public class AdminRestaurantController {
    @Autowired
    RestaurantService restaurantService;

    @GetMapping()
    public List<Restaurant> getAllPendingRestaurants(@RequestHeader("X-User-Role") String role) {
        return restaurantService.getAllPendingRestaurants(role);
    }

    @PatchMapping("/{id}/status")
    public String updateRestaurantStatus(@PathVariable Long id,
            @RequestHeader("X-User-Role") String role,
            @RequestParam AdminStatus status) {

        return restaurantService.updateRestaurantStatus(id, role,status);
    }
}
