package com.hrms.modules.notification.controller;

import com.hrms.modules.notification.service.NotificationService;
import com.hrms.util.PaginationUtils;
import com.hrms.dto.response.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getForCurrentUser(userDetails, PaginationUtils.of(page, size))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCountMy(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.countUnreadForCurrentUser(userDetails)));
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllReadMy(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllReadForCurrentUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getForUser(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getForUser(userId, PaginationUtils.of(page, size), userDetails)));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.countUnread(userId, userDetails)));
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllRead(userId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markRead(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
