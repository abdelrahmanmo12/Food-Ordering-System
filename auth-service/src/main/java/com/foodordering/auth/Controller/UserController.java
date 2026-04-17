package com.foodordering.auth.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Service.UserService;
import com.foodordering.auth.dto.AuthResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    public String register (@RequestBody user entity) {
        return userService.registerService(entity); 
    }
    

    @PostMapping("/login")
    public AuthResponse login(@RequestBody user user) {
        return userService.loginService(user);
    }
    
    @GetMapping("/test")
    public String test() {
        return "working";
    }

    @GetMapping("/admin/test")
    public String adminTest() {
        return "admin only";
    }

    @GetMapping("/user/test")
    public String userTest() {
        return "user or admin";
    }
}