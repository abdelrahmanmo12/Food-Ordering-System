package com.foodordering.order.controllers;

import com.foodordering.order.entity.OrderAuditLog;
import com.foodordering.order.repositories.OrderAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class OrderAuditLogController {

    private final OrderAuditLogRepository orderAuditLogRepository;

    @GetMapping
    public ResponseEntity<List<OrderAuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(orderAuditLogRepository.findAll());
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<OrderAuditLog>> getAuditLogsByPhone(@PathVariable String phone) {
        return ResponseEntity.ok(orderAuditLogRepository.findByPhone(phone));
    }

    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<List<OrderAuditLog>> getAuditLogsByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderAuditLogRepository.findByOrderNumber(orderNumber));
    }
}
