package com.foodordering.auth.Aspect;

import com.foodordering.auth.dto.Requests.LoginRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class FailedLoginAspect {

    private static final Logger logger = LoggerFactory.getLogger(FailedLoginAspect.class);

    @AfterThrowing(
        pointcut = "execution(* com.foodordering.auth.Service.AuthService.login(..))", 
        throwing = "ex"
    )
    public void logFailedLogin(JoinPoint joinPoint, Throwable ex) {
        Object[] args = joinPoint.getArgs();
        String email = "Unknown";

        for (Object arg : args) {
            if (arg instanceof LoginRequest) {
                email = ((LoginRequest) arg).getEmail();
                break;
            }
        }

        logger.error("[SECURITY ALERT] Failed login attempt for email '{}' at {}. Reason: {}", email, LocalDateTime.now(), ex.getMessage());
    }
}
