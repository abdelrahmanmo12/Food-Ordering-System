package com.foodordering.restaurant.controllers;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping("/restaurants/requests")
public class AdminRestauratController {
    @Autowired
    RestaurantService restaurantService;

    @GetMapping()
    public List<Restaurant> getAllPendingRestaurants(@RequestHeader("X-User-Role") String role) {
        return restaurantService.getAllPendingRestaurants(role);
    }
    
    @PutMapping("/{id}/approve")
    public String approveRestaurant(@PathVariable String id) {
        
        return restaurantService.approveRestaurant(id);
    }   
}
