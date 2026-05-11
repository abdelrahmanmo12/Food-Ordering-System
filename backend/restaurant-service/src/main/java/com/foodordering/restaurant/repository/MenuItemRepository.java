package com.foodordering.restaurant.repository;

import com.foodordering.restaurant.models.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByCategoryName(String categoryName);
    List<MenuItem> findByDiscountGreaterThan(double discount);
    boolean existsByNameAndRestaurant_Id(String name, Long restaurantId);

    MenuItem findByRestaurantIdAndNameIgnoreCase(Long restaurantId, String name);
    MenuItem findByRestaurantIdAndId(Long restaurantId, Long itemId);

}