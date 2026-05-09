package com.foodordering.delivery.config;

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

import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@Slf4j
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
            log.info("Authenticating request from Gateway - UserId: {}, Role: {}", userId, role);
            String[] roles = role.replace("[", "").replace("]", "").replace("\"", "").split(",");
            
            List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                    .map(String::trim)
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase(Locale.ROOT))
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Assigned authorities: {}", authorities);
        } else if (internalSecret != null) {
            log.warn("Invalid Gateway secret or missing user info");
        }

        filterChain.doFilter(request, response);
    }

}
