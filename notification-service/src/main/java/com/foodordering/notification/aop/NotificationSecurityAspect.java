package com.foodordering.notification.aop;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import com.foodordering.notification.Dto.UserDTO;

@Aspect
@Component
public class NotificationSecurityAspect {

    @Before("@annotation(com.foodordering.notification.aop.CheckSameUser) && args(targetUserId, currentUser, ..)")
    public void validateUser(Long targetUserId, UserDTO currentUser) {
        if ("ADMIN".equals(currentUser.getRole())) return;
        
        if (!targetUserId.equals(Long.valueOf(currentUser.getId()))) {
            throw new SecurityException("Access denied: You must be the same user to view or modify these notifications");
        }
        
        System.out.println("AOP: User identity validated for Notification Access ID: " + targetUserId);
    }
}
