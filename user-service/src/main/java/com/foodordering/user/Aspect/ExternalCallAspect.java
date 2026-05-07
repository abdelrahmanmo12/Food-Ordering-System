package com.foodordering.user.Aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class ExternalCallAspect {

    private static final Logger logger = LoggerFactory.getLogger(ExternalCallAspect.class);

    @Around("execution(* com.foodordering.user.config.RestaurantClient.*(..))")
    public Object trackInternalCalls(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        logger.info("[INTERNAL CALL] Calling external service: {}", joinPoint.getSignature().getName());
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            logger.info("[INTERNAL CALL] Finished in: {}ms", duration);
            return result;
        } catch (Exception e) {
            logger.error("[INTERNAL CALL] Failed! Error: {}", e.getMessage());
            throw e;
        }
    }
}