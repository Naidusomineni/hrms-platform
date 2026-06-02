package com.hrms.service.impl;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.service.EmailService;
import com.hrms.service.impl.AuditService;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
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

        String password = req.getPassword() != null ? req.getPassword() : "HRMS@" + LocalDate.now().getYear();

        User user = User.builder()
            .firstName(req.getFirstName()).lastName(req.getLastName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(password))
            .role(Role.ROLE_EMPLOYEE)
            .isActive(true).emailVerified(false)
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
        emailService.sendWelcomeEmail(emp.getEmail(), emp.getFirstName(), password);
        auditService.log("EMPLOYEE_CREATED", "EMPLOYEE", emp.getId(), "Created employee " + emp.getFullName());
        log.info("Employee created: {} ({})", emp.getFullName(), emp.getEmployeeNumber());
        return toResponse(emp);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAll(String search, Pageable pageable) {
        Page<Employee> page = (search != null && !search.isBlank())
            ? employeeRepository.search(search.trim(), pageable)
            : employeeRepository.findAll(pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getByDepartment(Long deptId, Pageable pageable) {
        return employeeRepository.findByDepartmentId(deptId, pageable).map(this::toResponse);
    }

    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee emp = findById(id);
        if (!emp.getEmail().equalsIgnoreCase(req.getEmail()) && employeeRepository.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Employee","email",req.getEmail());

        if (req.getDepartmentId() != null)
            emp.setDepartment(departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department","id",req.getDepartmentId())));

        if (req.getManagerId() != null)
            emp.setManager(employeeRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getManagerId())));

        emp.setFirstName(req.getFirstName()); emp.setLastName(req.getLastName());
        emp.setPhoneNumber(req.getPhoneNumber()); emp.setDateOfBirth(req.getDateOfBirth());
        emp.setGender(req.getGender()); emp.setAddress(req.getAddress());
        emp.setCity(req.getCity()); emp.setState(req.getState());
        emp.setPincode(req.getPincode()); emp.setCountry(req.getCountry());
        emp.setDesignation(req.getDesignation()); emp.setJobTitle(req.getJobTitle());
        emp.setDateOfJoining(req.getDateOfJoining());
        if (req.getEmploymentStatus() != null) emp.setEmploymentStatus(req.getEmploymentStatus());
        if (req.getShiftType() != null) emp.setShiftType(req.getShiftType());
        if (req.getSalary() != null) emp.setSalary(req.getSalary());
        emp.setEmergencyContactName(req.getEmergencyContactName());
        emp.setEmergencyContactPhone(req.getEmergencyContactPhone());
        emp.setEmergencyContactRelation(req.getEmergencyContactRelation());

        Employee updated = employeeRepository.save(emp);
        auditService.log("EMPLOYEE_UPDATED", "EMPLOYEE", updated.getId(), "Updated employee " + updated.getFullName());
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
        verifyOwnerOrAdmin(emp.getUser().getEmail(), userDetails);
        validateFile(file, allowedImageTypes, "image");

        String fileName = storeFile(file, profilePictureDir);
        String url = buildFileUrl("profiles", fileName);
        emp.setProfilePictureUrl(url);
        Employee saved = employeeRepository.save(emp);
        auditService.log("EMPLOYEE_PHOTO_UPLOAD", "EMPLOYEE", saved.getId(), "Uploaded profile picture for " + saved.getFullName());
        return toResponse(saved);
    }

    public EmployeeResponse uploadDocument(Long id, MultipartFile file, UserDetails userDetails) {
        Employee emp = findById(id);
        verifyOwnerOrAdmin(emp.getUser().getEmail(), userDetails);
        validateFile(file, allowedDocTypes, "document");

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

    public EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
            .id(e.getId()).employeeNumber(e.getEmployeeNumber())
            .firstName(e.getFirstName()).lastName(e.getLastName()).fullName(e.getFullName())
            .email(e.getEmail()).phoneNumber(e.getPhoneNumber())
            .dateOfBirth(e.getDateOfBirth()).gender(e.getGender())
            .address(e.getAddress()).city(e.getCity()).state(e.getState())
            .pincode(e.getPincode()).country(e.getCountry())
            .designation(e.getDesignation()).jobTitle(e.getJobTitle())
            .dateOfJoining(e.getDateOfJoining()).dateOfLeaving(e.getDateOfLeaving())
            .employmentStatus(e.getEmploymentStatus()).shiftType(e.getShiftType())
            .salary(e.getSalary()).panNumber(e.getPanNumber())
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
