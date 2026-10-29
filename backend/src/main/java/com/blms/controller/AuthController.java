package com.blms.controller;

import com.blms.dto.CreateUserRequest;
import com.blms.dto.LoginRequest;
import com.blms.dto.LoginResponse;
import com.blms.model.User;
import com.blms.model.UserRole;
import com.blms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Locale;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest,
                                   HttpServletResponse httpResponse) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();

        if (!user.isActive()) {
            return ResponseEntity.status(401).body(Map.of("error", "Account is deactivated"));
        }

        signIn(user, httpRequest, httpResponse);
        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserRequest request, HttpServletRequest httpRequest,
                                      HttpServletResponse httpResponse) {
        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and password are required"));
        }

        if (request.getPassword().length() < 8 || request.getPassword().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72
                || !request.getEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Use a valid email and a password of at least 8 characters (maximum 72 bytes)"));
        }
        if (userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT)).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists"));
        }

        if (request.getRole() != null && !request.getRole().isBlank()
                && !"BROKER".equalsIgnoreCase(request.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Public registration creates broker accounts only"));
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.BROKER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        signIn(saved, httpRequest, httpResponse);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) request.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
        new CookieCsrfTokenRepository().saveToken(null, request, response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @GetMapping("/me")
    public LoginResponse me(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    private void signIn(User user, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) request.changeSessionId();
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(user.getEmail(), null,
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))));
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);
        new CookieCsrfTokenRepository().saveToken(null, request, response);
    }
}
