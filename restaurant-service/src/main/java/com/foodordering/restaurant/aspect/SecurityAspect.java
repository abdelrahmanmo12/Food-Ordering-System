package com.foodordering.restaurant.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.foodordering.restaurant.dtos.UserDTO;
import com.foodordering.restaurant.exceptions.ResourceNotFoundException;
import com.foodordering.restaurant.exceptions.UnauthorizedAccessException;
import com.foodordering.restaurant.models.MenuCategory;
import com.foodordering.restaurant.models.MenuItem;
import com.foodordering.restaurant.models.Offer;
import com.foodordering.restaurant.models.Restaurant;
import com.foodordering.restaurant.repository.MenuCategoryRepository;
import com.foodordering.restaurant.repository.MenuItemRepository;
import com.foodordering.restaurant.repository.OfferRepository;
import com.foodordering.restaurant.services.RestaurantService;

@Aspect
@Component
public class SecurityAspect {

    @Autowired
    private RestaurantService restaurantService;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OfferRepository offerRepository;
    @Autowired
    private MenuCategoryRepository menuCategoryRepository;

    @Before("@annotation(com.foodordering.restaurant.aspect.Interfaces.OnlyOwner) && args(user, ..)")
    public void restrictToOwnerOnly(UserDTO user) {

        if (!user.getRole().equals("OWNER")) {
            throw new UnauthorizedAccessException("Access denied: You must be an OWNER to perform this action");
        }
        System.out.println("AOP: Strict Owner Access Granted");
    }

    @Before("@annotation(com.foodordering.restaurant.aspect.Interfaces.CheckOwnerAndAdmin) && args(id, user, ..)")
    public void validateOwnerOrAdmin(JoinPoint joinPoint, Long id, UserDTO user) {
        if (user.getRole().equals("ADMIN"))
            return;

        Long restaurantIdToChecked;

        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        if (className.contains("MenuItemService") && !methodName.equals("addMenuItem")) {
            MenuItem item = menuItemRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
            restaurantIdToChecked = item.getRestaurant().getId();
        } else if (className.contains("OfferService") && !methodName.equals("createOffer")) {
            Offer offer = offerRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
            restaurantIdToChecked = offer.getRestaurant().getId();
        } else if (className.contains("MenuCategoryService") && !methodName.equals("addCategory")) {
            MenuCategory category = menuCategoryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu category not found"));
            restaurantIdToChecked = category.getRestaurant().getId();
        } else {
            restaurantIdToChecked = id;
        }

        Restaurant restaurant = restaurantService.getRestaurantById(restaurantIdToChecked);
        if (!restaurant.getOwnerId().equals(Long.valueOf(user.getId()))) {
            throw new UnauthorizedAccessException(
                    "Access denied: You must be the OWNER of this restaurant or an ADMIN");
        }
    }

    @Before("@annotation(com.foodordering.restaurant.aspect.Interfaces.AdminOnly) && args(user, ..)")
    public void restrictToAdminOnly(UserDTO user) {
        if (!user.getRole().equals("ADMIN")) {
            throw new UnauthorizedAccessException(
                    "Access denied: You must be an ADMIN to perform this action to perform this action");
        }
        System.out.println("AOP: System Admin Access Granted");
    }

    @Before("@annotation(com.foodordering.restaurant.aspect.Interfaces.OnlySpecificOwner) && args(id, user, ..)")
    public void validateSpecificOwner(JoinPoint joinPoint, Long id, UserDTO user) {
        
        if (!user.getRole().equals("OWNER")) {
            throw new UnauthorizedAccessException("Access denied: You must be an OWNER to perform this action");
        }

        Long restaurantIdToChecked;
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();

        if (className.contains("MenuItemService") && !methodName.equals("addMenuItem")) {
            MenuItem item = menuItemRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
            restaurantIdToChecked = item.getRestaurant().getId();
        } else if (className.contains("OfferService") && !methodName.equals("createOffer")) {
            Offer offer = offerRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
            restaurantIdToChecked = offer.getRestaurant().getId();
        } else if (className.contains("MenuCategoryService") && !methodName.equals("addCategory")) {
            MenuCategory category = menuCategoryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu category not found"));
            restaurantIdToChecked = category.getRestaurant().getId();
        } else {
            restaurantIdToChecked = id;
        }

        Restaurant restaurant = restaurantService.getRestaurantById(restaurantIdToChecked);
        if (!restaurant.getOwnerId().equals(Long.valueOf(user.getId()))) {
            throw new UnauthorizedAccessException("Access denied: You must be the OWNER of this restaurant");
        }
    }
}