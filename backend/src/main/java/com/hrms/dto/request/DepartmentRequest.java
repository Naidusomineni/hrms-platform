package com.hrms.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DepartmentRequest {
    @NotBlank @Size(min=2,max=100) private String name;
    @Size(max=10) private String code;
    @Size(max=500) private String description;
    @Size(max=100) private String location;
    private Double budget;
    private Long managerId;
}
