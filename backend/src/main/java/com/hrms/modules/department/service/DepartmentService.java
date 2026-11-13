package com.hrms.modules.department.service;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.DepartmentResponse;
import com.hrms.entity.*;
import com.hrms.exception.*;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @Slf4j @RequiredArgsConstructor @Transactional
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final com.hrms.common.audit.AuditService auditService;

    @CacheEvict(value = "departments", allEntries = true)
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
        Department saved = departmentRepository.save(dept);
        auditService.log("DEPARTMENT_CREATED", "DEPARTMENT", saved.getId(), "Created department " + saved.getName() + " (" + saved.getCode() + ")");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "departments", key = "T(com.hrms.infrastructure.multitenancy.context.TenantContext).getTenantId()")
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @CacheEvict(value = "departments", allEntries = true)
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
        Department saved = departmentRepository.save(dept);
        auditService.log("DEPARTMENT_UPDATED", "DEPARTMENT", saved.getId(), "Updated department " + saved.getName());
        return toResponse(saved);
    }

    @CacheEvict(value = "departments", allEntries = true)
    public void delete(Long id) {
        Department dept = findById(id);
        dept.setDeleted(true); dept.setIsActive(false);
        departmentRepository.save(dept);
        auditService.log("DEPARTMENT_DELETED", "DEPARTMENT", dept.getId(), "Deactivated department " + dept.getName());
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
