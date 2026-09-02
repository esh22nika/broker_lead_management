package com.blms.controller;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.DashboardSummary;
import com.blms.dto.LeadResponse;
import com.blms.dto.UpdateLeadRequest;
import com.blms.service.LeadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/leads")
    public ResponseEntity<LeadResponse> createLead(@RequestBody CreateLeadRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        LeadResponse created = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/leads")
    public ResponseEntity<List<LeadResponse>> getLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    @GetMapping("/leads/{id}")
    public ResponseEntity<LeadResponse> getLead(@PathVariable Long id) {
        return leadService.getLeadById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/leads/{id}")
    public ResponseEntity<LeadResponse> updateLead(@PathVariable Long id,
                                                    @RequestBody UpdateLeadRequest request) {
        return leadService.updateLead(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/leads/search")
    public ResponseEntity<List<LeadResponse>> searchLeads(@RequestParam String q) {
        return ResponseEntity.ok(leadService.searchLeads(q));
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id) {
        if (leadService.deleteLead(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(leadService.getDashboardSummary());
    }
}
