package com.foodordering.order.repositories;

import com.foodordering.order.entity.OrderAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderAuditLogRepository extends MongoRepository<OrderAuditLog, String> {
    List<OrderAuditLog> findByPhone(String phone);
    List<OrderAuditLog> findByOrderNumber(String orderNumber);
}
