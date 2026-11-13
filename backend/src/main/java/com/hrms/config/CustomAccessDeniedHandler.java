package com.hrms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Slf4j
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex) throws IOException {
        log.warn("Forbidden access attempt: {} {} - {}", req.getMethod(), req.getServletPath(), ex.getMessage());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("status", 403);
        body.put("message", "Access denied: Insufficient privileges to access this resource.");
        body.put("path", req.getServletPath());
        body.put("timestamp", LocalDateTime.now().toString());
        new ObjectMapper().writeValue(res.getOutputStream(), body);
    }
}

