package com.hrms.modules.workflow.repository;

import com.hrms.modules.workflow.entity.WorkflowInstance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, Long> {
    Optional<WorkflowInstance> findByTenantIdAndEntityTypeAndEntityId(String tenantId, String entityType, Long entityId);
    Page<WorkflowInstance> findByTenantIdAndStatus(String tenantId, String status, Pageable pageable);
    List<WorkflowInstance> findByTenantIdAndInitiatedById(String tenantId, Long userId);
}
