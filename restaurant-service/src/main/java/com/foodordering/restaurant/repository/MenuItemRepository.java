package com.foodordering.restaurant.repository;

import com.foodordering.restaurant.models.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByDiscountGreaterThan(double discount);
<<<<<<< HEAD
    boolean existsByNameAndRestaurant_Id(String name, Long restaurantId);
=======

    // ✅ Case insensitive
    MenuItem findByRestaurantIdAndNameIgnoreCase(Long restaurantId, String name);
>>>>>>> origin/Order_service
}