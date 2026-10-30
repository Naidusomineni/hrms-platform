package com.hrms.modules.shift.repository;

import com.hrms.modules.shift.entity.ShiftSwapRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSwapRequestRepository extends JpaRepository<ShiftSwapRequest, Long> {

    @Query("SELECT s FROM ShiftSwapRequest s JOIN FETCH s.requesterEmployee re JOIN FETCH s.targetEmployee te JOIN FETCH s.requesterRoster rr JOIN FETCH rr.shift JOIN FETCH s.targetRoster tr JOIN FETCH tr.shift WHERE s.tenantId = :tenantId AND s.requesterEmployee.id = :empId ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findOutgoingSwaps(@Param("tenantId") String tenantId, @Param("empId") Long empId);

    @Query("SELECT s FROM ShiftSwapRequest s JOIN FETCH s.requesterEmployee re JOIN FETCH s.targetEmployee te JOIN FETCH s.requesterRoster rr JOIN FETCH rr.shift JOIN FETCH s.targetRoster tr JOIN FETCH tr.shift WHERE s.tenantId = :tenantId AND s.targetEmployee.id = :empId ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findIncomingSwaps(@Param("tenantId") String tenantId, @Param("empId") Long empId);

    @Query("SELECT s FROM ShiftSwapRequest s JOIN FETCH s.requesterEmployee re JOIN FETCH s.targetEmployee te JOIN FETCH s.requesterRoster rr JOIN FETCH rr.shift JOIN FETCH s.targetRoster tr JOIN FETCH tr.shift WHERE s.tenantId = :tenantId AND s.status = :status ORDER BY s.createdAt DESC")
    Page<ShiftSwapRequest> findByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") String status, Pageable pageable);

    @Query("SELECT s FROM ShiftSwapRequest s JOIN FETCH s.requesterEmployee re JOIN FETCH s.targetEmployee te JOIN FETCH s.requesterRoster rr JOIN FETCH rr.shift JOIN FETCH s.targetRoster tr JOIN FETCH tr.shift WHERE s.tenantId = :tenantId AND s.peerStatus = 'PEER_ACCEPTED' AND s.managerStatus = 'PENDING_MANAGER' ORDER BY s.createdAt DESC")
    List<ShiftSwapRequest> findPendingManagerApprovals(@Param("tenantId") String tenantId);
}
