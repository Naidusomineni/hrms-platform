package com.hrms.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginHistoryResponse {
    private Long id;
    private LocalDateTime loginAt;
    private LocalDateTime logoutAt;
    private String ipAddress;
    private String deviceType;
    private String browser;
    private String osName;
    private String status;
}
