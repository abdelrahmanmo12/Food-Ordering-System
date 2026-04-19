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

    // ✅ Case insensitive
    MenuItem findByRestaurantIdAndNameIgnoreCase(Long restaurantId, String name);
}