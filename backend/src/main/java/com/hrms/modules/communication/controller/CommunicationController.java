package com.hrms.modules.communication.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.User;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.modules.communication.dto.AnnouncementRequest;
import com.hrms.modules.communication.dto.AnnouncementResponse;
import com.hrms.modules.communication.service.CommunicationService;
import com.hrms.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/communication")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Corporate Communication & Bulletin")
public class CommunicationController {

    private final CommunicationService communicationService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping("/announcements")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(@Valid @RequestBody AnnouncementRequest req) {
        User user = getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User", "principal", "not found");
        }
        AnnouncementResponse res = communicationService.createAnnouncement(req, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company announcement published", res));
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getActiveAnnouncements() {
        User user = getCurrentUser();
        List<AnnouncementResponse> list = communicationService.getActiveAnnouncements(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/announcements/all")
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> getAllAnnouncements(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        User user = getCurrentUser();
        Page<AnnouncementResponse> res = communicationService.getAllAnnouncements(PageRequest.of(page, size), user);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/announcements/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledgeAnnouncement(@PathVariable("id") Long id) {
        User user = getCurrentUser();
        if (user == null) {
            throw new ResourceNotFoundException("User", "principal", "not found");
        }
        communicationService.acknowledge(id, user);
        return ResponseEntity.ok(ApiResponse.success("Announcement acknowledged"));
    }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable("id") Long id) {
        communicationService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement removed"));
    }
}
