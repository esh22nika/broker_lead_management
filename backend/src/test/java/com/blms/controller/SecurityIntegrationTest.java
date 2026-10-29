package com.blms.controller;

import com.blms.model.Lead;
import com.blms.model.LeadStatus;
import com.blms.model.User;
import com.blms.model.UserRole;
import com.blms.repository.LeadRepository;
import com.blms.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDateTime;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired LeadRepository leads;
    @Autowired PasswordEncoder encoder;
    @Autowired ObjectMapper json;
    private MockHttpSession session;
    private Cookie cookie;
    private String token;

    @BeforeEach void setup() {
        leads.deleteAll();
        users.deleteAll();
        session = null;
        for (UserRole role : UserRole.values()) {
            User user = new User();
            user.setName(role.name());
            user.setEmail(role.name().toLowerCase() + "@test.com");
            user.setPassword(encoder.encode("password123"));
            user.setRole(role);
            users.save(user);
        }
    }

    private void csrf() throws Exception {
        var request = get("/api/v1/auth/csrf");
        if (session != null) request.session(session);
        var response = mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse();
        cookie = response.getCookie("XSRF-TOKEN");
        token = json.readTree(response.getContentAsString()).get("token").asText();
    }

    private ResultActions send(MockHttpServletRequestBuilder request) throws Exception {
        if (session != null) request.session(session);
        return mvc.perform(request.cookie(cookie).header("X-XSRF-TOKEN", token));
    }

    private void login(String role) throws Exception {
        csrf();
        var result = send(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"" + role + "@test.com\",\"password\":\"password123\"}"))
            .andExpect(status().isOk()).andReturn();
        session = (MockHttpSession) result.getRequest().getSession(false);
        assertNotNull(session);
        csrf();
    }

    private Long lead() {
        Lead lead = new Lead();
        lead.setName("Security test lead");
        lead.setStatus(LeadStatus.NEW);
        lead.setCreatedAt(LocalDateTime.now());
        return leads.save(lead).getId();
    }

    @Test void anonymousRequestsCannotReadOrManageData() throws Exception {
        mvc.perform(get("/api/v1/leads")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/users")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/health")).andExpect(status().isOk());
    }

    @Test void wrongPasswordDoesNotCreateSession() throws Exception {
        csrf();
        send(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"admin@test.com\",\"password\":\"wrong-password\"}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test void mutationsRequireCsrfEvenWithSession() throws Exception {
        login("admin");
        mvc.perform(post("/api/v1/leads").session(session).contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Blocked\"}")).andExpect(status().isForbidden());
    }

    @Test void registrationCannotGrantPrivilegedRoles() throws Exception {
        csrf();
        for (String role : new String[]{"ADMIN", "MANAGER"}) {
            send(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Escalation\",\"email\":\"new@test.com\",\"password\":\"password123\",\"role\":\"" + role + "\"}"))
                .andExpect(status().isBadRequest());
        }
        assertTrue(users.findByEmail("new@test.com").isEmpty());
    }

    @Test void brokerRegistrationCreatesWorkingSessionAndRejectsCaseVariantDuplicate() throws Exception {
        csrf();
        var registered = send(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"New Broker\",\"email\":\"New@Test.com\",\"password\":\"password123\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.role", is("BROKER"))).andReturn();
        session = (MockHttpSession) registered.getRequest().getSession(false);
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isOk());
        csrf();
        send(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Duplicate\",\"email\":\"NEW@test.com\",\"password\":\"password123\"}"))
            .andExpect(status().isConflict());
    }

    @Test void brokerCannotDeleteCloseOrManageUsers() throws Exception {
        login("broker");
        Long id = lead();
        send(get("/api/v1/users")).andExpect(status().isForbidden());
        send(delete("/api/v1/leads/" + id)).andExpect(status().isForbidden());
        send(put("/api/v1/leads/" + id).contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"converted\"}")).andExpect(status().isForbidden());
        send(patch("/api/v1/leads/" + id + "/status").contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"LOST\"}")).andExpect(status().isForbidden());
        assertEquals(LeadStatus.NEW, leads.findById(id).orElseThrow().getStatus());
    }

    @Test void managerCanCloseAndDeleteButCannotManageUsers() throws Exception {
        login("manager");
        Long id = lead();
        send(put("/api/v1/leads/" + id).contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"converted\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status", is("CONVERTED")));
        send(delete("/api/v1/leads/" + id)).andExpect(status().isNoContent());
        send(get("/api/v1/users")).andExpect(status().isForbidden());
    }

    @Test void invalidStatusReturnsBadRequest() throws Exception {
        login("admin");
        send(put("/api/v1/leads/" + lead()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"INVALID\"}")).andExpect(status().isBadRequest());
    }

    @Test void invalidLeadFieldsAreRejectedWithoutSaving() throws Exception {
        login("broker");
        send(post("/api/v1/leads").contentType(MediaType.APPLICATION_JSON)
            .content("{\"name\":\"Prospect\",\"contactEmail\":\"invalid\"}"))
            .andExpect(status().isBadRequest());
        send(post("/api/v1/leads").contentType(MediaType.APPLICATION_JSON)
            .content(json.writeValueAsString(java.util.Map.of("name", "Prospect", "notes", "x".repeat(2001)))))
            .andExpect(status().isBadRequest());
        assertEquals(0, leads.count());
    }

    @Test void roleChangesAndDeactivationApplyToExistingSessions() throws Exception {
        login("admin");
        send(get("/api/v1/users")).andExpect(status().isOk());
        User user = users.findByEmail("admin@test.com").orElseThrow();
        user.setRole(UserRole.BROKER);
        users.save(user);
        send(get("/api/v1/users")).andExpect(status().isForbidden());
        user.setActive(false);
        users.save(user);
        send(get("/api/v1/leads")).andExpect(status().isUnauthorized());
    }

    @Test void logoutInvalidatesSession() throws Exception {
        login("broker");
        send(post("/api/v1/auth/logout")).andExpect(status().isOk());
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }
}
