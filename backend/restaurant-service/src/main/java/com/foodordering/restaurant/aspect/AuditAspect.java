package com.foodordering.restaurant.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    @AfterReturning(pointcut = "execution(* com.foodordering.restaurant.services.*.add*(..)) || " +
                               "execution(* com.foodordering.restaurant.services.*.update*(..)) || " +
                               "execution(* com.foodordering.restaurant.services.*.delete*(..))")
    public void logAction(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        String userInfo = "Unknown User";
        for (Object arg : args) {
            if (arg instanceof com.foodordering.restaurant.dtos.UserDTO) {
                com.foodordering.restaurant.dtos.UserDTO user = (com.foodordering.restaurant.dtos.UserDTO) arg;
                userInfo = "ID: " + user.getId() + " (" + user.getRole() + ")";
                break;
            }
        }

        logger.info("[AUDIT LOG] Action '{}' was successfully performed by {}", methodName, userInfo);
    }
}