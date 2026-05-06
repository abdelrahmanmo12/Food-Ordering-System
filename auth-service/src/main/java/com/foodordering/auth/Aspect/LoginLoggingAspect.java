package com.foodordering.auth.Aspect;

import com.foodordering.auth.dto.Requests.LoginRequest;
import com.foodordering.auth.dto.Response.LoginResponse;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class LoginLoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoginLoggingAspect.class);

    @AfterReturning(
        pointcut = "execution(* com.foodordering.auth.Service.AuthService.login(..))", 
        returning = "response"
    )
    public void logSuccessfulLogin(JoinPoint joinPoint, Object response) {
        Object[] args = joinPoint.getArgs();
        String username = "Unknown";

        for (Object arg : args) {
            if (arg instanceof LoginRequest) {
                username = ((LoginRequest) arg).getEmail();
                break;
            }
        }

        logger.info("[SECURITY LOG] User '{}' logged in successfully at {}", username, LocalDateTime.now());
        
        if (response instanceof LoginResponse) {
            String token = ((LoginResponse) response).getToken();
            if (token != null && token.length() >= 10) {
                logger.info("[TOKEN GENERATED] ends with: ...{}", token.substring(token.length() - 10));
            }
        }
    }
}