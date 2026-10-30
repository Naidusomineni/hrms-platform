package com.hrms.modules.workflow.repository;

import com.hrms.modules.workflow.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, Long> {
    Optional<WorkflowDefinition> findByTenantIdAndModuleTypeAndIsActiveTrue(String tenantId, String moduleType);
    List<WorkflowDefinition> findByTenantId(String tenantId);
}
