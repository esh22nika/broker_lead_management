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

import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
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
        validateLead(request.getName(), request.getContactEmail(), request.getContactPhone(), request.getSource(), request.getNotes());
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
                                                    @RequestBody UpdateLeadRequest request, Authentication authentication) {
        validateLead(request.getName(), request.getContactEmail(), request.getContactPhone(), request.getSource(), request.getNotes());
        checkStatusPermission(request.getStatus(), authentication);
        return leadService.updateLead(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/leads/{id}/status")
    public ResponseEntity<LeadResponse> updateLeadStatus(@PathVariable Long id,
                                                          @RequestBody Map<String, String> body, Authentication authentication) {
        String status = body.get("status");
        checkStatusPermission(status, authentication);
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return leadService.updateLeadStatus(id, status.trim().toUpperCase(java.util.Locale.ROOT))
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

    private void validateLead(String name, String email, String phone, String source, String notes) {
        if ((name != null && (name.isBlank() || name.length() > 255))
                || (email != null && (email.length() > 255 || (!email.isBlank() && !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))))
                || (phone != null && phone.length() > 255)
                || (source != null && source.length() > 255)
                || (notes != null && notes.length() > 2000)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid lead fields: use a valid email, at most 255 characters per field, and at most 2000 characters for notes");
        }
    }

    private void checkStatusPermission(String status, Authentication authentication) {
        if (status == null) return;
        LeadStatus parsed;
        try { parsed = LeadStatus.valueOf(status.trim().toUpperCase(java.util.Locale.ROOT)); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid lead status"); }
        boolean canClose = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if ((parsed == LeadStatus.CONVERTED || parsed == LeadStatus.LOST) && !canClose) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers and admins can close leads");
        }
    }

}
