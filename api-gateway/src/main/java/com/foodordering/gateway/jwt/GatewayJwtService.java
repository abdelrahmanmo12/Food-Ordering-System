package com.foodordering.gateway.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class GatewayJwtService {

    @Value("${jwt.public.key}")
    private String publicKeyStr;

    private PublicKey publicKey;

    @PostConstruct
    public void init() throws Exception {
        String clean = publicKeyStr.replaceAll("\\s", "");
        byte[] encoded = Base64.getDecoder().decode(clean);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        this.publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
        System.out.println("Gateway RSA public key loaded successfully.");
    }


    public Claims validateAndExtract(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
