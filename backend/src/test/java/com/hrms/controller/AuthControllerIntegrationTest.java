package com.hrms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.enums.Role;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /v1/auth/login — 400 when email missing")
    void login_MissingEmail_Returns400() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setPassword("somepassword");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /v1/auth/register — 400 when password too short")
    void register_ShortPassword_Returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("John"); req.setLastName("Doe");
        req.setEmail("test@test.com"); req.setPassword("short");
        req.setRole(Role.ROLE_EMPLOYEE);

        mockMvc.perform(post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /v1/auth/login — 401 on bad credentials")
    void login_BadCredentials_Returns401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nonexistent@test.com");
        req.setPassword("wrongpassword123");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /v1/employees — 401 without token")
    void employees_NoToken_Returns401() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .get("/v1/employees"))
            .andExpect(status().isUnauthorized());
    }
}
