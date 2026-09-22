package com.blms.service;

import com.blms.dto.CreateLeadRequest;
import com.blms.dto.DashboardSummary;
import com.blms.dto.LeadResponse;
import com.blms.dto.UpdateLeadRequest;
import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import com.blms.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LeadService - Unit Tests")
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @InjectMocks
    private LeadService leadService;

    private Lead sampleLead;

    @BeforeEach
    void setUp() {
        sampleLead = new Lead();
        sampleLead.setId(1L);
        sampleLead.setName("John Doe");
        sampleLead.setContactPhone("1234567890");
        sampleLead.setContactEmail("john@example.com");
        sampleLead.setSource("Website");
        sampleLead.setNotes("Test lead");
        sampleLead.setStatus(LeadStatus.NEW);
        sampleLead.setCreatedAt(LocalDateTime.now());
        sampleLead.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("createLead sets status to NEW and saves")
    void createLead() {
        CreateLeadRequest request = new CreateLeadRequest();
        request.setName("John Doe");
        request.setContactEmail("john@example.com");

        when(leadRepository.save(any(Lead.class))).thenReturn(sampleLead);

        LeadResponse response = leadService.createLead(request);

        assertNotNull(response);
        assertEquals("John Doe", response.getName());
        assertEquals(LeadStatus.NEW, response.getStatus());
        verify(leadRepository).save(any(Lead.class));
    }

    @Test
    @DisplayName("getAllLeads returns sorted list")
    void getAllLeads() {
        Lead lead2 = new Lead();
        lead2.setId(2L);
        lead2.setName("Jane Smith");
        lead2.setStatus(LeadStatus.CONTACTED);
        lead2.setCreatedAt(LocalDateTime.now().plusHours(1));
        lead2.setUpdatedAt(LocalDateTime.now());

        when(leadRepository.findAll()).thenReturn(List.of(sampleLead, lead2));

        List<LeadResponse> result = leadService.getAllLeads();

        assertEquals(2, result.size());
        assertEquals("Jane Smith", result.get(0).getName());
    }

    @Test
    @DisplayName("getLeadById returns lead when found")
    void getLeadByIdFound() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sampleLead));

        Optional<LeadResponse> result = leadService.getLeadById(1L);

        assertTrue(result.isPresent());
        assertEquals("John Doe", result.get().getName());
    }

    @Test
    @DisplayName("getLeadById returns empty when not found")
    void getLeadByIdNotFound() {
        when(leadRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<LeadResponse> result = leadService.getLeadById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("updateLead changes status from NEW to CONTACTED")
    void updateLeadStatus() {
        when(leadRepository.findById(1L)).thenReturn(Optional.of(sampleLead));

        Lead updated = new Lead();
        updated.setId(1L);
        updated.setName("John Doe");
        updated.setStatus(LeadStatus.CONTACTED);
        updated.setCreatedAt(sampleLead.getCreatedAt());
        updated.setUpdatedAt(LocalDateTime.now());
        when(leadRepository.save(any(Lead.class))).thenReturn(updated);

        UpdateLeadRequest request = new UpdateLeadRequest();
        request.setStatus("CONTACTED");

        Optional<LeadResponse> result = leadService.updateLead(1L, request);

        assertTrue(result.isPresent());
        assertEquals(LeadStatus.CONTACTED, result.get().getStatus());
    }

    @Test
    @DisplayName("updateLead returns empty for non-existent lead")
    void updateLeadNotFound() {
        when(leadRepository.findById(99L)).thenReturn(Optional.empty());

        UpdateLeadRequest request = new UpdateLeadRequest();
        request.setName("Updated");

        Optional<LeadResponse> result = leadService.updateLead(99L, request);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("searchLeads delegates to repository")
    void searchLeads() {
        when(leadRepository.search("John")).thenReturn(List.of(sampleLead));

        List<LeadResponse> result = leadService.searchLeads("John");

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
    }

    @Test
    @DisplayName("deleteLead returns true for existing lead")
    void deleteExistingLead() {
        when(leadRepository.existsById(1L)).thenReturn(true);

        boolean result = leadService.deleteLead(1L);

        assertTrue(result);
        verify(leadRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteLead returns false for non-existent lead")
    void deleteNonExistentLead() {
        when(leadRepository.existsById(99L)).thenReturn(false);

        boolean result = leadService.deleteLead(99L);

        assertFalse(result);
        verify(leadRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("getDashboardSummary returns correct counts")
    void getDashboardSummary() {
        when(leadRepository.count()).thenReturn(5L);
        when(leadRepository.countByStatus(LeadStatus.NEW)).thenReturn(2L);
        when(leadRepository.countByStatus(LeadStatus.CONTACTED)).thenReturn(1L);
        when(leadRepository.countByStatus(LeadStatus.QUALIFIED)).thenReturn(1L);
        when(leadRepository.countByStatus(LeadStatus.CONVERTED)).thenReturn(1L);
        when(leadRepository.countByStatus(LeadStatus.LOST)).thenReturn(0L);

        DashboardSummary summary = leadService.getDashboardSummary();

        assertEquals(5L, summary.getTotalLeads());
        assertEquals(2L, summary.getCountsByStatus().get("NEW"));
        assertEquals(1L, summary.getCountsByStatus().get("CONTACTED"));
        assertEquals(0L, summary.getCountsByStatus().get("LOST"));
    }
}
