package com.blms.controller;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.DashboardSummary;
import com.blms.dto.LeadResponse;
import com.blms.dto.UpdateLeadRequest;
import com.blms.model.LeadStatus;
import com.blms.service.LeadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<List<LeadResponse>> getLeads(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            try {
                LeadStatus ls = LeadStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(leadService.getLeadsByStatus(ls));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
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

    @PatchMapping("/leads/{id}/status")
    public ResponseEntity<LeadResponse> updateLeadStatus(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return leadService.updateLeadStatus(id, status.toUpperCase())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
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

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
