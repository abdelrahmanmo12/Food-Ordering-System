package com.foodordering.order.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.foodordering.order.DTOs.RestaurantDTO;
import com.foodordering.order.DTOs.UserDTO;
import com.foodordering.order.entity.Order;
import com.foodordering.order.exceptions.OrderNotFoundException;
import com.foodordering.order.exceptions.UnauthorizedAccessException;
import com.foodordering.order.repositories.OrderRepository;
import com.foodordering.order.clients.RestaurantClient;

@Aspect
@Component
public class OrderSecurityAspect {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantClient restaurantClient;

    @Before("@annotation(com.foodordering.order.aspect.Interfaces.CheckOwnerAndAdmin) && args(orderNumber, user, ..)")
    public void validateOwnerOrAdmin(JoinPoint joinPoint, String orderNumber, UserDTO user) {
        if ("ADMIN".equals(user.getRole())) {
            return;
        }

        if (!"OWNER".equals(user.getRole()) || !"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedAccessException("Access denied: You must be an ACTIVE OWNER or an ADMIN");
        }

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException(orderNumber));
        
        RestaurantDTO restaurant = null;
        if (order.getRestaurantId() != null) {
            restaurant = restaurantClient.getById(order.getRestaurantId());
        } else if (order.getRestaurantName() != null) {
            restaurant = restaurantClient.getByName(order.getRestaurantName());
        }

        if (restaurant == null || !String.valueOf(restaurant.getOwnerId()).equals(user.getId())) {
            throw new UnauthorizedAccessException("Access denied: You must be the OWNER of this restaurant or an ADMIN");
        }
        
        System.out.println("AOP: Admin/Owner Access Granted for Order");
    }

    @Before("@annotation(com.foodordering.order.aspect.Interfaces.OnlySpecificOwner) && args(restaurantId, user, ..)")
    public void validateSpecificOwner(JoinPoint joinPoint, Long restaurantId, UserDTO user) {
        if (!"OWNER".equals(user.getRole()) || !"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedAccessException("Access denied: You must be an ACTIVE OWNER to perform this action");
        }

        RestaurantDTO restaurant = restaurantClient.getById(restaurantId);
        if (restaurant == null || !String.valueOf(restaurant.getOwnerId()).equals(user.getId())) {
            throw new UnauthorizedAccessException("Access denied: You must be the OWNER of this restaurant");
        }
        
        System.out.println("AOP: Specific Owner Access Granted");
    }

    @Before("@annotation(com.foodordering.order.aspect.Interfaces.AdminOnly) && args(user, ..)")
    public void validateAdminOnly(JoinPoint joinPoint, UserDTO user) {
        if (!"ADMIN".equals(user.getRole())) {
            throw new UnauthorizedAccessException("Access denied: Only ADMINs can perform this action");
        }
        System.out.println("AOP: Admin-only Access Granted");
    }
}
