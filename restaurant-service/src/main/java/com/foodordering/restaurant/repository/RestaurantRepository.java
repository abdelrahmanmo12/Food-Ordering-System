package com.foodordering.restaurant.repository;

<<<<<<< HEAD
import com.foodordering.restaurant.enums.AdminStatus;
=======
>>>>>>> origin/Order_service
import com.foodordering.restaurant.models.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
<<<<<<< HEAD
@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByStatus(AdminStatus status);   

    void deleteById(Long id);
=======
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

>>>>>>> origin/Order_service
}