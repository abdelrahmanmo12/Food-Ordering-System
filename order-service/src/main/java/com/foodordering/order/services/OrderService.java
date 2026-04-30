// package com.foodordering.order.services;

// import com.foodordering.order.clients.RestaurantClient;
// import com.foodordering.order.entity.Order;
// import com.foodordering.order.repositories.OrderRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// @Service
// public class OrderService {

//     @Autowired
//     OrderRepository orderRepository;

//     @Autowired
//     RestaurantClient restaurantClient;

//     public Order createOrder(Order order) {

//         // call restaurant-service
//         restaurantClient.getRestaurant(order.getRestaurantId());

//         return orderRepository.save(order);
//     }
// }