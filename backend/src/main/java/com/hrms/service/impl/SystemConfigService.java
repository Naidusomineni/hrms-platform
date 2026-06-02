package com.hrms.service.impl;

import com.hrms.dto.response.SystemSettingResponse;
import com.hrms.entity.SystemSetting;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SystemConfigService {

    private final SystemSettingRepository systemSettingRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<SystemSettingResponse> getAllSettings() {
        if (systemSettingRepository.count() == 0) {
            seedDefaults();
        }
        return systemSettingRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public SystemSettingResponse updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        setting.setValue(value);
        setting.setUpdatedAt(java.time.LocalDateTime.now());
        return toResponse(systemSettingRepository.save(setting));
    }

    private SystemSettingResponse toResponse(SystemSetting setting) {
        return SystemSettingResponse.builder()
            .key(setting.getKey())
            .value(setting.getValue())
            .description(setting.getDescription())
            .updatedAt(setting.getUpdatedAt().format(FORMATTER))
            .build();
    }

    private void seedDefaults() {
        systemSettingRepository.save(SystemSetting.builder()
            .key("notifications.upcomingBirthdays")
            .value("true")
            .description("Enable dashboard birthday reminders")
            .build());
        systemSettingRepository.save(SystemSetting.builder()
            .key("security.maxLoginAttempts")
            .value("5")
            .description("Maximum failed login attempts before lockout")
            .build());
        systemSettingRepository.save(SystemSetting.builder()
            .key("attendance.selfCheckIn")
            .value("true")
            .description("Allow employees to self check in for attendance")
            .build());
    }
}
