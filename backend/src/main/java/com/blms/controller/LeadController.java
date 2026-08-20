package com.blms.controller;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.LeadResponse;
import com.blms.service.LeadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@RequestBody CreateLeadRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        LeadResponse created = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<LeadResponse>> getLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }
}