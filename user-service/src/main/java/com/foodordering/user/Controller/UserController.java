package com.foodordering.user.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.user.Dto.UserDTO;
import com.foodordering.user.Dto.UserProfileDto;
import com.foodordering.user.Dto.UserProfileResponse;
import com.foodordering.user.Dto.UserProfileUpdateRequest;
import com.foodordering.user.Service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/internal/create")
    public ResponseEntity<Void> createProfile(@RequestBody UserProfileDto dto) {
        userService.saveInitialProfile(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/profiles")
    public ResponseEntity<List<UserProfileResponse>> getAllProfiles(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status) {
        UserDTO user = new UserDTO(userId, role, status);
        return ResponseEntity.ok(userService.getAllProfiles(user));
    }

    @GetMapping("/profiles/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status) {

        UserDTO user = new UserDTO(userId, role, status);
        return ResponseEntity.ok(userService.getMyProfile(user));
    }

    @PutMapping("/profiles/{id}")
    public ResponseEntity<Map<String, String>> updateProfile(@PathVariable Long id,
            @RequestBody UserProfileUpdateRequest request,
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status) {

        UserDTO user = new UserDTO(userId, role, status);
        userService.updateProfile(id, user, request);

        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    @PostMapping("/profiles/favourites/{restaurantId}")
    public ResponseEntity<String> addFavoriteRestaurant(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status,
            @PathVariable Long restaurantId) {

        UserDTO user = new UserDTO(userId, role, status);
        userService.addFavoriteRestaurant(Long.valueOf(userId), user, restaurantId);
        return ResponseEntity.ok("Restaurant added to your favorites!");
    }

    @DeleteMapping("/profiles/favourites/{restaurantId}")
    public ResponseEntity<String> removeFavoriteRestaurant(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status,
            @PathVariable Long restaurantId) {

        UserDTO user = new UserDTO(userId, role, status);
        userService.removeFavoriteRestaurant(Long.valueOf(userId), user, restaurantId);
        return ResponseEntity.ok("Restaurant removed from your favorites!");
    }

    @GetMapping("/profiles/favourites")
    public ResponseEntity<List<Long>> getFavoriteRestaurants(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Status") String status) {

        UserDTO user = new UserDTO(userId, role, status);
        return ResponseEntity.ok(userService.getFavoriteRestaurants(Long.valueOf(userId), user));
    }
}