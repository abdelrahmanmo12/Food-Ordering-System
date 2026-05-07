package com.foodordering.order.repositories;

import com.foodordering.order.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCustomerId(String customerId);        // ✅ was findByPhone
    List<Order> findByRestaurantName(String restaurantName);
}