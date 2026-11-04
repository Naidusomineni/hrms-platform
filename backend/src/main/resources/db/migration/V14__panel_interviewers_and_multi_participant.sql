-- V14: Multi-Interviewer Technical Panels & Collaborative Evaluation

CREATE TABLE IF NOT EXISTS interview_panelists (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    interview_session_id BIGINT NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'PANELIST', -- LEAD_INTERVIEWER, TECH_PANELIST, HR_OBSERVER, SHADOW
    joined_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_panelist UNIQUE (interview_session_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_interview_panelists_tenant ON interview_panelists(tenant_id, interview_session_id);
CREATE INDEX IF NOT EXISTS idx_interview_panelists_employee ON interview_panelists(employee_id);
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_session_interviewer ON interview_scorecards(interview_session_id, interviewer_id);
