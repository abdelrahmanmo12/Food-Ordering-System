package com.foodordering.auth.Controller;

import com.foodordering.auth.Service.AuthService;
import com.foodordering.auth.Service.UserService;
import com.foodordering.auth.dto.Requests.ChangePasswordRequest;
import com.foodordering.auth.dto.Requests.LoginRequest;
import com.foodordering.auth.dto.Requests.RefreshRequest;
import com.foodordering.auth.dto.Requests.RegisterRequest;
import com.foodordering.auth.dto.Response.LoginResponse;
import com.foodordering.auth.dto.Response.RefreshTokenResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/register/delivery")
    public String registerDelivery(@RequestBody @Valid RegisterRequest entity) {
        return userService.registerDelivery(entity);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest user) {
        return authService.login(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("X-User-Id") String userId) {
        authService.logout(userId);
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/refresh")
    public RefreshTokenResponse refresh(@RequestBody @Valid RefreshRequest request) {
        return authService.refreshToken(request);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @RequestHeader("X-User-Id") String userId) {

        String responseMessage = userService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", responseMessage));
    }

}
