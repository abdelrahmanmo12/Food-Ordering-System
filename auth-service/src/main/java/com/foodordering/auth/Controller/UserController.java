package com.foodordering.auth.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.auth.Service.AuthService;
import com.foodordering.auth.Service.UserService;
import com.foodordering.auth.dto.AuthResponse;
import com.foodordering.auth.dto.LoginRequest;
import com.foodordering.auth.dto.RefreshRequest;
import com.foodordering.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    UserService userService;
    
    @Autowired
    AuthService authService;
    

    @PostMapping("/register")
    public String register (@RequestBody @Valid RegisterRequest entity) {
        return userService.registerService(entity); 
    }
    

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest user) {
        return authService.login(user);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
            
        authService.logout(username);
        return ResponseEntity.ok("logged out successfully");

    }
    

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody RefreshRequest request) {
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

    @PostMapping("/make-owner/{username}")
    public String makeOwner(@PathVariable String username) {
        return userService.PromotionToOwner(username);                
    }
    
}