package com.foodordering.auth.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import com.foodordering.auth.Entity.Role;
import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Repo.RefreshTokenRepo;
import com.foodordering.auth.Repo.UserRepo;

import com.foodordering.auth.dto.RegisterRequest;

import com.foodordering.auth.exception.UsernameAlreadyExistsException;


@Service
public class UserService {

    @Autowired
    UserRepo userRepo;
    
    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenRepo refreshTokenRepo;

    public String registerService(@RequestBody RegisterRequest user) {

        if (userRepo.findByUsername(user.getUsername()).isPresent()) {
            throw new UsernameAlreadyExistsException("Username already taken");
        }
        user newUser = new user();
        newUser.setUsername(user.getUsername());
        newUser.setRole(Role.USER); 
        newUser.setPassword(encoder.encode(user.getPassword())); 
        userRepo.save(newUser);

        return "registered";
    }
}