package com.foodordering.payment.service;

import com.foodordering.payment.dto.PaymentResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class PaymentAccessService {

    public void assertCanAccessPayment(PaymentResponse payment, Authentication authentication) {
        if (isAdminOrEmployee(authentication)) {
            return;
        }

        Long currentUserId = currentUserId(authentication);
        if (currentUserId != null && currentUserId.equals(payment.getUserId())) {
            return;
        }

        throw new AccessDeniedException("You can only access your own payments");
    }

    public void assertCanAccessUserPayments(Long userId, Authentication authentication) {
        if (isAdminOrEmployee(authentication)) {
            return;
        }

        Long currentUserId = currentUserId(authentication);
        if (currentUserId != null && currentUserId.equals(userId)) {
            return;
        }

        throw new AccessDeniedException("You can only access your own payment history");
    }

    private boolean isAdminOrEmployee(Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority)
                        || "ROLE_OWNER".equals(authority)
                        || "ROLE_EMPLOYEE".equals(authority));
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
