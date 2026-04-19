package com.foodordering.payment.aspect;

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

    @Before("within(com.foodordering.payment.controller..*)")
    public void logSecurityContext(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("User '{}' with roles '{}' accessing: {}",
                    authentication.getName(),
                    authentication.getAuthorities(),
                    joinPoint.getSignature().toShortString());
        }
    }

    @AfterReturning(pointcut = "execution(* com.foodordering.payment.service.PaymentService.createPaymentIntent(..))", returning = "result")
    public void logPaymentCreation(JoinPoint joinPoint, Object result) {
        logUserAction("Payment Intent created");
    }

    @AfterReturning(pointcut = "execution(* com.foodordering.payment.service.PaymentService.processRefund(..))", returning = "result")
    public void logRefundProcessing(JoinPoint joinPoint, Object result) {
        logUserAction("Refund processed");
    }

    private void logUserAction(String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("{} by user: {}", action, authentication.getName());
        }
    }
}
