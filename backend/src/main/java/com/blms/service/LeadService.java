package com.blms.service;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.DashboardSummary;
import com.blms.dto.LeadResponse;
import com.blms.dto.UpdateLeadRequest;
import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import com.blms.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;

    public LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    public LeadResponse createLead(CreateLeadRequest request) {
        Lead lead = new Lead();
        lead.setName(request.getName());
        lead.setContactPhone(request.getContactPhone());
        lead.setContactEmail(request.getContactEmail());
        lead.setSource(request.getSource());
        lead.setNotes(request.getNotes());
        lead.setStatus(LeadStatus.NEW);
        lead.setCreatedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());

        Lead saved = leadRepository.save(lead);
        return toResponse(saved);
    }

    public List<LeadResponse> getAllLeads() {
        return leadRepository.findAll().stream()
                .sorted(Comparator.comparing(Lead::getCreatedAt).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Optional<LeadResponse> getLeadById(Long id) {
        return leadRepository.findById(id).map(this::toResponse);
    }

    public Optional<LeadResponse> updateLead(Long id, UpdateLeadRequest request) {
        return leadRepository.findById(id).map(lead -> {
            if (request.getName() != null && !request.getName().isBlank()) {
                lead.setName(request.getName());
            }
            if (request.getContactPhone() != null) {
                lead.setContactPhone(request.getContactPhone());
            }
            if (request.getContactEmail() != null) {
                lead.setContactEmail(request.getContactEmail());
            }
            if (request.getSource() != null) {
                lead.setSource(request.getSource());
            }
            if (request.getNotes() != null) {
                lead.setNotes(request.getNotes());
            }
            if (request.getStatus() != null) {
                lead.setStatus(LeadStatus.valueOf(request.getStatus()));
            }
            lead.setUpdatedAt(LocalDateTime.now());
            return toResponse(leadRepository.save(lead));
        });
    }

    public List<LeadResponse> searchLeads(String query) {
        return leadRepository.search(query).stream()
                .sorted(Comparator.comparing(Lead::getCreatedAt).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DashboardSummary getDashboardSummary() {
        long total = leadRepository.count();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (LeadStatus status : LeadStatus.values()) {
            counts.put(status.name(), leadRepository.countByStatus(status));
        }
        return new DashboardSummary(total, counts);
    }

    private LeadResponse toResponse(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getName(),
                lead.getContactPhone(),
                lead.getContactEmail(),
                lead.getSource(),
                lead.getNotes(),
                lead.getStatus(),
                lead.getCreatedAt());
    }
}
