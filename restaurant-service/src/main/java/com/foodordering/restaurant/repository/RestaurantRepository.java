package com.foodordering.restaurant.repository;

import com.foodordering.restaurant.models.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findAll();

    Optional<Restaurant> findById(Long id);

    Restaurant save(Restaurant restaurant);

    void deleteById(Long id);

    Optional<Restaurant> findByName(String name);
    // 🔍 search by partial name (LIKE %name%)
    List<Restaurant> findByNameContainingIgnoreCase(String name);

}