package com.foodordering.delivery.clients;

import com.foodordering.delivery.dto.OrderDTO;
import com.foodordering.delivery.dto.OrderStatusUpdateRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "order-service")
public interface OrderServiceClient {

    @GetMapping("/api/orders/{orderId}")
    @CircuitBreaker(name = "orderService", fallbackMethod = "getOrderFallback")
    OrderDTO getOrder(@PathVariable String orderId);

    @PatchMapping("/api/orders/{orderId}/status")
    @CircuitBreaker(name = "orderService", fallbackMethod = "updateOrderStatusFallback")
    void updateOrderStatus(@PathVariable String orderId, @RequestBody OrderStatusUpdateRequest request);

    default OrderDTO getOrderFallback(String orderId, Exception e) {
        throw new RuntimeException("Order service is currently unavailable. Please try again later.", e);
    }

    default void updateOrderStatusFallback(String orderId, OrderStatusUpdateRequest request, Exception e) {
        throw new RuntimeException("Order service is currently unavailable for status update. Please try again later.", e);
    }
}
