package com.foodordering.auth.Jwt;

import io.jsonwebtoken.*;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.foodordering.auth.Entity.user;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    private PrivateKey privateKey;
    private PublicKey publicKey;

    @Value("${jwt.private.key}")
    private String privateKeyStr;

    @Value("${jwt.public.key}")
    private String publicKeyStr;

    @PostConstruct
    public void init() {
        try {
            this.privateKey = KeyUtils.parsePrivateKey(privateKeyStr);
            this.publicKey = KeyUtils.parsePublicKey(publicKeyStr);
            System.out.println(" RSA Keys initialized using KeyUtils!");
        } catch (Exception e) {
            throw new RuntimeException("Critical: Failed to load RSA keys", e);
        }
    }

    public String generateToken(user user) {

        long EXPIRATION = 15 * 60 * 1000;
        try {
            return Jwts.builder()
                    .setSubject(user.getEmail())
                    .claim("userId", user.getUser_id())
                    .claim("role", user.getRole())
                    .claim("status", user.getStatus())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                    .signWith(privateKey, SignatureAlgorithm.RS256)
                    .compact();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Token generation failed: " + e.getMessage());
        }
    }

    public Map<String, Object> validateAndGetClaims(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Claims claims = extractAllClaims(token);

            Object userIdObj = claims.get("userId");
            Long userId = (userIdObj != null) ? Long.parseLong(userIdObj.toString()) : null;

            response.put("isValid", true);
            response.put("role", claims.get("role"));
            response.put("accountId", userId);
            response.put("status", claims.get("status"));
        } catch (Exception e) {
            response.put("isValid", false);
        }
        return response;
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new JwtException("Token expired");
        } catch (Exception e) {
            throw new JwtException("Invalid token");
        }
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String Email) {
        try {
            Claims claims = extractAllClaims(token);
            String extractedEmail = claims.getSubject();
            Date expiration = claims.getExpiration();
            return extractedEmail.equals(Email) && expiration.after(new Date());
        } catch (JwtException e) {
            return false;
        }
    }

    // public boolean isTokenExpired(String token) {
    // return extractAllClaims(token).getExpiration().before(new Date());
    // }
}
