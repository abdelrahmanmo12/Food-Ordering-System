package com.foodordering.payment.client;

import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.OrderStatusUpdateRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service")
public interface OrderServiceClient {

    @GetMapping("/api/orders/{orderId}")
    @CircuitBreaker(name = "orderService", fallbackMethod = "getOrderFallback")
    OrderDTO getOrder(@PathVariable String orderId);

    @PatchMapping("/api/orders/{orderId}/status")
    @CircuitBreaker(name = "orderService", fallbackMethod = "updateOrderStatusFallback")
    String updateOrderStatus(@PathVariable String orderId, @RequestBody OrderStatusUpdateRequest request);

    default OrderDTO getOrderFallback(String orderId, Exception e) {
        throw new RuntimeException("Order service is currently unavailable. Please try again later.", e);
    }

    default String updateOrderStatusFallback(String orderId, OrderStatusUpdateRequest request, Exception e) {
        throw new RuntimeException("Order service is currently unavailable for status update. Please try again later.", e);
    }
}
