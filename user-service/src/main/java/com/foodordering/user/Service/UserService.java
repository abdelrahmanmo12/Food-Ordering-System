package com.foodordering.user.Service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

import com.foodordering.user.Dto.UserProfileResponse;
import com.foodordering.user.Dto.UserProfileUpdateRequest;
import com.foodordering.user.Exception.AccessDeniedException;
import com.foodordering.user.Exception.InvalidTokenException;
import com.foodordering.user.Exception.ProfileNotFoundException;

@Service
public class UserService {

    public UserProfileResponse getMyProfile(String token) {
        // Check if the token exists and is correctly formatted
        if (token == null || !token.startsWith("Bearer ")) {
            throw new InvalidTokenException("Invalid token");
        }
        
        // TODO: Validate the token using a JWT utility or by calling the auth-service.
        // String jwt = token.substring(7);
        // String email = jwtUtil.extractEmail(jwt);
        // User user = userRepository.findByEmail(email);

        // Returning the mocked success response for now
        return new UserProfileResponse(1L, "John Doe", "CUSTOMER");
    }

    public List<UserProfileResponse> getAllProfiles(String token) {
        // Check if the token exists and is correctly formatted
        if (token == null || !token.startsWith("Bearer ")) {
            throw new InvalidTokenException("Invalid token");
        }
        
        // TODO: Validate the token and ensure the user has the 'ADMIN' role.
        // String role = jwtUtil.extractRole(jwt);
        // if (!"ADMIN".equals(role)) {
        //     throw new AccessDeniedException("Access denied");
        // }

        return Arrays.asList(new UserProfileResponse(1L, "John", "CUSTOMER"));
    }

    public void updateProfile(Long id, UserProfileUpdateRequest request) {
        // TODO: Find the profile in the database by id
        // For now, we mock the not found scenario if id is a specific value (e.g. <= 0)
        if (id == null || id <= 0) {
            throw new ProfileNotFoundException("Profile ID does not exist");
        }
        // TODO: Update the profile with request.getFullName() and request.getPhone()
    }
}