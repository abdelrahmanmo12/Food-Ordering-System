package com.foodordering.user.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodordering.user.Entity.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
}