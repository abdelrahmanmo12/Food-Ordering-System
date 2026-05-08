package com.foodordering.order.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodordering.order.DTOs.OrderCreationResponse;
import com.foodordering.order.DTOs.OrderRequest;
import com.foodordering.order.DTOs.OrderResponse;
import com.foodordering.order.entity.Order;
import com.foodordering.order.entity.OrderAuditLog;
import com.foodordering.order.exceptions.InvalidOrderException;
import com.foodordering.order.repositories.OrderAuditLogRepository;
import com.foodordering.order.repositories.OrderRepository;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
public class OrderAspect {

    private final OrderRepository orderRepository;
    private final OrderAuditLogRepository orderAuditLogRepository;
    private final ObjectMapper objectMapper;

    public OrderAspect(OrderRepository orderRepository, OrderAuditLogRepository orderAuditLogRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.orderAuditLogRepository = orderAuditLogRepository;
        this.objectMapper = objectMapper;
    }

    // ===== A) Reusable Pointcuts =====

    @Pointcut("execution(* com.foodordering.order.services.OrderServiceImpl.*(..))")
    public void allOrderServiceMethods() {}

    @Pointcut("execution(* com.foodordering.order.services.OrderServiceImpl.createOrder(..))")
    public void createOrderMethod() {}

    @Pointcut("execution(* com.foodordering.order.services.OrderServiceImpl.checkout(..))")
    public void checkoutMethod() {}

    @Pointcut("execution(* com.foodordering.order.services.OrderServiceImpl.updateOrderStatus(..))")
    public void updateOrderStatusMethod() {}

    @Pointcut("execution(* com.foodordering.order.services.OrderServiceImpl.cancelOrder(..))")
    public void cancelOrderMethod() {}

    // ===== B) @Before - Log method entry + arguments =====

    @Before("allOrderServiceMethods()")
    public void logMethodEntry(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        log.info(">>> Entering method: [{}] with {} argument(s): {}",
                methodName, args.length, args);
    }

    // ===== C) @AfterReturning - Log return value =====

    @AfterReturning(pointcut = "allOrderServiceMethods()", returning = "result")
    public void logMethodReturn(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        log.info("<<< Method: [{}] returned: {}", methodName, result != null ? result : "void/null");
    }

    // ===== D) @AfterThrowing - Log exceptions =====

    @AfterThrowing(pointcut = "allOrderServiceMethods()", throwing = "exception")
    public void logMethodException(JoinPoint joinPoint, Exception exception) {
        String methodName = joinPoint.getSignature().getName();
        log.error("!!! Exception in method: [{}] - Type: [{}] - Message: {}",
                methodName, exception.getClass().getSimpleName(), exception.getMessage());
    }

    // ===== E) @Around - Measure execution time =====

    @Around("allOrderServiceMethods()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            log.info("⏱ Method: [{}] completed in {} ms", methodName, duration);
            return result;
        } catch (Throwable throwable) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("⏱ Method: [{}] failed after {} ms", methodName, duration);
            throw throwable;
        }
    }

    // ===== F) @AfterReturning - Persist audit log after createOrder =====
    // OrderRequest has: restaurantId, address, paymentMethod, items
    // OrderCreationResponse has: orderId, message

    @AfterReturning(pointcut = "createOrderMethod()", returning = "result")
    public void auditLogAfterCreateOrder(JoinPoint joinPoint, OrderCreationResponse result) {
        try {
            OrderRequest request = (OrderRequest) joinPoint.getArgs()[0];
            Order order = orderRepository.findById(result.getOrderId()).orElse(null);

            String orderSnapshot = serializeToJson(order != null ? order : request);

            OrderAuditLog auditLog = OrderAuditLog.builder()
                    .orderNumber(order != null ? order.getOrderNumber() : "ORD-" + result.getOrderId())
                    .phone(order != null ? order.getPhone() : null)
                    .customerName(order != null ? order.getCustomerName() : null)
                    .address(order != null ? order.getAddress() : request.getAddress())
                    .restaurantName(order != null ? order.getRestaurantName() : String.valueOf(request.getRestaurantId()))
                    .totalPrice(order != null ? order.getTotalPrice() : 0)
                    .status("CREATED")
                    .orderSnapshot(orderSnapshot)
                    .triggeredBy("createOrder")
                    .loggedAt(LocalDateTime.now())
                    .build();

            orderAuditLogRepository.save(auditLog);
            log.info("Audit log saved for createOrder — orderId: {}", result.getOrderId());

        } catch (Exception e) {
            log.error("Failed to save audit log for createOrder: {}", e.getMessage());
        }
    }

    // ===== G) @AfterReturning - Persist audit log after checkout =====
    // checkout(String phone, CheckoutRequest request)
    // CheckoutRequest has: customerName, address
    // OrderResponse has: orderId, orderNumber, restaurantName, totalPrice, status, items

    @AfterReturning(pointcut = "checkoutMethod()", returning = "result")
    public void auditLogAfterCheckout(JoinPoint joinPoint, OrderResponse result) {
        try {
            Order order = orderRepository.findById(result.getOrderId()).orElse(null);

            String orderSnapshot = serializeToJson(result);

            OrderAuditLog auditLog = OrderAuditLog.builder()
                    .orderNumber(result.getOrderNumber())
                    .phone(order != null ? order.getPhone() : null)
                    .customerName(order != null ? order.getCustomerName() : null)
                    .address(order != null ? order.getAddress() : null)
                    .restaurantName(result.getRestaurantName())
                    .totalPrice(result.getTotalPrice())
                    .status(result.getStatus() != null
                            ? result.getStatus().toString()
                            : "UNKNOWN")                           // ✅ from OrderResponse
                    .orderSnapshot(orderSnapshot)
                    .triggeredBy("checkout")
                    .loggedAt(LocalDateTime.now())
                    .build();

            orderAuditLogRepository.save(auditLog);
            log.info("Audit log saved for checkout — orderNumber: {}", result.getOrderNumber());

        } catch (Exception e) {
            log.error("Failed to save audit log for checkout: {}", e.getMessage());
        }
    }

    // ===== H) @AfterReturning - Persist audit log after updateOrderStatus =====
    // updateOrderStatus(String orderNumber, OrderStatus status)
    // OrderResponse has: orderId, orderNumber, restaurantName, totalPrice, status, items

    @AfterReturning(pointcut = "updateOrderStatusMethod()", returning = "result")
    public void auditLogAfterUpdateOrderStatus(JoinPoint joinPoint, OrderResponse result) {
        try {
            String orderNumber = (String) joinPoint.getArgs()[0]; // ✅ args[0]

            String orderSnapshot = serializeToJson(result);

            OrderAuditLog auditLog = OrderAuditLog.builder()
                    .orderNumber(orderNumber)                       // ✅ from args[0]
                    .phone(null)                                    // not available in OrderResponse
                    .customerName(null)                             // not available in OrderResponse
                    .address(null)                                  // not available in OrderResponse
                    .restaurantName(result.getRestaurantName())     // ✅ from OrderResponse
                    .totalPrice(result.getTotalPrice())             // ✅ from OrderResponse
                    .status(result.getStatus() != null
                            ? result.getStatus().toString()
                            : "UNKNOWN")                           // ✅ from OrderResponse
                    .orderSnapshot(orderSnapshot)
                    .triggeredBy("updateOrderStatus")
                    .loggedAt(LocalDateTime.now())
                    .build();

            orderAuditLogRepository.save(auditLog);
            log.info("Audit log saved for updateOrderStatus — orderNumber: {}", orderNumber);

        } catch (Exception e) {
            log.error("Failed to save audit log for updateOrderStatus: {}", e.getMessage());
        }
    }

    // ===== I) @Before - Validate order request before createOrder =====

    @Before("createOrderMethod()")
    public void validateOrderRequest(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof OrderRequest) {
            OrderRequest request = (OrderRequest) args[0];

            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new InvalidOrderException("Order request is invalid: items list is empty or null");
            }

            if (request.getAddress() == null || request.getAddress().isBlank()) {
                throw new InvalidOrderException("Order request is invalid: address is missing");
            }

            if (request.getRestaurantId() == null) {
                throw new InvalidOrderException("Order request is invalid: restaurantId is missing");
            }
        }
    }

    // ===== Helper: Serialize object to JSON safely =====

    private String serializeToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize object to JSON: {}", e.getMessage());
            return "{\"error\": \"serialization failed\"}";
        }
    }
}