package com.foodordering.auth.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.auth.Service.AdminService;
import com.foodordering.auth.dto.Requests.StatusUpdateRequest;
import com.foodordering.auth.dto.Response.PendingAccountResponse;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/auth/accounts")
@PreAuthorize("hasRole('ADMIN')") 
public class AdminController {

    @Autowired
    private AdminService adminService;

    

    @GetMapping("/pending")
    public ResponseEntity<List<PendingAccountResponse>> getPendingAccounts() {
        List<PendingAccountResponse> pending = adminService.getPendingAccounts();
        return ResponseEntity.ok(pending);
    }
    
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAccountStatus(
            @PathVariable Long id, 
            @RequestBody StatusUpdateRequest request) {
        
        adminService.updateStatus(id, request.getStatus());
        
        return ResponseEntity.ok(Map.of("message", "Account status updated successfully"));
    }

}