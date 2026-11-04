package com.hrms.config;

import com.hrms.entity.Department;
import com.hrms.entity.Tenant;
import com.hrms.entity.TenantRole;
import com.hrms.entity.User;
import com.hrms.enums.Role;
import com.hrms.entity.Employee;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.TenantRepository;
import com.hrms.repository.TenantRoleRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Automatically seeds default tenant, departments, roles, and users on first run
 * if the database is completely empty.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final TenantRoleRepository tenantRoleRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!tenantRepository.existsById("default")) {
            log.info("Seeding default tenant...");
            tenantRepository.save(Tenant.builder()
                .id("default")
                .code("DEFAULT")
                .name("Global Enterprise Platform")
                .domain("localhost")
                .status("ACTIVE")
                .subscriptionTier("ENTERPRISE")
                .primaryColor("#2563eb")
                .build());
            log.info("Default tenant seeded.");
        }

        if (departmentRepository.count() == 0) {
            log.info("Seeding default departments...");
            departmentRepository.saveAll(List.of(
                Department.builder().name("Engineering").code("ENG").description("Software development and architecture").location("Bangalore").budget(15000000.0).isActive(true).build(),
                Department.builder().name("Human Resources").code("HR").description("Talent acquisition and culture").location("Mumbai").budget(5000000.0).isActive(true).build(),
                Department.builder().name("Finance").code("FIN").description("Payroll and treasury").location("Delhi").budget(8000000.0).isActive(true).build(),
                Department.builder().name("Marketing").code("MKT").description("Brand and growth").location("Bangalore").budget(6000000.0).isActive(true).build()
            ));
            log.info("Default departments seeded successfully.");
        }

        if (userRepository.count() == 0) {
            log.info("Seeding default users...");

            TenantRole adminRole = tenantRoleRepository.findByTenantIdAndName("default", "ROLE_ADMIN").orElse(null);
            TenantRole hrRole = tenantRoleRepository.findByTenantIdAndName("default", "ROLE_HR").orElse(null);
            TenantRole managerRole = tenantRoleRepository.findByTenantIdAndName("default", "ROLE_MANAGER").orElse(null);
            TenantRole empRole = tenantRoleRepository.findByTenantIdAndName("default", "ROLE_EMPLOYEE").orElse(null);

            userRepository.saveAll(List.of(
                User.builder()
                    .email("admin@hrms.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(Role.ROLE_ADMIN)
                    .tenantRoles(adminRole != null ? new HashSet<>(Set.of(adminRole)) : new HashSet<>())
                    .isActive(true)
                    .emailVerified(true)
                    .build(),
                User.builder()
                    .email("hr@hrms.com")
                    .password(passwordEncoder.encode("Hr@123"))
                    .firstName("Priya")
                    .lastName("Sharma")
                    .role(Role.ROLE_HR)
                    .tenantRoles(hrRole != null ? new HashSet<>(Set.of(hrRole)) : new HashSet<>())
                    .isActive(true)
                    .emailVerified(true)
                    .build(),
                User.builder()
                    .email("manager@hrms.com")
                    .password(passwordEncoder.encode("Manager@123"))
                    .firstName("Vikram")
                    .lastName("Singh")
                    .role(Role.ROLE_MANAGER)
                    .tenantRoles(managerRole != null ? new HashSet<>(Set.of(managerRole)) : new HashSet<>())
                    .isActive(true)
                    .emailVerified(true)
                    .build(),
                User.builder()
                    .email("emp@hrms.com")
                    .password(passwordEncoder.encode("Emp@123"))
                    .firstName("Rahul")
                    .lastName("Kumar")
                    .role(Role.ROLE_EMPLOYEE)
                    .tenantRoles(empRole != null ? new HashSet<>(Set.of(empRole)) : new HashSet<>())
                    .isActive(true)
                    .emailVerified(true)
                    .build()
            ));
            log.info("Default users seeded: admin@hrms.com, hr@hrms.com, manager@hrms.com, emp@hrms.com");
        }

        // Ensure admin user has an associated employee profile so admin features & profile photos function seamlessly
        userRepository.findByEmail("admin@hrms.com").ifPresent(adminUser -> {
            if (employeeRepository.findByUserId(adminUser.getId()).isEmpty()) {
                Department engDept = departmentRepository.findAll().stream().findFirst().orElse(null);
                Employee adminEmp = Employee.builder()
                    .user(adminUser)
                    .department(engDept)
                    .employeeNumber("EMP-ADM-0001")
                    .firstName(adminUser.getFirstName())
                    .lastName(adminUser.getLastName())
                    .email(adminUser.getEmail())
                    .designation("System Administrator")
                    .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                    .dateOfJoining(LocalDate.now())
                    .leaveBalance(24)
                    .sickLeaveBalance(12)
                    .casualLeaveBalance(12)
                    .deleted(false)
                    .build();
                employeeRepository.save(adminEmp);
                log.info("Linked administrative employee record EMP-ADM-0001 for admin@hrms.com");
            }
        });
    }
}
