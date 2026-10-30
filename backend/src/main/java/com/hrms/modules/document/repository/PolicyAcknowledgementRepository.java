package com.hrms.modules.document.repository;

import com.hrms.modules.document.entity.PolicyAcknowledgement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyAcknowledgementRepository extends JpaRepository<PolicyAcknowledgement, Long> {
    Optional<PolicyAcknowledgement> findByDocumentIdAndEmployeeId(Long documentId, Long employeeId);
    List<PolicyAcknowledgement> findByEmployeeId(Long employeeId);
}
