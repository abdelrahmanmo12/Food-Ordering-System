package com.foodordering.user.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.foodordering.user.Aspect.Interfaces.AdminOnly;
import com.foodordering.user.Aspect.Interfaces.CheckSameUser;
import com.foodordering.user.Dto.UserDTO;
import com.foodordering.user.Dto.UserProfileDto;
import com.foodordering.user.Dto.UserProfileResponse;
import com.foodordering.user.Dto.UserProfileUpdateRequest;
import com.foodordering.user.Entity.UserProfile;
import com.foodordering.user.Exception.ResourceNotFoundException;
import com.foodordering.user.Repo.UserProfileRepository;
import com.foodordering.user.config.RestaurantClient;

@Service
public class UserService {

    @Autowired
    private UserProfileRepository repository;

    @Autowired
    private RestaurantClient restaurantClient;

    public void saveInitialProfile(UserProfileDto dto) {
        UserProfile profile = new UserProfile();
        profile.setId(dto.getId());
        profile.setFullName(dto.getFullName());
        profile.setType(dto.getType());

        repository.save(profile);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(UserDTO user) {
        Long userId = parseId(user.getId());

        return repository.findById(userId)
                .map(profile -> new UserProfileResponse(
                        profile.getId(),
                        profile.getFullName(),
                        profile.getType(),
                        profile.getAddress(),
                        profile.getPhoneNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + userId + " not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileById(Long id) {
        return repository.findById(id)
                .map(profile -> new UserProfileResponse(
                        profile.getId(),
                        profile.getFullName(),
                        profile.getType(),
                        profile.getAddress(),
                        profile.getPhoneNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + id + " not found"));
    }

    private Long parseId(String id) {
        try {
            return Long.valueOf(id);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }

    @AdminOnly
    public List<UserProfileResponse> getAllProfiles(UserDTO user) {

        return repository.findAll().stream()
                .map(profile -> new UserProfileResponse(profile.getId(), profile.getFullName(), profile.getType(),
                        profile.getAddress(), profile.getPhoneNumber()))
                .toList();
    }

    @Transactional
    @CheckSameUser
    public void updateProfile(Long id, UserDTO user, UserProfileUpdateRequest request) {

        UserProfile dbUserProfile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile with ID " + id + " not found"));

        applyPartialUpdates(dbUserProfile, request);
        repository.save(dbUserProfile);

    }

    @Transactional
    @CheckSameUser
    public void addFavoriteRestaurant(Long id, UserDTO user, Long restaurantId) {

        Boolean exists = restaurantClient.checkRestaurantExists(restaurantId);

        if (exists) {

            UserProfile dbUserProfile = repository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

            if (!dbUserProfile.getFavRestaurants().contains(restaurantId)) {
                dbUserProfile.getFavRestaurants().add(restaurantId);
            }
        } else {
            throw new ResourceNotFoundException("Restaurant does not exist");
        }

    }

    @Transactional
    @CheckSameUser
    public void removeFavoriteRestaurant(Long id, UserDTO user, Long restaurantId) {

        UserProfile dbUserProfile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        dbUserProfile.getFavRestaurants().removeIf(favId -> favId.equals(restaurantId));
    }

    @Transactional(readOnly = true)
    @CheckSameUser
    public List<Long> getFavoriteRestaurants(Long id, UserDTO user) {

        UserProfile dbUserProfile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return dbUserProfile.getFavRestaurants();
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