package com.foodordering.auth.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodordering.auth.Entity.RefreshToken;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUsername(String username);
}
