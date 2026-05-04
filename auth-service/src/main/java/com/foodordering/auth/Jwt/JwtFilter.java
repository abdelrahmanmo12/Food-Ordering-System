package com.foodordering.auth.Jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        if (path.contains("/auth/login") || path.contains("/auth/register") || path.contains("/auth/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }

        String internalSecret = request.getHeader("X-Internal-Secret");
        if (!"MySuperSecretKey123".equals(internalSecret)) {
            sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "Direct access forbidden");
            return;
        }

        String userId = request.getHeader("X-User-Id");
        String role   = request.getHeader("X-User-Role");
        // String status = request.getHeader("X-User-Status");

        if (userId != null && role != null) {
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            
            UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String json = String.format(
                "{\"status\": %d, \"error\": \"Authentication Error\", \"message\": \"%s\"}",
                status, message);
        response.getWriter().write(json);
    }
}