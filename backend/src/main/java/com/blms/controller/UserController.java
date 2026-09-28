package com.blms.controller;

import com.blms.dto.CreateUserRequest;
import com.blms.dto.UpdateUserRequest;
import com.blms.dto.UserResponse;
import com.blms.model.User;
import com.blms.model.UserRole;
import com.blms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()
                || request.getRole() == null || request.getRole().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists"));
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            Optional<User> existing = userRepository.findByEmail(request.getEmail());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Email already in use"));
            }
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt());
    }
}
