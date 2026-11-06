package com.hrms.config;

import com.hrms.entity.Candidate;
import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.entity.JobPosting;
import com.hrms.entity.Tenant;
import com.hrms.entity.TenantRole;
import com.hrms.entity.User;
import com.hrms.enums.CandidateStage;
import com.hrms.enums.LeaveType;
import com.hrms.enums.Role;
import com.hrms.modules.asset.entity.Asset;
import com.hrms.modules.asset.repository.AssetRepository;
import com.hrms.modules.attendance.entity.OfficeLocation;
import com.hrms.modules.attendance.repository.OfficeLocationRepository;
import com.hrms.modules.communication.entity.CompanyAnnouncement;
import com.hrms.modules.communication.repository.CompanyAnnouncementRepository;
import com.hrms.modules.intelligence.entity.HrPolicyArticle;
import com.hrms.modules.intelligence.repository.HrPolicyArticleRepository;
import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.entity.LeavePolicy;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;
import com.hrms.modules.leave.repository.LeavePolicyRepository;
import com.hrms.modules.performance.entity.AppraisalCycle;
import com.hrms.modules.performance.repository.AppraisalCycleRepository;
import com.hrms.modules.recruitment.repository.CandidateRepository;
import com.hrms.modules.shift.entity.Shift;
import com.hrms.modules.shift.repository.ShiftRepository;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.JobPostingRepository;
import com.hrms.repository.TenantRepository;
import com.hrms.repository.TenantRoleRepository;
import com.hrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Automatically seeds default tenant, departments, roles, users, employee profiles,
 * statutory leave policies, office locations, shifts, hardware assets, job postings,
 * candidates, announcements, and policy knowledge base articles on first run.
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

    private final OfficeLocationRepository officeLocationRepository;
    private final ShiftRepository shiftRepository;
    private final LeavePolicyRepository leavePolicyRepository;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;
    private final AppraisalCycleRepository appraisalCycleRepository;
    private final AssetRepository assetRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyAnnouncementRepository companyAnnouncementRepository;
    private final HrPolicyArticleRepository hrPolicyArticleRepository;

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

        Department engDept = departmentRepository.findByName("Engineering").orElseGet(() -> departmentRepository.findAll().stream().findFirst().orElse(null));
        Department hrDept = departmentRepository.findByName("Human Resources").orElse(engDept);

        // 1. Admin Employee
        userRepository.findByEmail("admin@hrms.com").ifPresent(adminUser -> {
            Employee adminEmp = employeeRepository.findByUserId(adminUser.getId())
                .or(() -> employeeRepository.findByEmail(adminUser.getEmail()))
                .orElseGet(() -> {
                    Employee e = Employee.builder()
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
                    e.setTenantId("default");
                    return employeeRepository.save(e);
                });
            configureEmployeeFinancials(adminEmp, new BigDecimal("150000.00"), "HDFC Bank", "50100492817291", "HDFC0000001");
            log.info("Configured administrative employee record EMP-ADM-0001 for admin@hrms.com");
        });

        // 2. HR Employee
        userRepository.findByEmail("hr@hrms.com").ifPresent(hrUser -> {
            Employee hrEmp = employeeRepository.findByUserId(hrUser.getId())
                .or(() -> employeeRepository.findByEmail(hrUser.getEmail()))
                .orElseGet(() -> {
                    Employee e = Employee.builder()
                        .user(hrUser)
                        .department(hrDept)
                        .employeeNumber("EMP-HR-0002")
                        .firstName(hrUser.getFirstName())
                        .lastName(hrUser.getLastName())
                        .email(hrUser.getEmail())
                        .designation("HR Operations Lead")
                        .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                        .dateOfJoining(LocalDate.now())
                        .leaveBalance(24)
                        .sickLeaveBalance(12)
                        .casualLeaveBalance(12)
                        .deleted(false)
                        .build();
                    e.setTenantId("default");
                    return employeeRepository.save(e);
                });
            configureEmployeeFinancials(hrEmp, new BigDecimal("95000.00"), "ICICI Bank", "001205019283", "ICIC0000012");
            log.info("Configured HR employee record EMP-HR-0002 for hr@hrms.com");
        });

        // 3. Manager Employee
        Employee managerEmp = userRepository.findByEmail("manager@hrms.com").map(mgrUser -> {
            Employee mEmp = employeeRepository.findByUserId(mgrUser.getId())
                .or(() -> employeeRepository.findByEmail(mgrUser.getEmail()))
                .orElseGet(() -> {
                    Employee e = Employee.builder()
                        .user(mgrUser)
                        .department(engDept)
                        .employeeNumber("EMP-MGR-0003")
                        .firstName(mgrUser.getFirstName())
                        .lastName(mgrUser.getLastName())
                        .email(mgrUser.getEmail())
                        .designation("Engineering Delivery Manager")
                        .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                        .dateOfJoining(LocalDate.now())
                        .leaveBalance(24)
                        .sickLeaveBalance(12)
                        .casualLeaveBalance(12)
                        .deleted(false)
                        .build();
                    e.setTenantId("default");
                    return employeeRepository.save(e);
                });
            configureEmployeeFinancials(mEmp, new BigDecimal("135000.00"), "State Bank of India", "30918274619", "SBIN0001234");
            log.info("Configured Manager employee record EMP-MGR-0003 for manager@hrms.com");
            return mEmp;
        }).orElse(null);

        // 4. Regular Employee
        userRepository.findByEmail("emp@hrms.com").ifPresent(empUser -> {
            Employee regEmp = employeeRepository.findByUserId(empUser.getId())
                .or(() -> employeeRepository.findByEmail(empUser.getEmail()))
                .orElseGet(() -> {
                    Employee e = Employee.builder()
                        .user(empUser)
                        .department(engDept)
                        .manager(managerEmp)
                        .employeeNumber("EMP-ENG-0004")
                        .firstName(empUser.getFirstName())
                        .lastName(empUser.getLastName())
                        .email(empUser.getEmail())
                        .designation("Senior Software Engineer")
                        .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                        .dateOfJoining(LocalDate.now())
                        .leaveBalance(24)
                        .sickLeaveBalance(12)
                        .casualLeaveBalance(8)
                        .deleted(false)
                        .build();
                    e.setTenantId("default");
                    return employeeRepository.save(e);
                });
            configureEmployeeFinancials(regEmp, new BigDecimal("85000.00"), "Axis Bank", "918020038172918", "UTIB0000045");
            log.info("Configured Employee record EMP-ENG-0004 for emp@hrms.com");
        });

        // 5. Dedicated IT Administrator User
        if (!userRepository.existsByEmail("itadmin@hrms.com")) {
            log.info("Provisioning dedicated IT Administrator user itadmin@hrms.com...");
            User itUser = userRepository.save(User.builder()
                .email("itadmin@hrms.com")
                .password(passwordEncoder.encode("ItAdmin@123"))
                .firstName("Suresh")
                .lastName("Verma")
                .role(Role.ROLE_IT_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .build());

            Employee itEmp = employeeRepository.findByUserId(itUser.getId())
                .or(() -> employeeRepository.findByEmail(itUser.getEmail()))
                .orElseGet(() -> {
                    Employee e = Employee.builder()
                        .user(itUser)
                        .department(engDept)
                        .employeeNumber("EMP-IT-0005")
                        .firstName(itUser.getFirstName())
                        .lastName(itUser.getLastName())
                        .email(itUser.getEmail())
                        .designation("Lead IT Systems & Infrastructure Specialist")
                        .employmentStatus(com.hrms.enums.EmploymentStatus.ACTIVE)
                        .dateOfJoining(LocalDate.now())
                        .leaveBalance(24)
                        .sickLeaveBalance(12)
                        .casualLeaveBalance(12)
                        .deleted(false)
                        .build();
                    e.setTenantId("default");
                    return employeeRepository.save(e);
                });
            configureEmployeeFinancials(itEmp, new BigDecimal("120000.00"), "State Bank of India", "309182746192", "SBIN0001234");
            log.info("Successfully provisioned dedicated IT Administrator itadmin@hrms.com (EMP-IT-0005)");
        }

        // 6. Office Location
        if (officeLocationRepository.count() == 0) {
            OfficeLocation ol = OfficeLocation.builder()
                .name("Headquarters - Tech Park")
                .address("100 Innovation Boulevard, Tech District")
                .latitude(new BigDecimal("12.9716"))
                .longitude(new BigDecimal("77.5946"))
                .radiusMeters(500)
                .isActive(true)
                .build();
            ol.setTenantId("default");
            officeLocationRepository.save(ol);
            log.info("Default office location seeded: Headquarters - Tech Park");
        }

        // 6. Shift
        if (shiftRepository.count() == 0) {
            Shift s = Shift.builder()
                .name("General Morning Shift")
                .shiftCode("GEN-01")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .gracePeriodMins(15)
                .breakDurationMins(60)
                .isNightShift(false)
                .nightAllowanceRate(BigDecimal.ZERO)
                .isActive(true)
                .build();
            s.setTenantId("default");
            shiftRepository.save(s);
            log.info("Default shift seeded: GEN-01 (General Morning Shift)");
        }

        // 7. Leave Policies
        if (leavePolicyRepository.count() == 0) {
            List<LeavePolicy> policies = List.of(
                LeavePolicy.builder().leaveType(LeaveType.ANNUAL).annualAllowance(BigDecimal.valueOf(24.0)).monthlyAccrualRate(BigDecimal.valueOf(2.0)).maxCarryOver(BigDecimal.valueOf(10.0)).allowsHalfDay(true).requiresAttachment(false).isActive(true).build(),
                LeavePolicy.builder().leaveType(LeaveType.SICK).annualAllowance(BigDecimal.valueOf(12.0)).monthlyAccrualRate(BigDecimal.valueOf(1.0)).maxCarryOver(BigDecimal.valueOf(5.0)).allowsHalfDay(true).requiresAttachment(true).isActive(true).build(),
                LeavePolicy.builder().leaveType(LeaveType.CASUAL).annualAllowance(BigDecimal.valueOf(8.0)).monthlyAccrualRate(BigDecimal.valueOf(0.67)).maxCarryOver(BigDecimal.valueOf(0.0)).allowsHalfDay(true).requiresAttachment(false).isActive(true).build()
            );
            policies.forEach(p -> p.setTenantId("default"));
            leavePolicyRepository.saveAll(policies);
            log.info("Default leave policies seeded: ANNUAL, SICK, CASUAL");
        }

        // 8. Appraisal Cycle
        if (appraisalCycleRepository.count() == 0) {
            int year = LocalDate.now().getYear();
            AppraisalCycle cycle = AppraisalCycle.builder()
                .name("FY " + year + " Annual Appraisal Cycle")
                .year(year)
                .startDate(LocalDate.of(year, 1, 1))
                .endDate(LocalDate.of(year, 12, 31))
                .status("IN_REVIEW")
                .build();
            cycle.setTenantId("default");
            appraisalCycleRepository.save(cycle);
            log.info("Default appraisal cycle seeded for year {}", year);
        }

        // 9. Assets
        if (assetRepository.count() == 0) {
            Asset a1 = Asset.builder()
                .assetTag("AST-LAP-001")
                .category("LAPTOP")
                .brand("Apple")
                .model("MacBook Pro M3 Max 16\"")
                .serialNumber("C02G8792MD6R")
                .purchaseDate(LocalDate.now().minusMonths(6))
                .warrantyExpiry(LocalDate.now().plusMonths(30))
                .cost(new BigDecimal("249000.00"))
                .conditionStatus("GOOD")
                .status("AVAILABLE")
                .build();
            a1.setTenantId("default");

            Asset a2 = Asset.builder()
                .assetTag("AST-MON-002")
                .category("MONITOR")
                .brand("Dell")
                .model("UltraSharp 27\" 4K")
                .serialNumber("CN09923881")
                .purchaseDate(LocalDate.now().minusMonths(4))
                .warrantyExpiry(LocalDate.now().plusMonths(32))
                .cost(new BigDecimal("45000.00"))
                .conditionStatus("GOOD")
                .status("AVAILABLE")
                .build();
            a2.setTenantId("default");

            assetRepository.saveAll(List.of(a1, a2));
            log.info("Default hardware assets seeded: AST-LAP-001, AST-MON-002");
        }

        // 10. Job Postings & Candidates
        if (jobPostingRepository.count() == 0) {
            JobPosting job = JobPosting.builder()
                .title("Senior Full Stack Engineer")
                .department(engDept)
                .description("We are looking for an experienced Java / React developer to lead core platform engineering initiatives.")
                .requirements("Java 21, Spring Boot 3, React, TypeScript, PostgreSQL, REST APIs")
                .location("Bangalore (Hybrid)")
                .status("OPEN")
                .openings(3)
                .experienceMin(4)
                .experienceMax(8)
                .salaryMin(new BigDecimal("1800000.00"))
                .salaryMax(new BigDecimal("2400000.00"))
                .closesAt(LocalDate.now().plusMonths(3))
                .build();
            job.setTenantId("default");
            job = jobPostingRepository.save(job);
            log.info("Default job posting seeded: Senior Full Stack Engineer");

            if (candidateRepository.count() == 0) {
                Candidate c1 = Candidate.builder()
                    .name("Aditi Sen")
                    .email("aditi.sen@example.com")
                    .phone("+91 98765 43210")
                    .experienceYears(5)
                    .currentCtc(new BigDecimal("1500000.00"))
                    .expectedCtc(new BigDecimal("2000000.00"))
                    .noticePeriodDays(30)
                    .stage(CandidateStage.APPLIED)
                    .source("LinkedIn")
                    .notes("Strong background in Spring Boot microservices and React dashboards.")
                    .jobPosting(job)
                    .build();
                c1.setTenantId("default");

                Candidate c2 = Candidate.builder()
                    .name("Rohan Varma")
                    .email("rohan.varma@example.com")
                    .phone("+91 98123 45678")
                    .experienceYears(4)
                    .currentCtc(new BigDecimal("1400000.00"))
                    .expectedCtc(new BigDecimal("1900000.00"))
                    .noticePeriodDays(45)
                    .stage(CandidateStage.INTERVIEW_ROUND_1)
                    .source("Referral")
                    .notes("Shortlisted for Live Coding and System Architecture evaluation.")
                    .jobPosting(job)
                    .build();
                c2.setTenantId("default");

                candidateRepository.saveAll(List.of(c1, c2));
                log.info("Default candidates seeded: Aditi Sen, Rohan Varma");
            }
        }

        // 11. Company Announcement
        if (companyAnnouncementRepository.count() == 0) {
            User adminAuthor = userRepository.findByEmail("admin@hrms.com").orElse(null);
            if (adminAuthor != null) {
                CompanyAnnouncement a = CompanyAnnouncement.builder()
                    .title("Q4 Corporate Town Hall & Innovation Showcase")
                    .content("We are excited to host our annual end-of-year Town Hall next Friday. Join us as executive leadership shares company growth, engineering milestones, and exciting platform initiatives!")
                    .category("EVENT")
                    .priority("IMPORTANT")
                    .targetAudience("ALL")
                    .pinned(true)
                    .author(adminAuthor)
                    .publishedAt(LocalDateTime.now())
                    .acknowledgmentRequired(true)
                    .build();
                a.setTenantId("default");
                companyAnnouncementRepository.save(a);
                log.info("Default corporate announcement seeded: Q4 Corporate Town Hall");
            }
        }

        // 12. HR Policy Knowledge Base Articles
        if (hrPolicyArticleRepository.count() == 0) {
            HrPolicyArticle p1 = HrPolicyArticle.builder()
                .category("LEAVE")
                .title("Paid Time Off & Sabbatical Leave Policy")
                .summary("Standard entitlement of 24 days annual leave with up to 10 days rollover and emergency casual leave protocols.")
                .content("# Paid Time Off (PTO) Policy\n\nAll permanent full-time employees are entitled to **24 days of annual paid leave**, accrued pro-rata at 2 days per active working month.\n\n### Key Highlights\n- **Carryover:** A maximum of 10 unused leave days may be carried forward into the subsequent calendar year.\n- **Notice Period:** Planned leaves exceeding 3 consecutive days require submission at least 5 business days in advance.\n- **Sick Leave:** Up to 12 days sick leave with medical practitioner certification required for absences exceeding 2 consecutive days.")
                .keywords("leave, pto, annual leave, casual, sick, vacation")
                .actionLabel("Apply for Leave")
                .actionRoute("/leaves")
                .isActive(true)
                .build();
            p1.setTenantId("default");

            HrPolicyArticle p2 = HrPolicyArticle.builder()
                .category("ATTENDANCE")
                .title("Hybrid Work & Geofenced Punch Regulations")
                .summary("Core working hours from 09:30 to 18:30 IST with biometric/web clock-in and 15-minute grace period.")
                .content("# Attendance & Hybrid Work Policy\n\nTo ensure operational alignment across all distributed squads, the company operates under a hybrid flexibility framework with core availability from 09:30 to 18:30 IST.\n\n### Clock-In Protocols\n- **Office Attendance:** Employees record physical entry via facial recognition / biometric access gates or mobile geofenced punch within 500 meters.\n- **Grace Period:** A 15-minute arrival buffer is permitted up to 3 times per calendar month without regularization penalty.\n- **Regularization:** Unrecorded punches must be submitted with valid business justification within 48 hours.")
                .keywords("attendance, biometric, wfh, clock in, punch, grace period")
                .actionLabel("View Attendance")
                .actionRoute("/attendance")
                .isActive(true)
                .build();
            p2.setTenantId("default");

            HrPolicyArticle p3 = HrPolicyArticle.builder()
                .category("EXPENSE")
                .title("Corporate Travel & Expense Reimbursement Policy")
                .summary("Guidelines for broadband reimbursement, client entertainment, and local transit claims.")
                .content("# Expense Reimbursement Guidelines\n\nAll legitimate, authorized business expenses incurred in the discharge of official duties are reimbursable through the payroll disbursal cycle.\n\n### Eligible Claim Categories\n- **Broadband & Utilities:** Remote staff can claim up to ?1,500 monthly with GST invoice.\n- **Local Transit:** Travel for client meetings or on-site visits reimbursable at approved per-km rates.\n- **Certification & Learning:** Annual allowance of up to ?25,000 for approved professional technical certifications.")
                .keywords("expense, reimbursement, travel, claims, broadband, tax")
                .actionLabel("Submit Expense Claim")
                .actionRoute("/expenses")
                .isActive(true)
                .build();
            p3.setTenantId("default");

            hrPolicyArticleRepository.saveAll(List.of(p1, p2, p3));
            log.info("Default HR policy knowledge base articles seeded: LEAVE, ATTENDANCE, EXPENSE");
        }
    }

    private void configureEmployeeFinancials(Employee emp, BigDecimal salary, String bankName, String accNo, String ifsc) {
        boolean updated = false;
        if (emp.getSalary() == null) {
            emp.setSalary(salary);
            updated = true;
        }
        if (emp.getBankName() == null) {
            emp.setBankName(bankName);
            updated = true;
        }
        if (emp.getBankAccountNumber() == null) {
            emp.setBankAccountNumber(accNo);
            updated = true;
        }
        if (emp.getIfscCode() == null) {
            emp.setIfscCode(ifsc);
            updated = true;
        }
        if (updated) {
            employeeRepository.save(emp);
        }
        seedLeaveBalancesIfAbsent(emp);
    }

    private void seedLeaveBalancesIfAbsent(Employee emp) {
        int currentYear = LocalDate.now().getYear();
        for (LeaveType type : List.of(LeaveType.ANNUAL, LeaveType.SICK, LeaveType.CASUAL)) {
            if (leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndYear(emp.getId(), type, currentYear).isEmpty()) {
                BigDecimal days = switch (type) {
                    case ANNUAL -> BigDecimal.valueOf(24.0);
                    case SICK -> BigDecimal.valueOf(12.0);
                    case CASUAL -> BigDecimal.valueOf(8.0);
                    default -> BigDecimal.valueOf(10.0);
                };
                EmployeeLeaveBalance bal = EmployeeLeaveBalance.builder()
                    .employee(emp)
                    .leaveType(type)
                    .allocatedDays(days)
                    .balanceDays(days)
                    .usedDays(BigDecimal.ZERO)
                    .pendingDays(BigDecimal.ZERO)
                    .year(currentYear)
                    .build();
                bal.setTenantId("default");
                leaveBalanceRepository.save(bal);
            }
        }
    }
}
