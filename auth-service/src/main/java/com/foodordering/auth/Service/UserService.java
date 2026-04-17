package com.foodordering.auth.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.AuthResponse;
import com.foodordering.auth.exception.InvalidPasswordException;
import com.foodordering.auth.exception.UserNotFoundException;

@Service
public class UserService {

    @Autowired
    UserRepo Repo;
    
    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtService jwtService;

    @PostMapping("/register")
    public String registerService(@RequestBody user user) {

        user.setPassword(encoder.encode(user.getPassword())); 
        Repo.save(user);

        return "registered";
}

    public AuthResponse loginService(user u){
        user dbUser = Repo.findByUsername(u.getUsername());

        if (dbUser == null) {
            throw new UserNotFoundException("User not found");
        }

        if (!encoder.matches(u.getPassword(), dbUser.getPassword())) {
            throw new InvalidPasswordException("Wrong password");
        }

        String token = jwtService.generateToken(u.getUsername());

        return new AuthResponse("login success", token);
    }
}