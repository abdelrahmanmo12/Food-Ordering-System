package com.foodordering.payment.service.strategy;

import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.entity.Payment;

public interface PaymentStrategy {
    boolean supports(Payment.PaymentMethod method);
    Object process(PaymentRequest request, OrderDTO order);
}
