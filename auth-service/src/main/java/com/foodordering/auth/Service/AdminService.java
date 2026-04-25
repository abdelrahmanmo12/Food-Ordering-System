package com.foodordering.auth.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Enum.AccountStatus;
import com.foodordering.auth.Enum.Role;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.Response.PendingAccountResponse;

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

    public void updateStatus(Long id, String statusRequest) {
        user account = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Account ID not found"));

        AccountStatus newStatus = AccountStatus.valueOf(statusRequest.toUpperCase());

        if (newStatus == AccountStatus.ACTIVE) { 
            account.setRole(Role.OWNER);
            account.setStatus(AccountStatus.ACTIVE);
        } else if (newStatus == AccountStatus.BANNED) {
            
            account.setStatus(AccountStatus.BANNED);

        }else if (newStatus == AccountStatus.REJECTED) {
            account.setStatus(AccountStatus.REJECTED);
        }

        userRepo.save(account);
    }
}