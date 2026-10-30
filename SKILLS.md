# HRMS Enterprise Engineering Skills & Architectural Standards (SKILLS.md)

**System**: Enterprise Human Resource Management System (HRMS) SaaS Platform v2.0  
**Target Architectural Standard**: Workday, Rippling, Darwinbox, SAP SuccessFactors  
**Role Specification**: Senior Principal Architect & Senior Full-Stack Staff Engineer  
**Mandate**: Any AI agent or developer building, modifying, or auditing this codebase MUST strictly adhere to these 6 engineering pillars. Blind templates, generic gamer themes, unbounded database queries, and unverified code delivery are strictly forbidden.

---

## Pillar 1: Backend Engineering & Clean Modular Monolith
*Tech Stack: Spring Boot 3.2.3, Java 21, Maven/javac, PostgreSQL 18*

1. **Thin Controllers, Rich Services**:
   - Controllers MUST only handle HTTP routing, serialization, parameter parsing, and validation triggers. Zero business logic, zero SQL, zero repository orchestration in controllers.
   - Every controller endpoint returns `ResponseEntity<ApiResponse<T>>` with standard envelope:
     ```json
     {
       "success": true,
       "message": "Descriptive message",
       "data": { ... },
       "timestamp": "2026-10-30T17:30:00"
     }
     ```
2. **1:1 Package-by-Feature Domain Symmetry**:
   - Every feature lives in `com.hrms.modules.<feature>` mirroring the frontend `src/modules/<feature>`.
   - Packages contain: `controller/`, `service/`, `repository/`, `entity/`, `dto/`.
3. **DTO Separation & No Entity Leaks**:
   - Entities MUST NEVER be returned directly from controller methods. Always map to immutable Request/Response DTOs.
   - Avoid circular JSON serialization by explicitly avoiding direct entity exposure.
4. **Transaction Boundaries**:
   - Mutating service methods MUST declare `@Transactional(rollbackFor = Exception.class)`.
   - Query-only service methods MUST declare `@Transactional(readOnly = true)`.
5. **Centralized Exception Handling**:
   - Never catch exceptions silently. Throw semantic exceptions (`BadRequestException`, `ResourceNotFoundException`, `AccessDeniedException`).
   - All errors pass through `@RestControllerAdvice` returning structured error responses with HTTP 4xx/5xx codes.

---

## Pillar 2: Database Performance & Strict Repository Discipline
*Tech Stack: PostgreSQL 18, Spring Data JPA, Hibernate, Flyway*

1. **STRICT BAN ON UNBOUNDED `findAll()`**:
   - **Rule**: `repository.findAll()` is strictly banned in all production service workflows to prevent Out-Of-Memory (OOM) heap crashes and cross-tenant data leaks.
   - Every collection query MUST be paginated using `Pageable pageable` and return `Page<T>` or `Slice<T>`.
   - Maximum page size must be capped (default `size = 20`, maximum limit `100`).
2. **Mandatory Tenant Scoping**:
   - Every query MUST filter by `tenant_id`:
     ```java
     // FORBIDDEN:
     List<Employee> findAll();
     
     // MANDATORY:
     Page<Employee> findByTenantId(String tenantId, Pageable pageable);
     Page<Employee> findByTenantIdAndStatus(String tenantId, String status, Pageable pageable);
     ```
3. **Elimination of Hibernate N+1 Query Storms**:
   - Use explicit JPQL with `JOIN FETCH` for required `@ManyToOne` or `@OneToMany` relationships:
     ```java
     @Query("SELECT e FROM Employee e JOIN FETCH e.department WHERE e.tenantId = :tenantId")
     Page<Employee> findAllWithDepartment(@Param("tenantId") String tenantId, Pageable pageable);
     ```
4. **Schema Evolution via Flyway Only**:
   - Never rely on `hibernate.ddl-auto: update`.
   - All schema changes must be documented in versioned, immutable scripts: `backend/src/main/resources/db/migration/V{N}__{description}.sql`.
5. **Strict Data Types**:
   - Currency & Financials: Strictly `NUMERIC(12, 2)` or `NUMERIC(14, 2)`. Floats/doubles forbidden.
   - Timestamps: Strictly `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`).
   - Indices: Every Foreign Key and multi-tenant filter pair `(tenant_id, created_at DESC)` must have an explicit B-tree index.

---

## Pillar 3: Enterprise Security & Defense-in-Depth
*Tech Stack: Spring Security 6, JWT (HMAC-SHA256), BCrypt, Redis Blacklist, Threat Mitigation*

1. **Row-Level Multi-Tenant Isolation**:
   - `TenantContextFilter` resolves `X-Tenant-ID` or JWT claims into `TenantContext` (ThreadLocal).
   - **Critical Thread Safety Cleanup**: The filter MUST execute `TenantContext.clear()` in a `finally` block to prevent Tomcat thread pool reuse leakage:
     ```java
     try {
         TenantContext.setTenantId(tenantId);
         filterChain.doFilter(request, response);
     } finally {
         TenantContext.clear();
     }
     ```
2. **Credential Lifecycle & Zero Plaintext**:
   - Passwords must be hashed using BCrypt. Auto-generated temporary passwords must flag `must_change_password = true`.
   - Users with `mustChangePassword = true` are strictly quarantined to `/first-login-change-password` until rotated.
   - 6-digit OTPs must use cryptographically secure `SecureRandom`, single-use with 10-minute maximum TTL.
3. **Fine-Grained Authorization (RBAC + ABAC)**:
   - Sensitive endpoints must declare `@PreAuthorize("hasAnyAuthority(...)")`.
   - Attribute-Based Access Control (ABAC): Employees can ONLY access their own records (`#employeeId == principal.employeeId`). Managers can only approve requests in their hierarchy.
4. **Token Revocation & Blacklisting**:
   - On logout, tokens are blacklisted via Redis (with resilient in-memory fallback) until token expiry.
5. **PII Masking & Injection Immunity**:
   - Bank account numbers, PAN, and salary details must be masked in logs (`XXXXXX1234`).
   - Zero SQL concatenation; 100% parameterized JPQL/PreparedStatement.
   - Frontend sanitizes rich HTML input using `DOMPurify`.

---

## Pillar 4: Frontend Modularity & Enterprise Architecture
*Tech Stack: React 18, Vite, Redux Toolkit, React Router 6, TailwindCSS*

1. **Domain-Driven Feature Slices**:
   - File organization mirrors backend modules:
     ```
     frontend/src/
     ├── api/                     <-- Dedicated client per module (apiClient wrapper)
     ├── components/common/       <-- Reusable design system atoms
     ├── components/layout/       <-- Shell, Sidebar, Header, ProtectedRoute
     ├── modules/<feature>/       <-- Pages, domain subcomponents, hooks
     └── store/slices/            <-- Global session/auth slices
     ```
2. **Defensive Async UI States**:
   - Every asynchronous screen MUST explicitly handle all 4 states:
     - **Loading**: High-contrast `<Spinner size="lg" />`
     - **Empty**: Contextual `<EmptyState icon={...} title="..." description="..." action={...} />`
     - **Error**: Informative alert banner with actionable retry button
     - **Loaded**: High-density corporate data view
3. **API Centralization & Form Hygiene**:
   - No direct `axios` or `fetch` calls inside components. All requests flow through `src/api/<module>API.js`.
   - Forms must maintain controlled React state with client-side validation before triggering network calls.

---

## Pillar 5: Bespoke Corporate SaaS UI/UX Design System
*Standards: Workday / Rippling Tier-1 Visual Standards (Anti-Generic Template)*

1. **Anti-Gamer / Anti-Neon Aesthetic Rule**:
   - No dark arcade pills, neon borders, or pitch-black operational cards.
   - **Canvas**: Subtle off-white `#f8fafc` (`bg-slate-50`).
   - **Cards**: Pure white `#ffffff`, 1px crisp border `#e2e8f0` (`border-slate-200`), rounded-2xl (`rounded-2xl`), subtle shadows (`shadow-sm`).
   - **Text**: Header `#0f172a` (`text-slate-900`), body `#334155` (`text-slate-700`), metadata `#64748b` (`text-slate-500`).
2. **Semantic Status Badging System**:
   - High-contrast pastel backgrounds with matching borders and bold text:
     - Success: `bg-emerald-50 text-emerald-700 border-emerald-200`
     - Warning: `bg-amber-50 text-amber-700 border-amber-200`
     - Danger / Critical SLA: `bg-red-50 text-red-700 border-red-200`
     - Info / In Progress: `bg-blue-50 text-blue-700 border-blue-200`
     - Leadership / Pinned: `bg-purple-50 text-purple-700 border-purple-200`
3. **Vector Document & Typography Integrity**:
   - Standard banking notation for currency (`INR 85,000.00` instead of raw symbols `₹` which break WinAnsi PDF encoding).
   - Strict jsPDF graphics state isolation (`doc.setFillColor(...)` preceding every filled rectangle).
   - Employee names, job titles, and departments must be formatted in **Title Case** (`Chelikam Charan Kumar`).

---

## Pillar 6: Senior QA Automation & Continuous Verification Gate
*Mandate: Zero Mocks for End-to-End Testing; 100% Pass Rate Requirement*

1. **Verification Before Task Concluding**:
   - No task, feature, or milestone is complete without a dedicated, repeatable automated PowerShell or REST script testing against the live PostgreSQL database and running server.
2. **Master Regression Protocol**:
   - The entire test catalog must pass with 100% success before closing turns:
     1. `test_phase4_milestone1_email_and_auth.ps1`
     2. `test_phase4_milestone2_attendance_payroll.ps1`
     3. `test_phase4_milestone3_offboarding_settlement.ps1`
     4. `test_it_service_desk_and_communication.ps1`
     5. `run_senior_qa_e2e_tests.ps1`
3. **Frontend Build Health**:
   - `npm run build` must succeed with exit code 0 and zero bundling/syntax errors.
