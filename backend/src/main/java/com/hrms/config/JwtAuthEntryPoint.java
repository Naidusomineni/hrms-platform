package com.hrms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Component @Slf4j
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException ex) throws IOException {
        log.warn("Unauthorized: {} {}", req.getMethod(), req.getServletPath());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        Map<String,Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("status", 401);
        body.put("message", "Authentication required. Please login.");
        body.put("path", req.getServletPath());
        body.put("timestamp", LocalDateTime.now().toString());
        new ObjectMapper().writeValue(res.getOutputStream(), body);
    }
}
