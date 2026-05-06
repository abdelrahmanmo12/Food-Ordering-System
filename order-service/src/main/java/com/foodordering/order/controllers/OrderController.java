package com.foodordering.order.controllers;

import com.foodordering.order.entity.Order;
import com.foodordering.order.kafka.events.OrderPlacedEvent;
import com.foodordering.order.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-placed}")
    private String orderPlacedTopic;

    /**
     * POST /orders
     * Creates a new order and publishes OrderPlacedEvent to Kafka.
     * Requires X-User-Id header (injected by API Gateway).
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order,
            @RequestHeader("X-User-Id") String userId) {

        order.setUserId(userId);
        Order saved = orderRepository.save(order);

        // ── Publish event to Kafka ──────────────────────────────────────────
        OrderPlacedEvent event = new OrderPlacedEvent(
                saved.getId(),
                saved.getUserId(),
                saved.getRestaurantId(),
                saved.getTotalPrice()
        );
        kafkaTemplate.send(orderPlacedTopic, event);
        log.info("[KAFKA] Published OrderPlacedEvent for orderId={}, userId={}", saved.getId(), saved.getUserId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /orders/my
     * Returns all orders for the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(
            @RequestHeader("X-User-Id") String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
