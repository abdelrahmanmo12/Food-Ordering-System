package com.foodordering.auth.Repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Enum.AccountStatus;



@Repository
public interface UserRepo extends JpaRepository<user, Long> {
        Optional<user> findByEmail(String email);
        
         List<user> findByStatus(AccountStatus status);
}