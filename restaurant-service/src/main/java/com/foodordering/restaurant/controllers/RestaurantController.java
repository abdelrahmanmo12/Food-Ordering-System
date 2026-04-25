package com.foodordering.restaurant.controllers;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.services.RestaurantService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
@RestController
@RequestMapping("/api/restaurants")
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
    public Restaurant add(@RequestBody Restaurant restaurant , @RequestHeader("userId") Long userId) {
        return restaurantService.addRestaurant(restaurant,userId);
    }

    @PutMapping("/{id}")
    public Restaurant update(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        return restaurantService.updateRestaurant(id, restaurant);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
    }
}