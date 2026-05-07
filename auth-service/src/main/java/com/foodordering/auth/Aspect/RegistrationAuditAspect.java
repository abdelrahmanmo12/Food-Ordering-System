package com.foodordering.auth.Aspect;

import com.foodordering.auth.dto.Requests.RegisterRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class RegistrationAuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(RegistrationAuditAspect.class);

    @AfterReturning(
        pointcut = "execution(* com.foodordering.auth.Service.UserService.register*(..))"
    )
    public void logSuccessfulRegistration(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        String email = "Unknown";
        
        String roleType = joinPoint.getSignature().getName().replace("register", "").toUpperCase();

        for (Object arg : args) {
            if (arg instanceof RegisterRequest) {
                email = ((RegisterRequest) arg).getEmail();
                break;
            }
        }

        logger.info("[AUDIT LOG] New {} registered with email '{}' at {}", roleType, email, LocalDateTime.now());
    }
}
