package com.foodordering.auth.Jwt;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.foodordering.auth.Entity.RefreshToken;
import com.foodordering.auth.Repo.RefreshTokenRepo;
import com.foodordering.auth.exception.InvalidTokenException;
import com.foodordering.auth.exception.RefreshTokenExpiredException;

@Service
public class RefreshTokenService {

    @Autowired
    RefreshTokenRepo repo;

    public String createRefreshToken(String email){

        repo.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        long REFRESH_EXPIRATION = 1000 * 60 * 60 * 24 * 3;
        RefreshToken rt = new RefreshToken();
        rt.setToken(token);
        rt.setEmail(email);
        rt.setExpiryDate(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION));

        repo.save(rt);

        return token;
    }

    public RefreshToken validate(String token){

        RefreshToken rt = repo.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (rt.getExpiryDate().before(new Date())) {
            throw new RefreshTokenExpiredException("Refresh token expired");
        }

        return rt;
    }

    public void deleteByEmail(String email){
        repo.deleteByEmail(email);
    }
}