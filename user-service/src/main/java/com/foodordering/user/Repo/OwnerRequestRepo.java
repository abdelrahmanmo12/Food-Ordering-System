package com.foodordering.user.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodordering.user.Entity.OwnerRequest;
import com.foodordering.user.Entity.RequestStatus;



public interface OwnerRequestRepo extends JpaRepository<OwnerRequest,Long>{
    boolean existsByUsernameAndStatus(String username, RequestStatus status);
}