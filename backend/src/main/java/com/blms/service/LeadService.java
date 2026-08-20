package com.blms.service;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.LeadResponse;
import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import com.blms.repository.LeadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
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