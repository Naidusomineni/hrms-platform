package com.hrms.modules.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantBrandingRequest {
    private String name;
    private String logoUrl;
    private String primaryColor;
    private String domain;
}
