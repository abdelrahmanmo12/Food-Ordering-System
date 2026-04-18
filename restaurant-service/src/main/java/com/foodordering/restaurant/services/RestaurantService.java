package com.foodordering.restaurant.services;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return (Restaurant) restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public Restaurant addRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(Long id, Restaurant updated) {
        Restaurant r = getRestaurantById(id);
        r.setName(updated.getName());
        r.setLocation(updated.getLocation());
        r.setPhone(updated.getPhone());
        return restaurantRepository.save(r);
    }

    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }
}