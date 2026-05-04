package com.foodordering.auth.Service;

import com.foodordering.auth.Entity.RefreshToken;
import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Enum.AccountStatus;
import com.foodordering.auth.Enum.Role;
import com.foodordering.auth.Jwt.JwtService;
import com.foodordering.auth.Jwt.RefreshTokenService;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.Requests.LoginRequest;
import com.foodordering.auth.dto.Requests.RefreshRequest;
import com.foodordering.auth.dto.Response.LoginResponse;
import com.foodordering.auth.dto.Response.RefreshTokenResponse;
import com.foodordering.auth.dto.Response.ValidationResponse;
import com.foodordering.auth.exception.UserNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    @Autowired
    UserRepo userRepo;

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        user dbUser = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (dbUser.getStatus() == AccountStatus.BANNED) {
            throw new DisabledException("Account is banned");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Incorrect email or password");
        } catch (DisabledException e) {
            throw new RuntimeException("Your account is currently disabled");
        }

        String accessToken = jwtService.generateToken(dbUser);
        String refreshToken = refreshTokenService.createRefreshToken(dbUser.getEmail());

        if (dbUser.getStatus() == AccountStatus.REJECTED) {
            return new LoginResponse(accessToken, dbUser.getRole().name(), dbUser.getUser_id(), refreshToken,
                    "SHOW_REJECTION_AND_EDIT");
        }

        if (dbUser.getRole() == Role.OWNER && dbUser.getStatus() == AccountStatus.PENDING) {
            return new LoginResponse(accessToken, dbUser.getRole().name(), dbUser.getUser_id(), refreshToken,
                    "GO_TO_COMPLETE_PROFILE");
        }

        return new LoginResponse(accessToken, dbUser.getRole().name(), dbUser.getUser_id(), refreshToken,
                "Login Successful");
    }

    @Transactional
    public void logout(String userId) {
        user dbUser = userRepo.findById(Long.parseLong(userId))
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        refreshTokenService.deleteByEmail(dbUser.getEmail());
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshRequest request) {
        RefreshToken rt = refreshTokenService.validate(request.getRefreshToken());

        user user = userRepo.findByEmail(rt.getEmail())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = jwtService.generateToken(user);
        return new RefreshTokenResponse(request.getRefreshToken(), newAccessToken);
    }

    // Kept for manual/debug use — gateway no longer calls this endpoint
    public ResponseEntity<?> validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Header");
        }

        String token = authHeader.substring(7);
        Map<String, Object> result = jwtService.validateAndGetClaims(token);

        if (!(boolean) result.get("isValid")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", 401, "message", "Invalid token"));
        }

        return ResponseEntity.ok(new ValidationResponse(
                (boolean) result.get("isValid"),
                (String) result.get("role"),
                (String) result.get("status"),
                (Long) result.get("accountId")
        ));
    }
}
