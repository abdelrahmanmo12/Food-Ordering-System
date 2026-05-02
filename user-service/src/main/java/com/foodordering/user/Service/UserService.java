package com.foodordering.user.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import com.foodordering.user.Dto.UserDTO;
import com.foodordering.user.Dto.UserProfileDto;
import com.foodordering.user.Dto.UserProfileResponse;
import com.foodordering.user.Dto.UserProfileUpdateRequest;
import com.foodordering.user.Entity.FoodCategory;
import com.foodordering.user.Entity.UserProfile;
import com.foodordering.user.Exception.AlreadyExistsException;
import com.foodordering.user.Exception.InvalidCategoryException;
import com.foodordering.user.Exception.ResourceNotFoundException;
import com.foodordering.user.Exception.UnauthorizedActionException;
import com.foodordering.user.Repo.UserProfileRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    @Autowired
    private UserProfileRepository repository;

    public void saveInitialProfile(UserProfileDto dto) {
        UserProfile profile = new UserProfile();
        profile.setId(dto.getId());
        profile.setFullName(dto.getFullName());
        profile.setType(dto.getType());

        repository.save(profile);
    }

    public UserProfileResponse getMyProfile(UserDTO user) {
        Long userId = parseId(user.getId());

        return repository.findById(userId)
                .map(profile -> new UserProfileResponse(
                        profile.getId(),
                        profile.getFullName(),
                        profile.getType(),
                        user.getStatus(),
                        profile.getAddress(),
                        profile.getPhoneNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + userId + " not found"));
    }

    private Long parseId(String id) {
        try {
            return Long.valueOf(id);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }

    public List<UserProfileResponse> getAllProfiles(UserDTO user) {
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedActionException("Access denied: Only admins can view all profiles");
        }

        return repository.findAll().stream()
                .map(profile -> new UserProfileResponse(profile.getId(), profile.getFullName(), profile.getType(),
                        user.getStatus(), profile.getAddress(), profile.getPhoneNumber()))
                .toList();
    }

    @Transactional
    public void updateProfile(Long id, UserProfileUpdateRequest request, UserDTO user) {
        Long userId = parseId(user.getId());

        if (!id.equals(userId)) {
            throw new UnauthorizedActionException("Access denied: You can only update your own profile");
        }

        UserProfile dbUserProfile = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + userId + " not found"));

        applyPartialUpdates(dbUserProfile, request);
        repository.save(dbUserProfile);

    }

    @Transactional
    public void addFavoriteCategory(UserDTO user, String categoryStr) {
        Long userId = parseId(user.getId());

        UserProfile dbUserProfile = repository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + userId + " not found"));

        FoodCategory category;
        try {
            category = FoodCategory.valueOf(categoryStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidCategoryException("Invalid food category: " + categoryStr);
        }
        
        if (!dbUserProfile.getFavCategories().contains(category)) {
            dbUserProfile.getFavCategories().add(category);
            repository.save(dbUserProfile);
        } else {
            throw new AlreadyExistsException("Category " + categoryStr + " is already in your favorites");
        }
    }

    private void applyPartialUpdates(UserProfile userProfile, UserProfileUpdateRequest updated) {
        if (hasValue(updated.getFullName())) {
            userProfile.setFullName(updated.getFullName());
        }
        if (hasValue(updated.getAddress())) {
            userProfile.setAddress(updated.getAddress());
        }
        if (hasValue(updated.getPhone())) {
            userProfile.setPhoneNumber(updated.getPhone());
        }
    }

    private boolean hasValue(String str) {
        return str != null && !str.trim().isEmpty();
    }
}