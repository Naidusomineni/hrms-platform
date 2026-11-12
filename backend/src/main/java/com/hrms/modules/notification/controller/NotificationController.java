package com.hrms.modules.notification.controller;
import com.hrms.modules.notification.service.NotificationService;
import com.hrms.util.PaginationUtils;

import com.hrms.dto.response.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/v1/notifications") @RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth") @Tag(name = "Notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getForUser(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue="0") int page,
            @RequestParam(name = "size", defaultValue="20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            notificationService.getForUser(userId, PaginationUtils.of(page, size))));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnread(userId)));
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@PathVariable("userId") Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable("id") Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
