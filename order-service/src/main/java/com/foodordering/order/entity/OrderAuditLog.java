package com.foodordering.order.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "order_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderAuditLog {
    @Id
    private String id;

    private String orderNumber;
    private String phone;
    private String customerName;
    private String address;
    private String restaurantName;
    private double totalPrice;
    private String status;           // OrderStatus as String
    private String orderSnapshot;    // Full Order serialized as JSON
    private String triggeredBy;      // e.g. "createOrder", "checkout", "updateOrderStatus"
    private LocalDateTime loggedAt;
}
