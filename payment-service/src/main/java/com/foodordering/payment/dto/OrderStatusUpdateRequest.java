package com.foodordering.payment.dto;

import com.foodordering.payment.dto.OrderDTO.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {
    
    private OrderStatus status;
}
