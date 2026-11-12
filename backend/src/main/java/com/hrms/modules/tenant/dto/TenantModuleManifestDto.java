package com.hrms.modules.tenant.dto;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TenantModuleManifestDto {
    private Long id;
    private String moduleKey;
    private Boolean isEnabled;
}

