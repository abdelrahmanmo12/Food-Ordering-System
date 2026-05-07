package com.foodordering.order.repositories;

import com.foodordering.order.entity.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByCustomerId(String customerId);     // ✅ was findByPhone
    void deleteByCustomerId(String customerId);             // ✅ was deleteByPhone
}