package com.foodordering.auth.Controller;

import com.foodordering.auth.Service.AuthService;
import com.foodordering.auth.Service.UserService;
import com.foodordering.auth.dto.Requests.LoginRequest;
import com.foodordering.auth.dto.Requests.RefreshRequest;
import com.foodordering.auth.dto.Requests.RegisterRequest;
import com.foodordering.auth.dto.Response.LoginResponse;
import com.foodordering.auth.dto.Response.RefreshTokenResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    UserService userService;

    @Autowired
    AuthService authService;

    @PostMapping("/register/customer")
    public String registerCustomer(@RequestBody @Valid RegisterRequest entity) {
        return userService.registerCustomer(entity);
    }

    @PostMapping("/register/owner")
    public String registerOwner(@RequestBody @Valid RegisterRequest entity) {
        return userService.registerOwner(entity);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest user) {
        return authService.login(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("X-User-Id") String userId) {
        authService.logout(userId);
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/refresh")
    public RefreshTokenResponse refresh(@RequestBody @Valid RefreshRequest request) {
        return authService.refreshToken(request);
    }

    // Kept for manual testing / debug only — gateway no longer calls this
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return authService.validateToken(authHeader);
    }

    // Test endpoint — reads the X-User-* headers injected by the gateway
    // Hit via: GET :8080/auth/test-gateway  with Authorization: Bearer <token>
    @GetMapping("/test-gateway")
    public ResponseEntity<Map<String, String>> testGatewayHeaders(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Status") String status) {

        Map<String, String> response = new HashMap<>();
        response.put("extractedUserId", userId);
        response.put("extractedUserRole", role);
        response.put("extractedUserStatus", status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/make-owner/{email}")
    public String makeOwner(@PathVariable String email) {
        return userService.PromotionToOwner(email);
    }
}
