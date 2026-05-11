package com.foodordering.order.clients;

import com.foodordering.order.DTOs.PaymentRequest;
import com.foodordering.order.DTOs.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/api/payments")
    PaymentResponse createPayment(@RequestBody PaymentRequest request);

    @GetMapping("/api/payments/order/{orderId}")
    java.util.List<PaymentResponse> getPaymentsByOrderId(@PathVariable String orderId);

    @GetMapping("/api/payments/user/{userId}")
    java.util.List<PaymentResponse> getPaymentsByUserId(@PathVariable String userId);
}
