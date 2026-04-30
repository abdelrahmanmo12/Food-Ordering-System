package com.foodordering.user.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.user.Dto.OwnerResponse;
import com.foodordering.user.Entity.OwnerRequest;
import com.foodordering.user.Service.AdminService;
import com.foodordering.user.Service.OwnerRequestService;


@RestController
public class AdminController {
    @Autowired
    AdminService adminService;
    @Autowired
    OwnerRequestService ownerRequestService;

     @GetMapping("/admin/owner-requests")
    public List<OwnerRequest> getAll() {
        return ownerRequestService.getAllRequests();
    }

    @PostMapping("/admin/approve/{id}")
    public OwnerResponse approve(@PathVariable Long id) {
        return adminService.approveRequest(id);
    }

    
    @PostMapping("/admin/reject/{id}")
    public OwnerResponse reject(@PathVariable Long id) {
        return adminService.rejectRequest(id);
    }
}