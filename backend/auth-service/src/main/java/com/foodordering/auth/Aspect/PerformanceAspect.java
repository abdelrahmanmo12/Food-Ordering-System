package com.foodordering.auth.Aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class PerformanceAspect {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceAspect.class);

    @Around("execution(* com.foodordering.auth.Service.*.*(..))")
    public Object trackPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        // Proceed with the actual method execution
        Object result = joinPoint.proceed();
        
        long timeTaken = System.currentTimeMillis() - startTime;
        
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        if (timeTaken > 500) {
            logger.warn("[PERFORMANCE ALERT] {}.{} took {}ms! (Needs Optimization)", className, methodName, timeTaken);
        } else {
            logger.info("⏱️ [PERFORMANCE] {}.{} executed in {}ms.", className, methodName, timeTaken);
        }
        
        return result;
    }
}
