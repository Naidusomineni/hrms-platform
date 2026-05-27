package com.hrms.service.impl;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.DepartmentResponse;
import com.hrms.entity.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentResponse create(DepartmentRequest req) {
        if (departmentRepository.existsByName(req.getName()))
            throw new DuplicateResourceException("Department","name",req.getName());
        if (req.getCode() != null && departmentRepository.existsByCode(req.getCode()))
            throw new DuplicateResourceException("Department","code",req.getCode());

        Employee manager = req.getManagerId() != null
            ? employeeRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getManagerId()))
            : null;

        Department dept = Department.builder()
            .name(req.getName()).code(req.getCode())
            .description(req.getDescription()).location(req.getLocation())
            .budget(req.getBudget()).isActive(true).manager(manager)
            .build();
        return toResponse(departmentRepository.save(dept));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public DepartmentResponse update(Long id, DepartmentRequest req) {
        Department dept = findById(id);
        if (!dept.getName().equals(req.getName()) && departmentRepository.existsByName(req.getName()))
            throw new DuplicateResourceException("Department","name",req.getName());
        dept.setName(req.getName()); dept.setCode(req.getCode());
        dept.setDescription(req.getDescription()); dept.setLocation(req.getLocation());
        dept.setBudget(req.getBudget());
        if (req.getManagerId() != null)
            dept.setManager(employeeRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee","id",req.getManagerId())));
        return toResponse(departmentRepository.save(dept));
    }

    public void delete(Long id) {
        Department dept = findById(id);
        dept.setDeleted(true); dept.setIsActive(false);
        departmentRepository.save(dept);
    }

    private Department findById(Long id) {
        return departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department","id",id));
    }

    private DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.builder()
            .id(d.getId()).name(d.getName()).code(d.getCode())
            .description(d.getDescription()).location(d.getLocation())
            .budget(d.getBudget()).isActive(d.getIsActive())
            .employeeCount((long)(d.getEmployees() != null ? d.getEmployees().size() : 0))
            .managerName(d.getManager() != null ? d.getManager().getFullName() : null)
            .managerId(d.getManager() != null ? d.getManager().getId() : null)
            .createdAt(d.getCreatedAt()).build();
    }
}
