package com.foodordering.user.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.foodordering.user.Dto.OwnerResponse;
import com.foodordering.user.Entity.OwnerRequest;
import com.foodordering.user.Entity.RequestStatus;
import com.foodordering.user.Exception.RequestAlreadyProcessed;
import com.foodordering.user.Exception.RequestNotFound;
import com.foodordering.user.Repo.OwnerRequestRepo;

import jakarta.transaction.Transactional;

@Service
public class AdminService {

    @Autowired
    OwnerRequestRepo ownerRequestRepo;
    
    @Autowired
    AuthClient userService;
    
    @Transactional
    public OwnerResponse approveRequest(Long requestId) {
        OwnerRequest request = ownerRequestRepo.findById(requestId)
                .orElseThrow(() -> new RequestNotFound("Request not found"));

        if (!request.getStatus().equals(RequestStatus.PENDING)) {
            throw new RequestAlreadyProcessed("Request already processed");
        }

        // try {
            userService.promoteToOwner(request.getUsername());
            
            request.setStatus(RequestStatus.APPROVED);
            ownerRequestRepo.save(request);
            
            return new OwnerResponse(request.getId(), request.getUsername(), "Request Approved");
        // } catch (Exception e) {
        //     throw new RuntimeException("Auth service is unavailable. Please try again later.");
        // }
    }


    public OwnerResponse rejectRequest(Long id) {

        OwnerRequest request = ownerRequestRepo.findById(id)
                .orElseThrow(() -> new RequestNotFound("Request not found"));

        if (!request.getStatus().equals(RequestStatus.PENDING)) {
            throw new RequestAlreadyProcessed("Request already processed");
        }
        request.setStatus(RequestStatus.REJECTED);

        ownerRequestRepo.save(request);

        return new OwnerResponse(request.getId(), request.getUsername(), "Request Rejected");
    }
}