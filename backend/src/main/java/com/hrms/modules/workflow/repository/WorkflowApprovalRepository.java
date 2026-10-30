package com.hrms.modules.workflow.repository;

import com.hrms.modules.workflow.entity.WorkflowApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowApprovalRepository extends JpaRepository<WorkflowApproval, Long> {
    List<WorkflowApproval> findByWorkflowInstanceIdOrderByStepOrderAsc(Long workflowInstanceId);
    List<WorkflowApproval> findByApproverIdOrderByDecidedAtDesc(Long approverId);
}
