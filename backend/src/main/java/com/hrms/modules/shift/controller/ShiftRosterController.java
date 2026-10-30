package com.hrms.modules.shift.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.User;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.modules.shift.dto.*;
import com.hrms.modules.shift.service.ShiftRosterService;
import com.hrms.repository.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/shifts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Shift & Roster Management")
public class ShiftRosterController {

    private final ShiftRosterService shiftRosterService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftDto>>> getShifts() {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getShifts()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ShiftDto>> createShift(@Valid @RequestBody ShiftDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shift definition created", shiftRosterService.createShift(dto)));
    }

    @PostMapping("/roster/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<RosterAssignmentDto>>> assignRoster(@Valid @RequestBody RosterAssignRequest req) {
        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Roster schedule assigned successfully",
                        shiftRosterService.assignRoster(req, userId)));
    }

    @GetMapping("/roster")
    public ResponseEntity<ApiResponse<List<RosterAssignmentDto>>> getRosterSchedule(
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getRosterSchedule(startDate, endDate)));
    }

    @GetMapping("/roster/my")
    public ResponseEntity<ApiResponse<List<RosterAssignmentDto>>> getMyRoster(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getMyRoster(employeeId, startDate, endDate)));
    }

    @PostMapping("/swaps")
    public ResponseEntity<ApiResponse<ShiftSwapDto>> createSwapRequest(@Valid @RequestBody ShiftSwapCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shift swap request submitted to peer", shiftRosterService.createSwapRequest(req)));
    }

    @GetMapping("/swaps/incoming")
    public ResponseEntity<ApiResponse<List<ShiftSwapDto>>> getIncomingSwaps(@RequestParam("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getIncomingSwaps(employeeId)));
    }

    @GetMapping("/swaps/outgoing")
    public ResponseEntity<ApiResponse<List<ShiftSwapDto>>> getOutgoingSwaps(@RequestParam("employeeId") Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getOutgoingSwaps(employeeId)));
    }

    @GetMapping("/swaps/pending-manager")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShiftSwapDto>>> getPendingManagerSwaps() {
        return ResponseEntity.ok(ApiResponse.success(shiftRosterService.getPendingManagerSwaps()));
    }

    @PutMapping("/swaps/{id}/peer-respond")
    public ResponseEntity<ApiResponse<ShiftSwapDto>> peerRespond(
            @PathVariable("id") Long id,
            @RequestParam("peerEmployeeId") Long peerEmployeeId,
            @Valid @RequestBody ShiftSwapReviewRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Peer response recorded",
                shiftRosterService.peerRespondSwap(id, peerEmployeeId, req)));
    }

    @PutMapping("/swaps/{id}/manager-review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ShiftSwapDto>> managerReview(
            @PathVariable("id") Long id,
            @Valid @RequestBody ShiftSwapReviewRequest req) {
        User manager = getCurrentUser();
        if (manager == null) {
            throw new ResourceNotFoundException("User", "principal", "not found");
        }
        return ResponseEntity.ok(ApiResponse.success("Manager review completed and schedule updated",
                shiftRosterService.managerReviewSwap(id, manager, req)));
    }
}
