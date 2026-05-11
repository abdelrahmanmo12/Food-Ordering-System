package com.foodordering.delivery.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Value("${internal.gateway.secret}")
    private String internalGatewaySecret;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Forward the internal secret
                requestTemplate.header("X-Internal-Secret", internalGatewaySecret);
                
                // Forward User ID and Role from the current request
                String userId = request.getHeader("X-User-Id");
                String userRole = request.getHeader("X-User-Role");
                
                if (userId != null) {
                    requestTemplate.header("X-User-Id", userId);
                }
                if (userRole != null) {
                    requestTemplate.header("X-User-Role", userRole);
                }
            } else {
                // If no request context (e.g. background task), still send the secret
                requestTemplate.header("X-Internal-Secret", internalGatewaySecret);
            }
        };
    }
}
