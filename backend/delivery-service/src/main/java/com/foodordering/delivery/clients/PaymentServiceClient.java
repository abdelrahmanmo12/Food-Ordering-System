package com.foodordering.delivery.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "payment-service")
public interface PaymentServiceClient {

    @GetMapping("/api/payments/order/{orderId}")
    Object getPaymentsByOrderId(@PathVariable String orderId);
}
