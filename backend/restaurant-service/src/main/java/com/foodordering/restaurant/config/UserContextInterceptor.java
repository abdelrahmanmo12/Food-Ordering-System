package com.foodordering.restaurant.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.foodordering.restaurant.dtos.UserDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class UserContextInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

        System.out.println("=== INTERCEPTOR ===");
        System.out.println("PATH: " + request.getRequestURI());
        System.out.println("THREAD: " + Thread.currentThread().getId());

        String userId = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");
        String status = request.getHeader("X-User-Status");

        System.out.println("UserId: " + userId);
        System.out.println("Role: " + role);

        if (userId != null && role != null) {
            UserDTO user = new UserDTO(userId, role, status);
            UserContext.setUser(user);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
            Exception ex) {
        UserContext.clear();
    }
}