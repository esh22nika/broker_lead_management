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
    private Long assignedBrokerId;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LeadResponse(Long id, String name, String contactPhone, String contactEmail,
            String source, String notes, LeadStatus status, Long assignedBrokerId,
            Long createdBy, Long updatedBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.source = source;
        this.notes = notes;
        this.status = status;
        this.assignedBrokerId = assignedBrokerId;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public String getSource() { return source; }
    public String getNotes() { return notes; }
    public LeadStatus getStatus() { return status; }
    public Long getAssignedBrokerId() { return assignedBrokerId; }
    public Long getCreatedBy() { return createdBy; }
    public Long getUpdatedBy() { return updatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
