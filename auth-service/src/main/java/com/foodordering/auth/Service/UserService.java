package com.foodordering.auth.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Repo.UserRepo;

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

    public String loginService(user u){
        user dbUser = Repo.findByUsername(u.getUsername());

        if (dbUser == null) {
            return "user not found";
        }

    if (!encoder.matches(u.getPassword(), dbUser.getPassword())) {
            return "wrong password";
        }

         return jwtService.generateToken(u.getUsername());

    }
}