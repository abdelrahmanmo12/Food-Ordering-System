package com.foodordering.payment.service;

import java.math.BigDecimal;
import com.foodordering.payment.client.OrderServiceClient;
import com.foodordering.payment.dto.OrderDTO;
import com.foodordering.payment.dto.PaymentRequest;
import com.foodordering.payment.exception.InvalidOrderException;
import com.foodordering.payment.exception.OrderNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderValidationService {

    private final OrderServiceClient orderServiceClient;

    
    public OrderDTO validateOrderForPayment(PaymentRequest request, Long currentUserId) {
        log.info("Validating order {} for payment by user {}", request.getOrderId(), currentUserId);

        try {
            OrderDTO order = orderServiceClient.getOrder(request.getOrderId());
            
            // Check if order exists
            if (order == null) {
                throw new OrderNotFoundException("Order not found with ID: " + request.getOrderId());
            }

            // Check if user owns the order
            if (!order.getUserId().equals(currentUserId.toString())) {
                throw new InvalidOrderException("You can only pay for your own orders");
            }

            // Check if order is in a valid status for payment
            if (order.getStatus() != OrderDTO.OrderStatus.PENDING && 
                order.getStatus() != OrderDTO.OrderStatus.CONFIRMED) {
                throw new InvalidOrderException("Order is not eligible for payment. Current status: " + order.getStatus());
            }

            // Check if payment amount matches order total
            // Convert payment amount from cents to dollars for comparison
            BigDecimal paymentAmountInDollars = request.getAmount().divide(new BigDecimal("100"));
            if (paymentAmountInDollars.compareTo(order.getTotalAmount()) != 0) {
                throw new InvalidOrderException("Payment amount (" + paymentAmountInDollars + 
                    ") does not match order total (" + order.getTotalAmount() + ")");
            }

            log.info("Order validation successful - OrderId: {}, UserId: {}, Amount: {}", 
                order.getId(), order.getUserId(), order.getTotalAmount());

            return order;

        } catch (Exception e) {
            log.error("Order validation failed for orderId: {}, userId: {}", request.getOrderId(), currentUserId, e);
            throw e;
        }
    }

    
    public boolean hasExistingPayment(String orderId) {
        // This would typically query the payment repository
        // For now, we'll implement basic logic
        return false;
    }
}
