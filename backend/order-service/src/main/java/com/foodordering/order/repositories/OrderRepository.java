package com.foodordering.order.repositories;

import com.foodordering.order.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findAll(); // ✅ Add method to get all orders for debugging
    
    List<Order> findByCustomerId(String customerId); // ✅ Standard method
    
    List<Order> findByRestaurantId(Long restaurantId);
}