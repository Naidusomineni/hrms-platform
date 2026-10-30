package com.hrms.modules.helpdesk.repository;

import com.hrms.modules.helpdesk.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    List<TicketComment> findByTicketIdAndIsInternalFalseOrderByCreatedAtAsc(Long ticketId);
}
