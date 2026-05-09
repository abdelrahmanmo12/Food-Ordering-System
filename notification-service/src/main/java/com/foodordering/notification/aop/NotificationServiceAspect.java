package com.foodordering.notification.aop;

import com.foodordering.notification.Dto.NotificationRequest;
import com.foodordering.notification.exception.InvalidNotificationRequestException;
import com.foodordering.notification.exception.NotificationProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Aspect
@Component
public class NotificationServiceAspect {

    @Before("execution(* com.foodordering.notification.service.NotificationService.*(..))")
    public void validateInputs(JoinPoint joinPoint) {
        for (Object arg : joinPoint.getArgs()) {
            if (arg == null) {
                throw new InvalidNotificationRequestException("Required parameters cannot be null");
            }
            if (arg instanceof NotificationRequest) {
                NotificationRequest request = (NotificationRequest) arg;
                if (request.getUserId() == null) {
                    throw new InvalidNotificationRequestException("Notification request userId cannot be null");
                }
            }
        }
    }

    @Around("execution(* com.foodordering.notification.service.NotificationService.*(..))")
    public Object handleExceptionsAndLogging(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        
        try {
            Object result = joinPoint.proceed();
            log.info("Successfully executed NotificationService.{}", methodName);
            return result;
        } catch (InvalidNotificationRequestException | IllegalArgumentException | SecurityException e) {
            throw e; // Let standard validation exceptions bubble up natively
        } catch (Exception e) {
            log.error("Error executing NotificationService.{} with args {}: {}", methodName, Arrays.toString(joinPoint.getArgs()), e.getMessage(), e);
            throw new NotificationProcessingException("Failed to execute " + methodName, e);
        }
    }
}
