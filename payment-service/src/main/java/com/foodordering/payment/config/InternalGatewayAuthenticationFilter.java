package com.foodordering.payment.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Component
public class InternalGatewayAuthenticationFilter extends OncePerRequestFilter {

    @Value("${internal.gateway.secret}")
    private String internalGatewaySecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String internalSecret = request.getHeader("X-Internal-Secret");
        String userId = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");

        if (internalGatewaySecret.equals(internalSecret) && userId != null && role != null) {
            String normalizedRole = normalizeRole(role);
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String normalizeRole(String role) {
        String normalized = role.trim()
                .replace("[", "")
                .replace("]", "")
                .replace("\"", "")
                .toUpperCase(Locale.ROOT);

        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring("ROLE_".length());
        }

        return normalized;
    }
}
