package com.foodordering.gateway.config;

import com.foodordering.gateway.dto.ValidationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private WebClient.Builder webClientBuilder;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (validator.isSecured.test(exchange.getRequest())) {

                // FIX 1: was "throw new RuntimeException" in reactive context — must return Mono with 401 response
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

                return webClientBuilder.build()
                        .post()
                        .uri("http://AUTH-SERVICE/auth/validate")
                        .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .retrieve()
                        .bodyToMono(ValidationResponse.class)
                        .flatMap(response -> {

                            if (response == null || !response.isValid()) {
                                return onError(exchange, "Unauthorized access to application", HttpStatus.UNAUTHORIZED);
                            }
                            System.out.println("DEBUG: Role from Auth: " + response.getRole());
                            System.out.println("DEBUG: AccountID from Auth: " + response.getAccountId());
                            System.out.println("DEBUG: Status from Auth: " + response.getStatus());

                            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                    .headers(headers -> headers.remove(HttpHeaders.AUTHORIZATION))
                                    .header("X-User-Id", String.valueOf(response.getAccountId()))
                                    .header("X-User-Role", response.getRole())
                                    .header("X-User-Status", response.getStatus())
                                    .build();

                            System.out.println("Headers added successfully!");
                            return chain.filter(exchange.mutate().request(modifiedRequest).build());
                        })
                        .onErrorResume(e -> {
                            System.err.println("Auth validation error: " + e.getMessage());
                            return onError(exchange, "Unauthorized: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
                        });
            }
            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        var buffer = response.bufferFactory()
                .wrap(("{\"error\": \"" + message + "\"}").getBytes());
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}
