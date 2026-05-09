package com.foodordering.delivery.service;

import com.foodordering.delivery.dto.DeliveryResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class DeliveryAccessService {

    public void assertCanAccessDelivery(DeliveryResponse delivery, Authentication authentication) {
        if (isAdminOrOwner(authentication)) {
            return;
        }

        Long currentUserId = currentUserId(authentication);
        if (currentUserId != null && currentUserId.toString().equals(delivery.getCustomerId())) {
            return;
        }

        // Check if user is the delivery person assigned
        if (currentUserId != null && currentUserId.equals(delivery.getDeliveryPersonId())) {
            return;
        }

        throw new AccessDeniedException("You can only access your own deliveries or deliveries assigned to you");
    }

    public void assertCanAccessUserDeliveries(Object userId, Authentication authentication) {
        if (isAdminOrOwner(authentication)) {
            return;
        }

        Long currentUserId = currentUserId(authentication);
        if (currentUserId != null && currentUserId.toString().equals(userId.toString())) {
            return;
        }

        throw new AccessDeniedException("You can only access your own delivery history");
    }

    public void assertCanManageDeliveries(Authentication authentication) {
        if (!isAdminOrOwner(authentication)) {
            throw new AccessDeniedException("Only admins and owners can manage deliveries");
        }
    }

    public void assertCanUpdateDeliveryStatus(Authentication authentication) {
        if (isAdminOrOwner(authentication)) {
            return;
        }

        if (isDeliveryPerson(authentication)) {
            return;
        }

        throw new AccessDeniedException("Only admins, owners, and delivery persons can update delivery status");
    }

    private boolean isAdminOrOwner(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority)
                        || "ROLE_OWNER".equals(authority));
    }

    private boolean isDeliveryPerson(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_DELIVERY"::equals);
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            Object userId = jwt.getClaim("userId");
            return parseUserId(userId);
        }

        return parseUserId(authentication.getName());
    }

    private Long parseUserId(Object userId) {
        if (userId == null) {
            return null;
        }

        try {
            return Long.parseLong(userId.toString());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
