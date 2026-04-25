// // package com.foodordering.order.controllers;

// import com.foodordering.order.entity.Order;
// import com.foodordering.order.services.OrderService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/orders")
// public class OrderController {

//     @Autowired
//     OrderService orderService;

//     @PostMapping
//     public Order createOrder(@RequestBody Order order) {
//         return orderService.createOrder(order);
//     }
// }