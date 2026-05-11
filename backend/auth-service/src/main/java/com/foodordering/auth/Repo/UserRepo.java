package com.foodordering.auth.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.foodordering.auth.Entity.User;
import com.foodordering.auth.Enum.AccountStatus;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
        Optional<User> findByEmail(String email);

        
         List<User> findByStatus(AccountStatus status);
}