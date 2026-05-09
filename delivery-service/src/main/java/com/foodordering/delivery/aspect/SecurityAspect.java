package com.foodordering.delivery.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class SecurityAspect {

    @Before("within(com.foodordering.delivery.controller..*)")
    public void logSecurityContext(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("User '{}' with roles '{}' accessing: {}",
                    authentication.getName(),
                    authentication.getAuthorities(),
                    joinPoint.getSignature().toShortString());
        }
    }

    @AfterReturning(pointcut = "execution(* com.foodordering.delivery.service.DeliveryService.assignDelivery(..))", returning = "result")
    public void logDeliveryAssignment(JoinPoint joinPoint, Object result) {
        logUserAction("Delivery assigned");
    }

    @AfterReturning(pointcut = "execution(* com.foodordering.delivery.service.DeliveryService.updateDeliveryStatus(..))", returning = "result")
    public void logDeliveryStatusUpdate(JoinPoint joinPoint, Object result) {
        logUserAction("Delivery status updated");
    }

    @AfterReturning(pointcut = "execution(* com.foodordering.delivery.service.DeliveryService.cancelDelivery(..))", returning = "result")
    public void logDeliveryCancellation(JoinPoint joinPoint, Object result) {
        logUserAction("Delivery cancelled");
    }

    private void logUserAction(String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("{} by user: {}", action, authentication.getName());
        }
    }
}
