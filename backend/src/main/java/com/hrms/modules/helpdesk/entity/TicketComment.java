package com.hrms.modules.helpdesk.entity;

import com.hrms.entity.BaseTenantEntity;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "ticket_comments",
    indexes = {
        @Index(name = "idx_ticket_comments_ticket", columnList = "ticket_id")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketComment extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "comment_text", columnDefinition = "TEXT", nullable = false)
    private String commentText;

    @Column(name = "is_internal", nullable = false)
    @Builder.Default
    private Boolean isInternal = false;
}
