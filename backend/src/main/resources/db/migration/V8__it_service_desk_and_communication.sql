-- ═══════════════════════════════════════════════════════════════════════
-- V8: IT Service Desk, Helpdesk SLA Ticketing & Company Announcements
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    ticket_number VARCHAR(32) NOT NULL,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    category VARCHAR(32) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    asset_id BIGINT REFERENCES assets(id),
    assigned_to BIGINT REFERENCES users(id),
    sla_deadline TIMESTAMP,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status ON support_tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_emp ON support_tickets(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(tenant_id, assigned_to);

-- 2. Ticket Comments / Collaboration Log
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    comment_text TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- 3. Company Announcements / Communication Feed
CREATE TABLE IF NOT EXISTS company_announcements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'GENERAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    target_audience VARCHAR(32) NOT NULL DEFAULT 'ALL',
    department_id BIGINT REFERENCES departments(id),
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    acknowledgment_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_tenant_pub ON company_announcements(tenant_id, published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON company_announcements(tenant_id, pinned);

-- 4. Announcement Acknowledgments
CREATE TABLE IF NOT EXISTS announcement_acknowledgments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    announcement_id BIGINT NOT NULL REFERENCES company_announcements(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    acknowledged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_announcement_user UNIQUE (tenant_id, announcement_id, user_id)
);
