package com.foodordering.auth.Service;

import com.foodordering.auth.Entity.user;
import com.foodordering.auth.Enum.AccountStatus;
import com.foodordering.auth.Enum.Role;
import com.foodordering.auth.Jwt.JwtService;
import com.foodordering.auth.Repo.RefreshTokenRepo;
import com.foodordering.auth.Repo.UserRepo;
import com.foodordering.auth.dto.Requests.RegisterRequest;
import com.foodordering.auth.exception.UserNotFoundException;
import com.foodordering.auth.exception.UsernameAlreadyExistsException;
import com.foodordering.auth.kafka.events.UserRegisteredEvent;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@Slf4j
public class UserService {

    @Autowired
    UserRepo userRepo;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenRepo refreshTokenRepo;

    @Autowired
    KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.user-registered}")
    private String userRegisteredTopic;

    @Transactional
    public String registerCustomer(@Valid RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new UsernameAlreadyExistsException("Email already taken");
        }

        user newUser = new user();
        newUser.setEmail(request.getEmail());
        newUser.setRole(Role.USER);
        newUser.setStatus(AccountStatus.ACTIVE);
        newUser.setPassword(encoder.encode(request.getPassword()));
        user saved = userRepo.save(newUser);

        // ── Publish event to Kafka added part from ezzeldeen ──────────────────────────────────────────
        UserRegisteredEvent event = new UserRegisteredEvent(
                String.valueOf(saved.getUser_id()),
                saved.getEmail(),
                saved.getRole().name()
        );
        kafkaTemplate.send(userRegisteredTopic, event);
        log.info("[KAFKA] Published UserRegisteredEvent for userId={}", saved.getUser_id());

        return "registered";
    }

    @Transactional
    public String registerOwner(@Valid RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new UsernameAlreadyExistsException("Email already taken");
        }

        user newUser = new user();
        newUser.setEmail(request.getEmail());
        newUser.setRole(Role.OWNER);
        newUser.setStatus(AccountStatus.PENDING);
        newUser.setPassword(encoder.encode(request.getPassword()));
        user saved = userRepo.save(newUser);

        // ── Publish event to Kafka  added part from ezzeldeen ──────────────────────────────────────────
        UserRegisteredEvent event = new UserRegisteredEvent(
                String.valueOf(saved.getUser_id()),
                saved.getEmail(),
                saved.getRole().name()
        );
        kafkaTemplate.send(userRegisteredTopic, event);
        log.info("[KAFKA] Published UserRegisteredEvent (OWNER) for userId={}", saved.getUser_id());

        return "registered";
    }

    public String PromotionToOwner(String email) {
        user u = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("user not found"));
        u.setRole(Role.OWNER);
        userRepo.save(u);
        return "User promoted to OWNER";
    }
}
