package com.foodordering.auth.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.foodordering.auth.Entity.User;
import com.foodordering.auth.Enum.AccountStatus;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.Response.PendingAccountResponse;
import com.foodordering.auth.exception.InvalidStatusException;
import com.foodordering.auth.exception.UserNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class AdminService {

    @Autowired
    private UserRepo userRepo;

    public List<PendingAccountResponse> getPendingAccounts() {
        return userRepo.findByStatus(AccountStatus.PENDING)
                .stream()
                .map(account -> new PendingAccountResponse(
                        account.getUser_id(),
                        account.getEmail(),
                        account.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateStatus(Long id, String statusRequest) {
        User account = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Account ID not found"));

        try {
            account.setStatus(AccountStatus.valueOf(statusRequest.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new InvalidStatusException("Invalid status: " + statusRequest);
        }

        userRepo.save(account);
    }
}