package com.hrms.dto.response;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String location;
    private Double budget;
    private Boolean isActive;
    private Long employeeCount;
    private String managerName;
    private Long managerId;
    private LocalDateTime createdAt;
}
