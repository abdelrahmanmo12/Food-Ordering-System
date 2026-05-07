package com.foodordering.auth.Aspect;

import feign.FeignException;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class FeignExceptionAspect {

    private static final Logger logger = LoggerFactory.getLogger(FeignExceptionAspect.class);

    @AfterThrowing(pointcut = "execution(* com.foodordering.auth.Service.*.*(..))", throwing = "ex")
    public void handleFeignError(JoinPoint joinPoint, FeignException ex) {
        String methodName = joinPoint.getSignature().getName();
        
        logger.error("[AUTH AOP] Internal call failed in method '{}'. Reason: {}", methodName, ex.getMessage());
        
        throw new RuntimeException("Registration aborted: Could not connect to internal services to setup profile.");
    }
}
