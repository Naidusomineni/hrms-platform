package com.hrms.service.impl;

import com.hrms.dto.request.EmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.*;
import com.hrms.enums.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import com.hrms.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

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

        return toResponse(employeeRepository.save(emp));
    }

    public void delete(Long id) {
        Employee emp = findById(id);
        emp.setDeleted(true);
        emp.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employeeRepository.save(emp);
        log.info("Employee soft-deleted: {}", emp.getEmployeeNumber());
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
