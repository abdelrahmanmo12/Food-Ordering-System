package com.foodordering.delivery.service;

import com.foodordering.delivery.clients.OrderServiceClient;
import com.foodordering.delivery.dto.DeliveryRequest;
import com.foodordering.delivery.dto.OrderDTO;
import com.foodordering.delivery.exception.InvalidOrderException;
import com.foodordering.delivery.exception.OrderNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderValidationService {

    private final OrderServiceClient orderServiceClient;

    /**
     * Validates that the order exists and is eligible for delivery
     */
    public OrderDTO validateOrderForDelivery(DeliveryRequest request) {
        log.info("Validating order {} for delivery assignment", request.getOrderId());

        try {
            OrderDTO order = orderServiceClient.getOrder(request.getOrderId());
            
            // Check if order exists
            if (order == null) {
                throw new OrderNotFoundException("Order not found with ID: " + request.getOrderId());
            }

            // Check if order is in a valid status for delivery
            String status = order.getStatus();
            if (status != null && 
                !"PENDING".equals(status) && 
                !"CONFIRMED".equals(status) && 
                !"PREPARING".equals(status) &&
                !"READY".equals(status)) {
                throw new InvalidOrderException("Order is not eligible for delivery. Current status: " + status);
            }

            // Check if order already has a delivery assigned (assuming deliveryId might be added later)
            // For now, we'll skip this check as the field doesn't exist
            // if (order.getDeliveryId() != null && !order.getDeliveryId().isEmpty()) {
            //     throw new InvalidOrderException("Order already has a delivery assigned: " + order.getDeliveryId());
            // }

            log.info("Order validation successful for delivery - OrderId: {}, Status: {}", 
                order.getId(), order.getStatus());

            return order;

        } catch (Exception e) {
            log.error("Order validation failed for orderId: {}", request.getOrderId(), e);
            throw e;
        }
    }

    /**
     * Validates that the order exists for status updates
     */
    public OrderDTO validateOrderForStatusUpdate(String orderId) {
        log.info("Validating order {} for delivery status update", orderId);

        try {
            OrderDTO order = orderServiceClient.getOrder(orderId);
            
            if (order == null) {
                throw new OrderNotFoundException("Order not found with ID: " + orderId);
            }

            return order;

        } catch (Exception e) {
            log.error("Order validation failed for orderId: {}", orderId, e);
            throw e;
        }
    }

    /**
     * Checks if a delivery already exists for the given order
     */
    public boolean hasExistingDelivery(String orderId) {
        // This would typically query the delivery repository
        // For now, we'll implement basic logic
        return false;
    }
}
