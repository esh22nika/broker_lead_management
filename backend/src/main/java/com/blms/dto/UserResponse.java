package com.blms.dto;

import com.blms.model.UserRole;
import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private boolean active;
    private LocalDateTime createdAt;

    public UserResponse(Long id, String name, String email, UserRole role, boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
