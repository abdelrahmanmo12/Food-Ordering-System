package com.foodordering.restaurant.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class ServiceExceptionAspect {

    private static final Logger logger = LoggerFactory.getLogger(ServiceExceptionAspect.class);

    @AfterThrowing(pointcut = "execution(* com.foodordering.restaurant.services.*.*(..))", throwing = "ex")
    public void handleServiceException(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        String maskedArgs = maskSensitiveData(args);

        logger.error("[RESTAURANT SERVICE ERROR] Exception in: {}.{}", className, methodName);
        logger.error("[ARGS]: {}", maskedArgs);
        logger.error("[REASON]: {}", ex.getMessage());
    }

    private String maskSensitiveData(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        
        String rawArgs = Arrays.toString(args);
        
        String masked = rawArgs.replaceAll("(?i)(address['\"\\s:=]+)([^,}\\]]+)", "$1***MASKED***");
        
        return masked;
    }
}
