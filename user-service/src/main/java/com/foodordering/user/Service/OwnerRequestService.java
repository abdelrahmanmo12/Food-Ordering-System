package com.foodordering.user.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.foodordering.user.Dto.OwnerResponse;
import com.foodordering.user.Entity.OwnerRequest;
import com.foodordering.user.Entity.RequestStatus;
import com.foodordering.user.Exception.RequestAlreadyPending;
import com.foodordering.user.Repo.OwnerRequestRepo;

@Service
public class OwnerRequestService {

    @Autowired
    OwnerRequestRepo ownerRequestRepo;

    public OwnerResponse requestOwner(String username) {

        boolean exists = ownerRequestRepo.existsByUsernameAndStatus(username, RequestStatus.PENDING);

        if (exists) {
            throw new RequestAlreadyPending("Request already pending");
        }
        

        OwnerRequest request = new OwnerRequest();
        request.setUsername(username);
        request.setStatus(RequestStatus.PENDING);

        ownerRequestRepo.save(request);





        return new OwnerResponse(request.getId(), request.getUsername(), "Request sent successfully" );
    }

    public List<OwnerRequest> getAllRequests() {
        return ownerRequestRepo.findAll();
    }

}