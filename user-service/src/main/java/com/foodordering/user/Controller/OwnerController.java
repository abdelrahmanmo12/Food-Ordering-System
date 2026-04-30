package com.foodordering.user.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.user.Dto.OwnerResponse;
import com.foodordering.user.Service.OwnerRequestService;

@RestController
public class OwnerController {
    @Autowired
    OwnerRequestService ownerRequestService;

    @PostMapping("/owner/request")
    public OwnerResponse request(@RequestParam String username) {  
        return ownerRequestService.requestOwner(username);
    }


}