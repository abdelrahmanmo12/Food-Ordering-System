package com.foodordering.order.repositories;

import com.foodordering.order.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByPhone(String phone);
    List<Order> findByRestaurantName(String restaurantName);
    Optional<Order> findByOrderNumber(String orderNumber);

}