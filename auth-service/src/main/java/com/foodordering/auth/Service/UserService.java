package com.foodordering.auth.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Enum.AccountStatus;
import com.foodordering.auth.Enum.Role;
import com.foodordering.auth.Jwt.JwtService;
import com.foodordering.auth.Repo.RefreshTokenRepo;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.Requests.RegisterRequest;
import com.foodordering.auth.exception.UserNotFoundException;
import com.foodordering.auth.exception.UsernameAlreadyExistsException;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;


@Service
@Validated 
public class UserService {

    @Autowired
    UserRepo userRepo;
    
    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenRepo refreshTokenRepo;

    @Transactional
    public String registerCustomer(@Valid RegisterRequest user) {

        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new UsernameAlreadyExistsException("Email already taken");
        }
        user newUser = new user();
        newUser.setEmail(user.getEmail());
        newUser.setRole(Role.USER);
        newUser.setStatus(AccountStatus.ACTIVE);
        newUser.setPassword(encoder.encode(user.getPassword())); 
        userRepo.save(newUser);

        return "registered";
    }

    @Transactional
    public String registerOwner(@Valid RegisterRequest user) {

        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new UsernameAlreadyExistsException("Email already taken");
        }
        user newUser = new user();
        newUser.setEmail(user.getEmail());
        newUser.setRole(Role.OWNER); 
        newUser.setStatus(AccountStatus.PENDING);
        newUser.setPassword(encoder.encode(user.getPassword())); 
        userRepo.save(newUser);

        return "registered";
    }
    

    public String PromotionToOwner(String email){
        user u = userRepo.findByEmail(email).orElseThrow(()-> new UserNotFoundException("user not found"));
        u.setRole(Role.OWNER);
        userRepo.save(u);
        return "User promoted to OWNER";
    }
}