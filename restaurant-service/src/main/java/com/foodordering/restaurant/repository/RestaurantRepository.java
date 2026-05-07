package com.foodordering.restaurant.repository;

import com.foodordering.restaurant.enums.AdminStatus;
import com.foodordering.restaurant.models.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByStatus(AdminStatus status);  

    void deleteById(Long id);

    Optional<Restaurant> findByName(String name);

    List<Restaurant> findByNameContainingIgnoreCase(String name);

}