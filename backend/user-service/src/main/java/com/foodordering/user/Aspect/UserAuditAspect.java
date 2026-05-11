package com.foodordering.user.Aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import com.foodordering.user.Dto.UserDTO;

@Aspect
@Component
public class UserAuditAspect {

    @AfterReturning(pointcut = "execution(* com.foodordering.user.Service.*.update*(..)) || " +
                               "execution(* com.foodordering.user.Service.*.add*(..)) || " +
                               "execution(* com.foodordering.user.Service.*.delete*(..)) || " +
                               "execution(* com.foodordering.user.Service.*.remove*(..))")
    public void logUserAction(JoinPoint joinPoint) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        String performerInfo = "Unknown User";
        Long targetId = null;

        for (Object arg : args) {
            if (arg instanceof UserDTO) {
                UserDTO currentUser = (UserDTO) arg;
                performerInfo = "ID: " + currentUser.getId() + " (" + currentUser.getRole() + ")";
            }
            if (arg instanceof Long && targetId == null) {
                targetId = (Long) arg;
            }
        }

        System.out.println(" [USER-AUDIT] Action: '" + methodName + 
                           "' performed by [" + performerInfo + 
                           "] on Target ID: [" + (targetId != null ? targetId : "N/A") + "]");
    }
}