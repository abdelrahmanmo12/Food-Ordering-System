package com.foodordering.user.Aspect;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import com.foodordering.user.Dto.UserDTO;
import com.foodordering.user.Exception.UnauthorizedActionException;

@Aspect
@Component
public class UserSecurityAspect {

    @Before("@annotation(com.foodordering.user.Aspect.Interfaces.CheckSameUser) && args(targetUserId, currentUser, ..)")
    public void validateUser(Long targetUserId, UserDTO currentUser) {
        
        if (currentUser.getRole().equals("ADMIN")) return;

        if (!targetUserId.equals(Long.valueOf(currentUser.getId()))) {
            throw new UnauthorizedActionException("Access denied: You must be the same user to perform this action");
        }
        
        System.out.println("AOP: User identity validated for ID: " + targetUserId);
    }

    @Before("@annotation(com.foodordering.user.Aspect.Interfaces.AdminOnly) && args(user, ..)")
    public void restrictToAdminOnly(UserDTO user) {
        if (!"ADMIN".equals(user.getRole())) {
            throw new UnauthorizedActionException("Access denied: You must be an ADMIN to perform this action");
        }
        System.out.println("AOP: Admin access granted");
    }
}