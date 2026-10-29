package com.blms.config;

import com.blms.model.User;
import com.blms.model.UserRole;
import com.blms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @org.springframework.beans.factory.annotation.Value("${blms.demo-data:false}")
    private boolean demoData;

    @org.springframework.beans.factory.annotation.Value("${blms.bootstrap-admin-password:}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${blms.bootstrap-admin-email:admin@blms.com}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        if (!demoData) {
            if (!adminPassword.isBlank() && userRepository.findByEmail(adminEmail).isEmpty()) {
                if (adminPassword.length() < 8 || adminPassword.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
                    throw new IllegalArgumentException("Bootstrap admin password must be at least 8 characters and at most 72 bytes");
                }
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail(adminEmail.trim().toLowerCase(java.util.Locale.ROOT));
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(UserRole.ADMIN);
                admin.setCreatedAt(java.time.LocalDateTime.now());
                userRepository.save(admin);
            }
            return;
        }
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@blms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            admin.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(admin);

            User manager = new User();
            manager.setName("Rajesh Sharma");
            manager.setEmail("manager@blms.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(UserRole.MANAGER);
            manager.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(manager);

            User broker = new User();
            broker.setName("Priya Patel");
            broker.setEmail("broker@blms.com");
            broker.setPassword(passwordEncoder.encode("broker123"));
            broker.setRole(UserRole.BROKER);
            broker.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(broker);
        }
    }
}
