package com.foodordering.auth.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.auth.Jwt.JwtService;
import com.foodordering.auth.Service.AuthService;
import com.foodordering.auth.Service.UserService;
import com.foodordering.auth.dto.Requests.LoginRequest;
import com.foodordering.auth.dto.Requests.RefreshRequest;
import com.foodordering.auth.dto.Requests.RegisterRequest;
import com.foodordering.auth.dto.Response.LoginResponse;
import com.foodordering.auth.dto.Response.RefreshTokenResponse;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.http.HttpHeaders;


@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    UserService userService;
    
    @Autowired
    AuthService authService;
    
    @Autowired
    JwtService jwtService;
    

    @PostMapping("/register/customer")
    public String registerCustomer (@RequestBody @Valid RegisterRequest entity) {
        return userService.registerCustomer(entity); 
    }
    
    @PostMapping("/register/owner")
    public String registerOwner (@RequestBody @Valid RegisterRequest entity) {
        return userService.registerOwner(entity); 
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest user) {
        return authService.login(user);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
            
        authService.logout(email);
        return ResponseEntity.ok("logged out successfully");

    }
    

    @PostMapping("/refresh")
    public RefreshTokenResponse refresh(@RequestBody @Valid RefreshRequest request) {
        return authService.refreshToken(request);
    }

    @GetMapping("/admin/test")
    public String adminTest() {
        return "admin only";
    }

    @GetMapping("/user/test")
    public String userTest() {
        return "user or admin";
    }


    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        return authService.validateToken(authHeader);
    }

    @GetMapping("/test-gateway")
    public ResponseEntity<Map<String, String>> testGatewayHeaders(
            @RequestHeader("X-User-Id") String userId, 
            @RequestHeader("X-User-Role") String role) {
        
        Map<String, String> response = new HashMap<>();
        response.put("extractedUserId", userId);
        response.put("extractedUserRole", role);
        return ResponseEntity.ok(response); 
    }
    @PostMapping("/make-owner/{email}")
    public String makeOwner(@PathVariable String email) {
        return userService.PromotionToOwner(email);                
    }
    
}