package com.blms.controller;

import com.blms.model.User;
import com.blms.model.UserRole;
import com.blms.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockHttpSession;
import jakarta.servlet.http.Cookie;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import com.blms.repository.LeadRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("LeadController - Integration Tests")
class LeadControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired private UserRepository users;
    @Autowired private PasswordEncoder encoder;
    private MockHttpSession session;
    private Cookie csrfCookie;
    private String csrfToken;

    @BeforeEach
    void cleanUp() throws Exception {
        leadRepository.deleteAll();
        if (users.findByEmail("test-admin@blms.com").isEmpty()) {
            User admin = new User();
            admin.setName("Test Admin");
            admin.setEmail("test-admin@blms.com");
            admin.setPassword(encoder.encode("test-password"));
            admin.setRole(UserRole.ADMIN);
            users.save(admin);
        }
        var csrf = mockMvc.perform(get("/api/v1/auth/csrf")).andReturn().getResponse();
        csrfCookie = csrf.getCookie("XSRF-TOKEN");
        csrfToken = objectMapper.readTree(csrf.getContentAsString()).get("token").asText();
        var login = mockMvc.perform(post("/api/v1/auth/login").cookie(csrfCookie)
            .header("X-XSRF-TOKEN", csrfToken).contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"test-admin@blms.com\",\"password\":\"test-password\"}"))
            .andExpect(status().isOk()).andReturn();
        session = (MockHttpSession) login.getRequest().getSession(false);
        csrf = mockMvc.perform(get("/api/v1/auth/csrf").session(session)).andReturn().getResponse();
        csrfCookie = csrf.getCookie("XSRF-TOKEN");
        csrfToken = objectMapper.readTree(csrf.getContentAsString()).get("token").asText();
    }

    private ResultActions perform(MockHttpServletRequestBuilder request) throws Exception {
        return mockMvc.perform(request.session(session).cookie(csrfCookie).header("X-XSRF-TOKEN", csrfToken));
    }

    private Lead createTestLead(String name, LeadStatus status) {
        Lead lead = new Lead();
        lead.setName(name);
        lead.setContactEmail(name.toLowerCase().replace(" ", "") + "@test.com");
        lead.setStatus(status);
        lead.setCreatedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());
        return leadRepository.save(lead);
    }

    @Test
    @DisplayName("POST /api/v1/leads creates a new lead with NEW status")
    void createLead() throws Exception {
        String json = "{\"name\":\"Test Lead\",\"contactEmail\":\"test@test.com\",\"source\":\"Web\"}";

        perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Lead"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/leads with empty name returns 400")
    void createLeadEmptyName() throws Exception {
        String json = "{\"name\":\"\",\"contactEmail\":\"test@test.com\"}";

        perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/leads returns all leads")
    void getAllLeads() throws Exception {
        createTestLead("Lead One", LeadStatus.NEW);
        createTestLead("Lead Two", LeadStatus.CONTACTED);

        perform(get("/api/v1/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/v1/leads/{id} returns single lead")
    void getLeadById() throws Exception {
        Lead lead = createTestLead("Specific Lead", LeadStatus.QUALIFIED);

        perform(get("/api/v1/leads/" + lead.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Specific Lead"))
                .andExpect(jsonPath("$.status").value("QUALIFIED"));
    }

    @Test
    @DisplayName("GET /api/v1/leads/{id} returns 404 for non-existent lead")
    void getLeadByIdNotFound() throws Exception {
        perform(get("/api/v1/leads/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/v1/leads/{id} updates lead status")
    void updateLeadStatus() throws Exception {
        Lead lead = createTestLead("Update Me", LeadStatus.NEW);
        String json = "{\"status\":\"CONTACTED\"}";

        perform(put("/api/v1/leads/" + lead.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONTACTED"));
    }

    @Test
    @DisplayName("PUT /api/v1/leads/{id} updates lead name")
    void updateLeadName() throws Exception {
        Lead lead = createTestLead("Old Name", LeadStatus.NEW);
        String json = "{\"name\":\"New Name\"}";

        perform(put("/api/v1/leads/" + lead.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    @DisplayName("DELETE /api/v1/leads/{id} removes lead")
    void deleteLead() throws Exception {
        Lead lead = createTestLead("Delete Me", LeadStatus.LOST);

        perform(delete("/api/v1/leads/" + lead.getId()))
                .andExpect(status().isNoContent());

        perform(get("/api/v1/leads/" + lead.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/leads/search?q= finds matching leads")
    void searchLeads() throws Exception {
        createTestLead("Alice Johnson", LeadStatus.NEW);
        createTestLead("Bob Williams", LeadStatus.CONTACTED);

        perform(get("/api/v1/leads/search").param("q", "Alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Alice Johnson"));
    }

    @Test
    @DisplayName("GET /api/v1/dashboard/summary returns correct counts")
    void dashboardSummary() throws Exception {
        createTestLead("Lead A", LeadStatus.NEW);
        createTestLead("Lead B", LeadStatus.NEW);
        createTestLead("Lead C", LeadStatus.CONTACTED);

        perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLeads").value(3))
                .andExpect(jsonPath("$.countsByStatus.NEW").value(2))
                .andExpect(jsonPath("$.countsByStatus.CONTACTED").value(1))
                .andExpect(jsonPath("$.countsByStatus.LOST").value(0));
    }
}
