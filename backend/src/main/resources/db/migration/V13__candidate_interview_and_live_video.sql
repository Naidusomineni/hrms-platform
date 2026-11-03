-- V13: In-App Candidate Interview & Native Live Video Calling with Proxy Prevention Telemetry

CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_posting_id BIGINT REFERENCES job_postings(id) ON DELETE SET NULL,
    interviewer_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    round_name VARCHAR(100) NOT NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    room_name VARCHAR(150) NOT NULL UNIQUE,
    guest_access_token VARCHAR(128) NOT NULL UNIQUE,
    guest_token_expiry TIMESTAMP NOT NULL,
    meeting_link VARCHAR(255),
    interviewer_joined_at TIMESTAMP,
    candidate_joined_at TIMESTAMP,
    completed_at TIMESTAMP,
    interview_notes TEXT,
    integrity_status VARCHAR(50) DEFAULT 'CLEAN',
    integrity_details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_tenant ON interview_sessions(tenant_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate ON interview_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_guest_token ON interview_sessions(guest_access_token);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_interviewer ON interview_sessions(interviewer_id);

-- Link existing scorecards to the interview session
ALTER TABLE interview_scorecards
    ADD COLUMN IF NOT EXISTS interview_session_id BIGINT REFERENCES interview_sessions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS integrity_score INT DEFAULT 100,
    ADD COLUMN IF NOT EXISTS integrity_summary TEXT;
