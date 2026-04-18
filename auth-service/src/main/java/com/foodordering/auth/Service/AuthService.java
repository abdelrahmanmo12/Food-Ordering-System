package com.foodordering.auth.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.foodordering.auth.Entity.RefreshToken;
import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Repo.RefreshTokenRepo;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.AuthResponse;
import com.foodordering.auth.dto.LoginRequest;
import com.foodordering.auth.dto.RefreshRequest;
import com.foodordering.auth.exception.InvalidPasswordException;
import com.foodordering.auth.exception.UserNotFoundException;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    UserRepo userRepo;
 
    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenRepo refreshTokenRepo;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse login(LoginRequest request){

        user dbUser = userRepo.findByUsername(request.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!encoder.matches(request.getPassword(), dbUser.getPassword())) {
            throw new InvalidPasswordException("Wrong password");
        }

        String accessToken = jwtService.generateToken(dbUser);
        String refreshToken = refreshTokenService.createRefreshToken(dbUser.getUsername());

        return new AuthResponse("login success", accessToken, refreshToken);
    }

    @Transactional
    public void logout(String username){
        refreshTokenService.deleteByUsername(username);
    }


    public AuthResponse refreshToken(RefreshRequest request) {

        RefreshToken rt = refreshTokenService.validate(request.getRefreshToken());

        user user = userRepo.findByUsername(rt.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        String newAccessToken = jwtService.generateToken(user);

        return new AuthResponse("refreshed", newAccessToken, null);
    }
}