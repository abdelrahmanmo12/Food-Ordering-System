package com.foodordering.restaurant.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/restaurants")
public class AdminRestauratnController {

    @GetMapping("/requests/pending")
    public ResponseEntity<?> getPendingRequests(@RequestHeader(value = "Role", required = false) String role) {
        

    }
}
