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

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@blms.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            admin.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(admin);

            User manager = new User();
            manager.setName("Mike Manager");
            manager.setEmail("manager@blms.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(UserRole.MANAGER);
            manager.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(manager);

            User broker = new User();
            broker.setName("Sarah Broker");
            broker.setEmail("broker@blms.com");
            broker.setPassword(passwordEncoder.encode("broker123"));
            broker.setRole(UserRole.BROKER);
            broker.setCreatedAt(java.time.LocalDateTime.now());
            userRepository.save(broker);
        }
    }
}
