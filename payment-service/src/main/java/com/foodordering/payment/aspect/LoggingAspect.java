package com.foodordering.payment.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(com.foodordering.payment.controller..*)")
    public void controllerPackage() {}

    @Pointcut("within(com.foodordering.payment.service..*)")
    public void servicePackage() {}

    @Around("controllerPackage() || servicePackage()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        
        log.info("Entering: {}.{}() with arguments: {}", className, methodName, joinPoint.getArgs());
        
        try {
            Object result = joinPoint.proceed();
            log.info("Exiting: {}.{}() with result: {}", className, methodName, result);
            return result;
        } catch (Exception e) {
            log.error("Exception in {}.{}() with cause: {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}
