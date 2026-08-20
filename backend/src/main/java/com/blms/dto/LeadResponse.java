package com.blms.dto;

import com.blms.model.LeadStatus;
import java.time.LocalDateTime;

public class LeadResponse {

    private Long id;
    private String name;
    private String contactPhone;
    private String contactEmail;
    private String source;
    private String notes;
    private LeadStatus status;
    private LocalDateTime createdAt;

    public LeadResponse(Long id, String name, String contactPhone, String contactEmail,
            String source, String notes, LeadStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.source = source;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public String getSource() {
        return source;
    }

    public String getNotes() {
        return notes;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}