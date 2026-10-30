package com.hrms.enums;

public enum Role {
    ROLE_SUPER_ADMIN,  // Platform-level god mode
    ROLE_ADMIN,        // Company admin — full HR access
    ROLE_HR,           // HR staff — manage employees, leaves, attendance
    ROLE_MANAGER,      // Department manager — view/approve their team
    ROLE_EMPLOYEE      // Regular employee
}
