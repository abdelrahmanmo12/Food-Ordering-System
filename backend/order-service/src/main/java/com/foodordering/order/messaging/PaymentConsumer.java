package com.foodordering.order.messaging;

import com.foodordering.order.entity.Order;
import com.foodordering.order.entity.OrderStatus;
import com.foodordering.order.repositories.OrderRepository;
import com.foodordering.order.abstracts.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentConsumer {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @KafkaListener(topics = "payment-events-topic", groupId = "order-service-group")
    public void consumePaymentEvent(Map<String, Object> eventData) {
        log.info("Received payment event from Kafka: {}", eventData);

        try {
            String orderId = (String) eventData.get("orderId");
            String status = (String) eventData.get("status");
            String action = (String) eventData.get("action");

            log.info("Processing {} for Order ID: {} with Payment Status: {}", action, orderId, status);

            orderRepository.findById(orderId).ifPresentOrElse(order -> {
                updateOrderStatus(order, status);
                orderRepository.save(order);
                log.info("Order {} successfully updated to {}", orderId, order.getStatus());
                
                orderService.handlePostPayment(order);
            }, () -> log.error("Order not found with ID: {}", orderId));

        } catch (Exception e) {
            log.error("Error processing Kafka message: {}", e.getMessage());
        }
    }

    private void updateOrderStatus(Order order, String paymentStatus) {
        switch (paymentStatus) {
            case "COMPLETED":
                order.setStatus(OrderStatus.PAID);
                break;
            case "FAILED":
            case "CANCELLED":
                order.setStatus(OrderStatus.CANCELLED);
                break;
            case "REFUNDED":
                order.setStatus(OrderStatus.REFUNDED);
                break;
            default:
                log.warn("Unknown payment status received: {}. No status change made.", paymentStatus);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkKafka() {
        log.info(">>>> Kafka Consumer is READY and Listening on topic: payment-events-topic...");
    }
}