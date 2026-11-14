package com.hrms.modules.employee.service;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.dto.response.*;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.service.EmailService;
import com.hrms.common.audit.AuditService;
import com.hrms.infrastructure.multitenancy.context.TenantContext;
import com.hrms.util.FileValidationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.hrms.modules.leave.entity.EmployeeLeaveBalance;
import com.hrms.modules.leave.repository.EmployeeLeaveBalanceRepository;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditService auditService;
    private final EmployeeLeaveBalanceRepository leaveBalanceRepository;

    @Value("${file.upload.base-dir}")
    private String uploadBaseDir;

    @Value("${file.upload.profile-pictures}")
    private String profilePictureDir;

    @Value("${file.upload.documents}")
    private String documentDir;

    @Value("${file.upload.allowed-image-types}")
    private String allowedImageTypes;

    @Value("${file.upload.allowed-doc-types}")
    private String allowedDocTypes;

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    public EmployeeResponse create(EmployeeRequest req) {
        if (employeeRepository.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Employee", "email", req.getEmail());

        String password = (req.getPassword() != null && !req.getPassword().isBlank())
            ? req.getPassword()
            : "Hrms@" + (1000 + new java.util.Random().nextInt(9000));

        User user = User.builder()
            .firstName(req.getFirstName()).lastName(req.getLastName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(password))
            .role(Role.ROLE_EMPLOYEE)
            .isActive(true)
            .emailVerified(true)
            .mustChangePassword(true)
            .build();
        user = userRepository.save(user);

        Department dept = req.getDepartmentId() != null
            ? departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department","id",req.getDepartmentId()))
            : null;

        Employee manager = req.getManagerId() != null
            ? employeeRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getManagerId()))
            : null;

        Employee emp = Employee.builder()
            .employeeNumber(generateNumber())
            .firstName(req.getFirstName()).lastName(req.getLastName())
            .email(req.getEmail()).phoneNumber(req.getPhoneNumber())
            .dateOfBirth(req.getDateOfBirth()).gender(req.getGender())
            .address(req.getAddress()).city(req.getCity()).state(req.getState())
            .pincode(req.getPincode()).country(req.getCountry())
            .designation(req.getDesignation()).jobTitle(req.getJobTitle())
            .dateOfJoining(req.getDateOfJoining())
            .employmentStatus(req.getEmploymentStatus() != null ? req.getEmploymentStatus() : EmploymentStatus.PROBATION)
            .shiftType(req.getShiftType() != null ? req.getShiftType() : ShiftType.MORNING)
            .salary(req.getSalary())
            .bankAccountNumber(req.getBankAccountNumber()).bankName(req.getBankName())
            .ifscCode(req.getIfscCode()).panNumber(req.getPanNumber())
            .emergencyContactName(req.getEmergencyContactName())
            .emergencyContactPhone(req.getEmergencyContactPhone())
            .emergencyContactRelation(req.getEmergencyContactRelation())
            .leaveBalance(24).sickLeaveBalance(12).casualLeaveBalance(8)
            .department(dept).manager(manager).user(user)
            .build();

        emp = employeeRepository.save(emp);

        // Initialize granular statutory leave balances
        int currentYear = LocalDate.now().getYear();
        String tenantId = emp.getTenantId() != null ? emp.getTenantId() : TenantContext.getTenantId();
        List<EmployeeLeaveBalance> balances = List.of(
            EmployeeLeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.ANNUAL)
                .allocatedDays(BigDecimal.valueOf(24.0)).usedDays(BigDecimal.ZERO)
                .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(24.0))
                .year(currentYear).build(),
            EmployeeLeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.SICK)
                .allocatedDays(BigDecimal.valueOf(12.0)).usedDays(BigDecimal.ZERO)
                .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(12.0))
                .year(currentYear).build(),
            EmployeeLeaveBalance.builder()
                .employee(emp).leaveType(LeaveType.CASUAL)
                .allocatedDays(BigDecimal.valueOf(8.0)).usedDays(BigDecimal.ZERO)
                .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(8.0))
                .year(currentYear).build()
        );
        balances.forEach(b -> b.setTenantId(tenantId != null ? tenantId : "default"));
        leaveBalanceRepository.saveAll(balances);
        emailService.sendMncWelcomeEmail(
            emp.getEmail(),
            emp.getFirstName(),
            emp.getLastName(),
            emp.getEmployeeNumber(),
            emp.getDesignation(),
            dept != null ? dept.getName() : "General",
            password
        );
        auditService.log("EMPLOYEE_CREATED", "EMPLOYEE", emp.getId(), "Created employee " + emp.getFullName());
        log.info("Employee created: {} ({})", emp.getFullName(), emp.getEmployeeNumber());
        return toResponse(emp);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return getById(id, null);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id, UserDetails userDetails) {
        Employee emp = findById(id);

        // Multi-tenant isolation check
        String tenantId = TenantContext.getTenantId();
        if (emp.getTenantId() != null && tenantId != null && !emp.getTenantId().equalsIgnoreCase(tenantId)) {
            throw new ResourceNotFoundException("Employee", "id", id);
        }

        // BOLA / IDOR Authorization check:
        // Admin, HR, Super Admin can view any employee.
        // Managers can view direct reports.
        // Employees can only view themselves.
        if (userDetails != null) {
            boolean isElevated = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR") ||
                                   a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            if (!isElevated) {
                String callerEmail = userDetails.getUsername();
                boolean isSelf = emp.getEmail() != null && emp.getEmail().equalsIgnoreCase(callerEmail);
                boolean isManagerOfEmp = emp.getManager() != null &&
                        emp.getManager().getEmail() != null &&
                        emp.getManager().getEmail().equalsIgnoreCase(callerEmail);

                if (!isSelf && !isManagerOfEmp) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Access denied: You do not have permission to view confidential employee profile " + id);
                }
            }
        }

        return toResponse(emp);
    }

    public EmployeeResponse getByEmail(String email) {
        Employee emp = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));
        return toResponse(emp);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAll(String search, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        Page<Employee> page = (search != null && !search.isBlank())
            ? (tenantId != null ? employeeRepository.searchByTenant(search.trim(), tenantId, pageable) : employeeRepository.search(search.trim(), pageable))
            : (tenantId != null ? employeeRepository.findByTenantId(tenantId, pageable) : employeeRepository.findAll(pageable));
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getByDepartment(Long deptId, Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        Page<Employee> page = (tenantId != null)
            ? employeeRepository.findByTenantIdAndDepartmentId(tenantId, deptId, pageable)
            : employeeRepository.findByDepartmentId(deptId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee emp = findById(id);
        String oldEmail = emp.getEmail();
        String newEmail = req.getEmail().trim();

        // Check if email changed and if new email already belongs to another employee
        if (!oldEmail.equalsIgnoreCase(newEmail) && employeeRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Employee", "email", newEmail);
        }

        // Check user table collision if email changed
        if (!oldEmail.equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            User existingUser = userRepository.findByEmail(newEmail).orElse(null);
            if (existingUser != null && (emp.getUser() == null || !existingUser.getId().equals(emp.getUser().getId()))) {
                throw new DuplicateResourceException("User", "email", newEmail);
            }
        }

        if (req.getDepartmentId() != null) {
            emp.setDepartment(departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", req.getDepartmentId())));
        } else {
            emp.setDepartment(null);
        }

        if (req.getManagerId() != null) {
            emp.setManager(employeeRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", req.getManagerId())));
        } else {
            emp.setManager(null);
        }

        // Synchronize linked User entity
        User user = emp.getUser();
        if (user != null) {
            user.setEmail(newEmail);
            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                user.setPasswordChangedAt(LocalDateTime.now());
            }
            userRepository.save(user);
        } else {
            User userByEmail = userRepository.findByEmail(newEmail).orElse(null);
            if (userByEmail != null) {
                userByEmail.setFirstName(req.getFirstName());
                userByEmail.setLastName(req.getLastName());
                if (req.getPassword() != null && !req.getPassword().isBlank()) {
                    userByEmail.setPassword(passwordEncoder.encode(req.getPassword()));
                }
                user = userRepository.save(userByEmail);
            } else {
                String initialPw = (req.getPassword() != null && !req.getPassword().isBlank())
                    ? req.getPassword()
                    : "HRMS@" + LocalDate.now().getYear();
                user = User.builder()
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .email(newEmail)
                    .password(passwordEncoder.encode(initialPw))
                    .role(Role.ROLE_EMPLOYEE)
                    .isActive(true)
                    .emailVerified(false)
                    .build();
                user = userRepository.save(user);
            }
            emp.setUser(user);
        }

        emp.setEmail(newEmail);
        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setPhoneNumber(req.getPhoneNumber());
        emp.setDateOfBirth(req.getDateOfBirth());
        emp.setGender(req.getGender());
        emp.setAddress(req.getAddress());
        emp.setCity(req.getCity());
        emp.setState(req.getState());
        emp.setPincode(req.getPincode());
        emp.setCountry(req.getCountry());
        emp.setDesignation(req.getDesignation());
        emp.setJobTitle(req.getJobTitle());
        emp.setDateOfJoining(req.getDateOfJoining());
        if (req.getEmploymentStatus() != null) emp.setEmploymentStatus(req.getEmploymentStatus());
        if (req.getShiftType() != null) emp.setShiftType(req.getShiftType());
        if (req.getSalary() != null) emp.setSalary(req.getSalary());
        emp.setBankAccountNumber(req.getBankAccountNumber());
        emp.setBankName(req.getBankName());
        emp.setIfscCode(req.getIfscCode());
        emp.setPanNumber(req.getPanNumber());
        emp.setEmergencyContactName(req.getEmergencyContactName());
        emp.setEmergencyContactPhone(req.getEmergencyContactPhone());
        emp.setEmergencyContactRelation(req.getEmergencyContactRelation());

        Employee updated = employeeRepository.save(emp);
        auditService.log("EMPLOYEE_UPDATED", "EMPLOYEE", updated.getId(), "Updated employee " + updated.getFullName() + " (email: " + updated.getEmail() + ")");
        log.info("Employee updated: id={}, email={}, name={}", updated.getId(), updated.getEmail(), updated.getFullName());
        return toResponse(updated);
    }

    public void delete(Long id) {
        Employee emp = findById(id);
        emp.setDeleted(true);
        emp.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employeeRepository.save(emp);
        auditService.log("EMPLOYEE_DELETED", "EMPLOYEE", emp.getId(), "Soft-deleted employee " + emp.getFullName());
        log.info("Employee soft-deleted: {}", emp.getEmployeeNumber());
    }

    public EmployeeResponse uploadProfilePicture(Long id, MultipartFile file, UserDetails userDetails) {
        Employee emp = findById(id);
        if (emp.getUser() != null) {
            verifyOwnerOrAdmin(emp.getUser().getEmail(), userDetails);
        }
        FileValidationUtils.validateImageFile(file, "profile picture");

        String fileName = storeFile(file, profilePictureDir);
        String url = buildFileUrl("profiles", fileName);
        emp.setProfilePictureUrl(url);
        if (emp.getUser() != null) {
            emp.getUser().setProfilePicture(url);
            userRepository.save(emp.getUser());
        }
        Employee saved = employeeRepository.save(emp);
        auditService.log("EMPLOYEE_PHOTO_UPLOAD", "EMPLOYEE", saved.getId(), "Uploaded profile picture for " + saved.getFullName());
        return toResponse(saved);
    }

    public EmployeeResponse uploadProfilePictureForCurrentUser(MultipartFile file, UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Unauthorized");
        }
        Employee emp = employeeRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for user: " + userDetails.getUsername()));
        return uploadProfilePicture(emp.getId(), file, userDetails);
    }

    public EmployeeResponse uploadDocument(Long id, MultipartFile file, UserDetails userDetails) {
        Employee emp = findById(id);
        verifyOwnerOrAdmin(emp.getUser().getEmail(), userDetails);
        FileValidationUtils.validateDocumentFile(file, "document");

        String fileName = storeFile(file, documentDir);
        String url = buildFileUrl("documents", fileName);
        emp.setResumeUrl(url);
        Employee saved = employeeRepository.save(emp);
        auditService.log("EMPLOYEE_DOCUMENT_UPLOAD", "EMPLOYEE", saved.getId(), "Uploaded document for " + saved.getFullName());
        return toResponse(saved);
    }

    private void validateFile(MultipartFile file, String allowedTypes, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No " + fieldName + " file selected");
        }
        String contentType = file.getContentType();
        Set<String> allowed = Arrays.stream(allowedTypes.split(","))
            .map(String::trim)
            .filter(StringUtils::hasText)
            .collect(java.util.stream.Collectors.toSet());
        if (!StringUtils.hasText(contentType) || !allowed.contains(contentType)) {
            throw new BadRequestException("Invalid " + fieldName + " file type");
        }
    }

    private String storeFile(MultipartFile file, String targetDir) {
        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            throw new BadRequestException("Invalid file name");
        }
        String safeName = sanitizeFilename(originalFilename);
        String filename = UUID.randomUUID() + "-" + safeName;
        Path folder = Paths.get(uploadBaseDir).resolve(targetDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(folder);
            Path targetPath = folder.resolve(filename).normalize();
            Files.copy(file.getInputStream(), targetPath);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    private String buildFileUrl(String subFolder, String fileName) {
        String base = contextPath != null && contextPath.endsWith("/") ? contextPath.substring(0, contextPath.length() - 1) : contextPath;
        if (!StringUtils.hasText(base)) {
            base = "";
        }
        return base + "/uploads/" + subFolder + "/" + fileName;
    }

    private void verifyOwnerOrAdmin(String ownerEmail, UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Unauthorized");
        }
        boolean isAdmin = userDetails.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!isAdmin && !ownerEmail.equalsIgnoreCase(userDetails.getUsername())) {
            throw new AccessDeniedException("You are not allowed to upload files for this employee");
        }
    }

    public String getBulkImportTemplate() {
        return "first_name,last_name,email,phone_number,department,designation,date_of_joining,salary,employment_status\n"
             + "Aarav,Sharma,aarav.sharma@example.com,+91 9876543210,Engineering,Software Engineer,2026-06-01,75000,FULL_TIME\n"
             + "Priya,Patel,priya.patel@example.com,+91 9876543211,Human Resources,HR Executive,2026-06-15,60000,PROBATION\n"
             + "Vikram,Rao,vikram.rao@example.com,+91 9876543212,Finance,Accounts Manager,2026-07-01,85000,FULL_TIME\n";
    }

    public com.hrms.dto.response.BulkImportPreviewDto previewBulkImport(MultipartFile file) {
        FileValidationUtils.validateCsvFile(file, "bulk import CSV");

        int totalRows = 0;
        int validRows = 0;
        int errorRows = 0;
        List<com.hrms.dto.response.BulkRowErrorDto> errors = new java.util.ArrayList<>();
        List<com.hrms.dto.response.BulkRowPreviewDto> previewRows = new java.util.ArrayList<>();
        java.util.Set<String> seenEmails = new java.util.HashSet<>();

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {

            String line;
            boolean isHeader = true;
            int rowNumber = 0;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.trim().isEmpty()) continue;
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                totalRows++;
                String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                for (int i = 0; i < cols.length; i++) {
                    cols[i] = cols[i].trim().replaceAll("^\"|\"$", "").trim();
                }

                String firstName = cols.length > 0 ? cols[0] : "";
                String lastName = cols.length > 1 ? cols[1] : "";
                String email = cols.length > 2 ? cols[2].toLowerCase() : "";
                String phone = cols.length > 3 ? cols[3] : "";
                String deptName = cols.length > 4 ? cols[4] : "";
                String designation = cols.length > 5 ? cols[5] : "Associate";
                String dojStr = cols.length > 6 ? cols[6] : "";
                String salaryStr = cols.length > 7 ? cols[7] : "65000";
                String statusStr = cols.length > 8 ? cols[8] : "PROBATION";

                boolean rowValid = true;

                if (firstName.isBlank()) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "first_name", "First name is mandatory", firstName));
                }
                if (lastName.isBlank()) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "last_name", "Last name is mandatory", lastName));
                }
                if (email.isBlank()) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "email", "Email is mandatory", email));
                } else if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "email", "Invalid email format", email));
                } else if (seenEmails.contains(email)) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "email", "Duplicate email within file", email));
                } else if (employeeRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "email", "Email already exists in system", email));
                }
                if (!email.isBlank()) {
                    seenEmails.add(email);
                }

                if (!deptName.isBlank() && !departmentRepository.existsByName(deptName)) {
                    rowValid = false;
                    errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "department", "Department does not exist", deptName));
                }

                if (!dojStr.isBlank()) {
                    try {
                        LocalDate.parse(dojStr);
                    } catch (Exception e) {
                        rowValid = false;
                        errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "date_of_joining", "Invalid date format (expected YYYY-MM-DD)", dojStr));
                    }
                }

                if (!salaryStr.isBlank()) {
                    try {
                        String cleaned = salaryStr.replaceAll("[^0-9.-]", "");
                        BigDecimal sal = new BigDecimal(cleaned);
                        if (sal.compareTo(BigDecimal.ZERO) < 0) {
                            rowValid = false;
                            errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "salary", "Salary must be non-negative", salaryStr));
                        }
                    } catch (Exception e) {
                        rowValid = false;
                        errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "salary", "Invalid numerical salary", salaryStr));
                    }
                }

                if (!statusStr.isBlank()) {
                    try {
                        parseEmploymentStatus(statusStr);
                    } catch (Exception e) {
                        rowValid = false;
                        errors.add(new com.hrms.dto.response.BulkRowErrorDto(rowNumber, "employment_status", "Invalid employment status enum", statusStr));
                    }
                }

                if (rowValid) {
                    validRows++;
                } else {
                    errorRows++;
                }

                previewRows.add(com.hrms.dto.response.BulkRowPreviewDto.builder()
                        .row(rowNumber)
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .phoneNumber(phone)
                        .department(deptName)
                        .designation(designation)
                        .dateOfJoining(dojStr)
                        .salary(salaryStr)
                        .employmentStatus(statusStr)
                        .valid(rowValid)
                        .build());
            }
        } catch (java.io.IOException e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        return com.hrms.dto.response.BulkImportPreviewDto.builder()
                .totalRows(totalRows)
                .validRowsCount(validRows)
                .errorRowsCount(errorRows)
                .errors(errors)
                .previewRows(previewRows)
                .build();
    }

    public com.hrms.dto.response.BulkImportResultDto bulkImport(MultipartFile file) {
        FileValidationUtils.validateCsvFile(file, "bulk import CSV");

        String tenantId = TenantContext.getTenantId();
        int totalRows = 0;
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new java.util.ArrayList<>();
        List<String> importedNumbers = new java.util.ArrayList<>();
        java.util.Set<String> seenEmailsInBatch = new java.util.HashSet<>();
        int currentYear = LocalDate.now().getYear();

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {

            String line;
            boolean isHeader = true;
            int rowNumber = 0;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.trim().isEmpty()) continue;
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header row
                }

                totalRows++;
                String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                for (int i = 0; i < cols.length; i++) {
                    cols[i] = cols[i].trim().replaceAll("^\"|\"$", "").trim();
                }

                if (cols.length < 3) {
                    failureCount++;
                    errors.add("Row " + rowNumber + ": Incomplete columns. First name, last name, and email are required.");
                    continue;
                }

                String firstName = cols[0];
                String lastName = cols.length > 1 ? cols[1] : "";
                String email = cols.length > 2 ? cols[2].toLowerCase() : "";
                String phone = cols.length > 3 ? cols[3] : "";
                String deptName = cols.length > 4 ? cols[4] : "";
                String designation = cols.length > 5 ? cols[5] : "Associate";
                String dojStr = cols.length > 6 ? cols[6] : "";
                String salaryStr = cols.length > 7 ? cols[7] : "65000";
                String statusStr = cols.length > 8 ? cols[8] : "PROBATION";

                if (firstName.isBlank() || email.isBlank()) {
                    failureCount++;
                    errors.add("Row " + rowNumber + ": First name and email are mandatory.");
                    continue;
                }

                if (seenEmailsInBatch.contains(email)) {
                    failureCount++;
                    errors.add("Row " + rowNumber + ": Duplicate email '" + email + "' found within this import file.");
                    continue;
                }
                seenEmailsInBatch.add(email);

                if (employeeRepository.existsByEmail(email) || userRepository.existsByEmail(email)) {
                    failureCount++;
                    errors.add("Row " + rowNumber + ": Email '" + email + "' already exists in the system.");
                    continue;
                }

                try {
                    // 1. Provision User Account
                    String rawPassword = "Welcome@" + (1000 + new java.util.Random().nextInt(9000));
                    User user = User.builder()
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .role(Role.ROLE_EMPLOYEE)
                            .isActive(true)
                            .emailVerified(true)
                            .mustChangePassword(true)
                            .build();
                    if (tenantId != null && !tenantId.isBlank()) {
                        user.setTenantId(tenantId);
                    }
                    user = userRepository.save(user);

                    // 2. Resolve Department
                    Department dept = null;
                    if (!deptName.isBlank()) {
                        dept = departmentRepository.findByName(deptName).orElse(null);
                    }

                    // 3. Resolve Dates & Salary
                    LocalDate doj = LocalDate.now();
                    if (!dojStr.isBlank()) {
                        try {
                            doj = LocalDate.parse(dojStr);
                        } catch (Exception ignored) {}
                    }

                    BigDecimal salary = new BigDecimal("65000.00");
                    if (!salaryStr.isBlank()) {
                        try {
                            salary = new BigDecimal(salaryStr.replaceAll("[^0-9.]", ""));
                        } catch (Exception ignored) {}
                    }

                    EmploymentStatus empStatus = EmploymentStatus.PROBATION;
                    if (!statusStr.isBlank()) {
                        try {
                            empStatus = parseEmploymentStatus(statusStr);
                        } catch (Exception ignored) {}
                    }

                    // 4. Create Employee
                    String empNumber = generateNumber();
                    Employee emp = Employee.builder()
                            .employeeNumber(empNumber)
                            .firstName(firstName)
                            .lastName(lastName)
                            .email(email)
                            .phoneNumber(phone)
                            .designation(designation)
                            .jobTitle(designation)
                            .dateOfJoining(doj)
                            .employmentStatus(empStatus)
                            .shiftType(ShiftType.MORNING)
                            .salary(salary)
                            .leaveBalance(24)
                            .sickLeaveBalance(12)
                            .casualLeaveBalance(8)
                            .department(dept)
                            .user(user)
                            .build();
                    if (tenantId != null && !tenantId.isBlank()) {
                        emp.setTenantId(tenantId);
                    }
                    emp = employeeRepository.save(emp);

                    // 5. Seed Initial Leave Balances
                    List<EmployeeLeaveBalance> balances = List.of(
                            EmployeeLeaveBalance.builder()
                                    .employee(emp).leaveType(LeaveType.ANNUAL)
                                    .allocatedDays(BigDecimal.valueOf(24.0)).usedDays(BigDecimal.ZERO)
                                    .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(24.0))
                                    .year(currentYear).build(),
                            EmployeeLeaveBalance.builder()
                                    .employee(emp).leaveType(LeaveType.SICK)
                                    .allocatedDays(BigDecimal.valueOf(12.0)).usedDays(BigDecimal.ZERO)
                                    .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(12.0))
                                    .year(currentYear).build(),
                            EmployeeLeaveBalance.builder()
                                    .employee(emp).leaveType(LeaveType.CASUAL)
                                    .allocatedDays(BigDecimal.valueOf(8.0)).usedDays(BigDecimal.ZERO)
                                    .pendingDays(BigDecimal.ZERO).balanceDays(BigDecimal.valueOf(8.0))
                                    .year(currentYear).build()
                    );
                    balances.forEach(b -> b.setTenantId(tenantId != null ? tenantId : "default"));
                    leaveBalanceRepository.saveAll(balances);

                    successCount++;
                    importedNumbers.add(empNumber);
                } catch (Exception ex) {
                    failureCount++;
                    errors.add("Row " + rowNumber + " (" + email + "): " + ex.getMessage());
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read CSV stream: " + e.getMessage());
        }

        auditService.log("EMPLOYEES_BULK_IMPORTED", "EMPLOYEE", null,
                "Bulk imported " + successCount + " employees with " + failureCount + " failures");

        return com.hrms.dto.response.BulkImportResultDto.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .importedEmployeeNumbers(importedNumbers)
                .build();
    }

    private EmploymentStatus parseEmploymentStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) {
            return EmploymentStatus.PROBATION;
        }
        String clean = statusStr.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if (clean.equals("FULL_TIME") || clean.equals("PERMANENT") || clean.equals("CONFIRMED")) {
            return EmploymentStatus.ACTIVE;
        }
        return EmploymentStatus.valueOf(clean);
    }

    private String sanitizeFilename(String originalFilename) {
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private Employee findById(Long id) {
        return employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee","id",id));
    }

    private String generateNumber() {
        int year = LocalDate.now().getYear();
        long count = employeeRepository.count() + 1;
        return String.format("EMP-%d-%04d", year, count);
    }

    @Transactional(readOnly = true)
    public String exportEmployeesCsv(boolean masked) {
        String tenantId = TenantContext.getTenantId();
        List<Employee> employees = (tenantId != null && !tenantId.isBlank() && !"default".equalsIgnoreCase(tenantId))
                ? employeeRepository.findByTenantId(tenantId)
                : employeeRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("EmployeeNumber,FirstName,LastName,Email,Department,Designation,Status,Phone,Salary,BankAccountNumber,DateOfJoining\n");
        for (Employee emp : employees) {
            String phone = emp.getPhoneNumber() != null ? emp.getPhoneNumber() : "";
            String salary = emp.getSalary() != null ? emp.getSalary().toPlainString() : "";
            String bankAcc = emp.getBankAccountNumber() != null ? emp.getBankAccountNumber() : "";

            if (masked) {
                phone = phone.length() > 4 ? "••••••" + phone.substring(phone.length() - 4) : "••••";
                salary = "••••••";
                bankAcc = bankAcc.length() > 4 ? "••••••••" + bankAcc.substring(bankAcc.length() - 4) : "••••••••";
            }

            sb.append("\"").append(escapeCsv(emp.getEmployeeNumber())).append("\",")
              .append("\"").append(escapeCsv(emp.getFirstName())).append("\",")
              .append("\"").append(escapeCsv(emp.getLastName())).append("\",")
              .append("\"").append(escapeCsv(emp.getEmail())).append("\",")
              .append("\"").append(emp.getDepartment() != null ? escapeCsv(emp.getDepartment().getName()) : "").append("\",")
              .append("\"").append(escapeCsv(emp.getDesignation())).append("\",")
              .append("\"").append(emp.getEmploymentStatus() != null ? emp.getEmploymentStatus().name() : "").append("\",")
              .append("\"").append(escapeCsv(phone)).append("\",")
              .append("\"").append(escapeCsv(salary)).append("\",")
              .append("\"").append(escapeCsv(bankAcc)).append("\",")
              .append(emp.getDateOfJoining() != null ? emp.getDateOfJoining().toString() : "").append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }

    public EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
            .id(e.getId()).employeeNumber(e.getEmployeeNumber())
            .userId(e.getUser() != null ? e.getUser().getId() : null)
            .firstName(e.getFirstName()).lastName(e.getLastName()).fullName(e.getFullName())
            .email(e.getEmail()).phoneNumber(e.getPhoneNumber())
            .dateOfBirth(e.getDateOfBirth()).gender(e.getGender())
            .address(e.getAddress()).city(e.getCity()).state(e.getState())
            .pincode(e.getPincode()).country(e.getCountry())
            .designation(e.getDesignation()).jobTitle(e.getJobTitle())
            .dateOfJoining(e.getDateOfJoining()).dateOfLeaving(e.getDateOfLeaving())
            .employmentStatus(e.getEmploymentStatus()).shiftType(e.getShiftType())
            .salary(e.getSalary()).panNumber(e.getPanNumber())
            .bankAccountNumber(e.getBankAccountNumber()).bankName(e.getBankName()).ifscCode(e.getIfscCode())
            .emergencyContactName(e.getEmergencyContactName())
            .emergencyContactPhone(e.getEmergencyContactPhone())
            .emergencyContactRelation(e.getEmergencyContactRelation())
            .leaveBalance(e.getLeaveBalance()).sickLeaveBalance(e.getSickLeaveBalance())
            .casualLeaveBalance(e.getCasualLeaveBalance())
            .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
            .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
            .managerId(e.getManager() != null ? e.getManager().getId() : null)
            .managerName(e.getManager() != null ? e.getManager().getFullName() : null)
            .profilePictureUrl(e.getProfilePictureUrl()).resumeUrl(e.getResumeUrl())
            .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }
}
