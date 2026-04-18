package com.foodordering.auth.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.foodordering.auth.Entity.user;

@Repository
public interface UserRepo extends JpaRepository<user, Long> {
        Optional<user> findByUsername(String username);
}