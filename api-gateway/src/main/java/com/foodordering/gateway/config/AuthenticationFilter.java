package com.foodordering.gateway.config;

import com.foodordering.gateway.jwt.GatewayJwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private GatewayJwtService jwtService;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            ServerHttpRequest sanitized = exchange.getRequest().mutate()
                    .headers(h -> {
                        h.remove("X-User-Id");
                        h.remove("X-User-Role");
                        h.remove("X-User-Status");
                    })
                    .build();
            exchange = exchange.mutate().request(sanitized).build();

            if (!validator.isSecured.test(exchange.getRequest())) {
                return chain.filter(exchange);
            }

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (!authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid authorization format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            try {
                Claims claims = jwtService.validateAndExtract(token);

                String userId = String.valueOf(claims.get("userId"));
                String role   = String.valueOf(claims.get("role"));
                String status = String.valueOf(claims.get("status"));

                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .headers(h -> h.remove(HttpHeaders.AUTHORIZATION))
                        .header("X-User-Id", userId)
                        .header("X-User-Role", role)
                        .header("X-User-Status", status)
                        .header("X-Internal-Secret", "MySuperSecretKey123")
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (ExpiredJwtException e) {
                return onError(exchange, "Token has expired", HttpStatus.UNAUTHORIZED);
            } catch (JwtException e) {
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            } catch (Exception e) {
                return onError(exchange, "Authentication error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        byte[] bytes = ("{\"error\": \"" + message + "\"}").getBytes();
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }

    public static class Config {
    }
}
