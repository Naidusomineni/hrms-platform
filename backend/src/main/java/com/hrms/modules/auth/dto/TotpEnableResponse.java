package com.hrms.modules.auth.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotpEnableResponse {
    private boolean enabled;
    private List<String> backupCodes;
}
