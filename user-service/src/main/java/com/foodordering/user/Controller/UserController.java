package com.foodordering.user.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.user.Dto.UserProfileResponse;
import com.foodordering.user.Dto.UserProfileUpdateRequest;
import com.foodordering.user.Service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profiles")
    public ResponseEntity<List<UserProfileResponse>> getAllProfiles(@RequestHeader(value = "Authorization", required = false) String token) {
        return ResponseEntity.ok(userService.getAllProfiles(token));
    }

    @GetMapping("/profiles/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        return ResponseEntity.ok(userService.getMyProfile(token));
    }

    @PutMapping("/profiles/{id}")
    public ResponseEntity<Map<String, String>> updateProfile(@PathVariable Long id, @RequestBody UserProfileUpdateRequest request) {
        userService.updateProfile(id, request);

        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    
}