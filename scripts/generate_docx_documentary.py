import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_header_styled(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    run = h.runs[0]
    run.font.name = 'Arial'
    if level == 1:
        run.font.size = Pt(17)
        run.font.bold = True
        run.font.color.rgb = RGBColor(15, 23, 42) # Navy Dark
        h.paragraph_format.space_before = Pt(22)
        h.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 41, 59) # Slate Dark
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(37, 99, 235) # Accent Blue
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(2)
    return h

def add_callout(doc, title, text, bg_color="EFF6FF", border_color="2563EB"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)

    # Set left border only
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r1 = p.add_run(f"{title}\n")
    r1.font.name = 'Arial'
    r1.font.size = Pt(10.5)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(29, 78, 216)

    r2 = p.add_run(text)
    r2.font.name = 'Arial'
    r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor(51, 65, 85)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def add_image_box(doc, img_path, caption, width=Inches(6.2)):
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=width)

        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(0)
        p_cap.paragraph_format.space_after = Pt(10)
        run_cap = p_cap.add_run(caption)
        run_cap.font.name = 'Arial'
        run_cap.font.size = Pt(9)
        run_cap.font.italic = True
        run_cap.font.color.rgb = RGBColor(100, 116, 139)

def add_step(doc, num, title, description):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(3)

    r_num = p.add_run(f"Step {num}: {title} — ")
    r_num.font.name = 'Arial'
    r_num.font.bold = True
    r_num.font.size = Pt(10.5)
    r_num.font.color.rgb = RGBColor(15, 23, 42)

    r_desc = p.add_run(description)
    r_desc.font.name = 'Arial'
    r_desc.font.size = Pt(10)
    r_desc.font.color.rgb = RGBColor(71, 85, 105)

def build_document():
    doc = docx.Document()
    
    # Configure 0.8 inch margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    diag_dir = os.path.join(base_dir, "docs", "diagrams")
    screens_dir = os.path.join(base_dir, "docs", "screenshots")

    # ---------------------------------------------------------
    # COVER / TITLE BLOCK
    # ---------------------------------------------------------
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_after = Pt(2)
    r_pre = p_pre.add_run("ENTERPRISE WORKFORCE MANAGEMENT PLATFORM")
    r_pre.font.name = 'Arial'
    r_pre.font.size = Pt(11)
    r_pre.font.bold = True
    r_pre.font.color.rgb = RGBColor(16, 185, 129) # Emerald Green

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("Production Technical Blueprint & Operational Flow Documentary")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_after = Pt(16)
    r_meta = p_meta.add_run(
        "Application Version: 2.4.0-ENTERPRISE  |  Target Audience: CTO, Lead Architects, SecOps, Auditors\n"
        "Core Stack: Spring Boot 3.2.3 (Java 21 LTS) • PostgreSQL 18 • React 18 SPA • Redux Toolkit • Docker"
    )
    r_meta.font.name = 'Arial'
    r_meta.font.size = Pt(10)
    r_meta.font.color.rgb = RGBColor(100, 116, 139)

    add_callout(doc, "DOCUMENT EXECUTIVE SUMMARY",
        "This master reference document provides the complete end-to-end operational blueprint of the HRMS application. "
        "It integrates all 21 modular domains, concrete visual flowcharts, step-by-step numbered walkthroughs, "
        "exact mathematical formulations for biometric time-tracking and statutory payroll, and code-level failure defenses.",
        bg_color="F8FAFC", border_color="0F172A"
    )

    # ---------------------------------------------------------
    # SECTION 1: HIGH-LEVEL SYSTEM ARCHITECTURE
    # ---------------------------------------------------------
    add_header_styled(doc, "1. High-Level System Architecture & Ingress Flow", level=1)
    
    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "The HRMS platform runs as a high-scale Modular Monolith. When an employee or manager accesses the platform via browser, "
        "their request hits an Nginx reverse proxy and an IP rate limiter before reaching the Spring Boot 3 core. Every company's "
        "data is strictly isolated in PostgreSQL 18 using a discriminator column (tenant_id), ensuring complete multi-tenant privacy."
    )

    add_image_box(doc, os.path.join(diag_dir, "01_system_architecture.png"), 
        "Figure 1.1 — End-to-End System Ingress, Security Filters, Monolith Core, and PostgreSQL 18 Multi-Tenant Layer")

    add_header_styled(doc, "Step-by-Step Architectural Ingress Trace", level=2)
    add_step(doc, 1, "Client Action (React 18 SPA)", "User performs an action in the frontend. Axios injects the HMAC-SHA256 JWT Bearer token and the organization header (X-Tenant-ID: eoxys).")
    add_step(doc, 2, "Rate Limiting Ingress (Bucket4j)", "RateLimitFilter checks the client IP against an in-memory token bucket (120 req/min limit) to prevent brute-force and DoS attacks.")
    add_step(doc, 3, "Correlation ID Injection", "RequestIdFilter creates a unique UUID (X-Request-ID) and binds it to Logback's MDC for distributed logging across micro-operations.")
    add_step(doc, 4, "ThreadLocal Multi-Tenant Binding", "TenantContextFilter extracts X-Tenant-ID and stores it in Java's ThreadLocal storage, guaranteeing isolation on Tomcat worker threads.")
    add_step(doc, 5, "JWT Security & Role Evaluation", "JwtAuthenticationFilter validates the cryptographic token signature and injects role permissions (e.g. ROLE_HR, ROLE_EMPLOYEE) into Spring's SecurityContext.")
    add_step(doc, 6, "Transactional Domain Execution", "The matching Spring @Transactional service executes business logic, performs mathematical calculations, and accesses PostgreSQL 18 via HikariCP.")
    add_step(doc, 7, "Memory Sanitization (Mandatory Finally Block)", "Upon request completion, TenantContext.clear() executes to prevent ThreadLocal memory leaks in Tomcat's pooled threads.")

    add_image_box(doc, os.path.join(screens_dir, "01_login_page.png"), 
        "Figure 1.2 — Corporate SaaS Ingress & 2FA TOTP Authentication Screen", width=Inches(5.0))

    # ---------------------------------------------------------
    # SECTION 2: ROLE-BASED ACTIONS MATRIX (RBAC)
    # ---------------------------------------------------------
    add_header_styled(doc, "2. Role-Based Actions Matrix: HR Manager vs. Employee vs. Admin", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "The system enforces strict permission boundaries. Regular employees are sandboxed in their Employee Self-Service (ESS) portal, "
        "allowing them to view and manage only their own attendance, leaves, and payslips. HR Managers have company-wide authority over "
        "talent acquisition, employee directory CRUD, and payroll execution. System Admins govern multi-tenant security and audit logs."
    )

    add_image_box(doc, os.path.join(diag_dir, "02_rbac_matrix.png"), 
        "Figure 2.1 — Three-Tier Operational Authorization Matrix")

    add_header_styled(doc, "Detailed Functional Permissions Comparison", level=2)
    
    table_rbac = doc.add_table(rows=1, cols=4)
    table_rbac.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_rbac = ["Module Capability", "System Admin", "HR Manager", "Employee (Self-Service)"]
    for i, h in enumerate(headers_rbac):
        cell = table_rbac.cell(0, i)
        cell.text = h
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.name = 'Arial'
        cell.paragraphs[0].runs[0].font.size = Pt(9.5)
        cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)

    rbac_data = [
        ("White-Label Tenant Customization", "Full Access", "No Access", "No Access"),
        ("2FA Reset & Audit Log Forensics", "Full Control", "No Access", "No Access"),
        ("ATS Pipeline & 1-Click Onboard", "View Only", "Full Execution", "No Access"),
        ("Employee Directory Master CRUD", "Full Access", "Full Control", "View Own Profile Only"),
        ("Biometric Turnstile Hardware Config", "Full Control", "Full Control", "No Access"),
        ("Daily Attendance Punch In / Out", "Optional", "Optional", "Mandatory Clock In/Out"),
        ("Leave Quota Application & Review", "Allowed", "Full Approval", "Submit Own Requests"),
        ("Statutory Payroll Batch Run", "View Only", "Full Execution", "No Access"),
        ("Monthly Payslip PDF Access", "All Slips", "All Slips", "Download Own Slip Only"),
        ("Expense Reimbursement Approval", "Allowed", "Tier-2 Finance Sign-Off", "Submit Own Claims + Receipts"),
        ("IT Hardware Asset Inventory", "Full Control", "Full Control", "View Assigned Assets"),
        ("Exit Resignation & Relieving Letter", "Full Control", "HR Clearance Sign-Off", "Submit Own Resignation")
    ]

    for row_idx, data in enumerate(rbac_data):
        row_cells = table_rbac.add_row().cells
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = row_cells[col_idx]
            cell.text = text
            cell.paragraphs[0].runs[0].font.name = 'Arial'
            cell.paragraphs[0].runs[0].font.size = Pt(9)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(8)

    # ---------------------------------------------------------
    # SECTION 3: SYSTEM ADMIN RESPONSIBILITIES & SECURITY
    # ---------------------------------------------------------
    add_header_styled(doc, "3. System Admin Setup, Security & Tenant Isolation", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "System Admins manage the platform's multi-tenant isolation, cryptographic 2FA tokens, and denial-of-service protections. "
        "Every single administrative configuration change is recorded in an immutable, append-only database log for compliance auditing."
    )

    add_image_box(doc, os.path.join(diag_dir, "03_sysadmin_security.png"), 
        "Figure 3.1 — Administrative Setup Execution Sequence & Security Forensics")

    add_header_styled(doc, "Core System Admin Pillars", level=2)
    add_step(doc, 1, "Multi-Tenant Data Partitioning", "Enforces tenant_id scoping across 55 database tables. Tomcat filter intercepts X-Tenant-ID header and ensures strict thread-local separation.")
    add_step(doc, 2, "Bank-Grade 2FA TOTP (RFC 6238)", "Supports Google Authenticator, Microsoft Authenticator, and Authy with 8 single-use emergency backup recovery keys.")
    add_step(doc, 3, "Brute-Force Account Lockout", "Monitors login_history; accounts are automatically locked for 30 minutes after 5 consecutive failed login attempts.")
    add_step(doc, 4, "Physical Biometric Terminal Registry", "Maintains IP address, listening ports, serial numbers, and heartbeat pings for all physical attendance scanners in biometric_devices.")

    # ---------------------------------------------------------
    # SECTION 4: EMPLOYEE LIFECYCLE (JOINING TO RELIEVING)
    # ---------------------------------------------------------
    add_header_styled(doc, "4. Complete Employee Lifecycle (Day-1 Joining to Exit Relieving)", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "Governs an individual's journey through three phases: (1) Onboarding from ATS with mandatory initial password reset; "
        "(2) Active Employment via daily attendance, break timers, leave balances, and expense claims; and (3) Offboarding with 4-department "
        "clearance sign-offs, statutory Gratuity calculation, and official digital Relieving Letter issuance."
    )

    add_image_box(doc, os.path.join(diag_dir, "04_employee_lifecycle.png"), 
        "Figure 4.1 — Complete Employee Employment State Machine")

    add_header_styled(doc, "Lifecycle Phase Breakdown", level=2)
    add_step(doc, 1, "First-Time Login Security Gate", "New hires log in with Hrms@XXXX. The backend detects mustChangePassword: true and locks all portal features until a compliant permanent password is created.")
    add_step(doc, 2, "Daily Self-Service Attendance", "Employee punches in with GPS geofencing. Punches after 09:30 AM flag LATE_ARRIVAL. The break tracker records lunch/break minutes.")
    add_step(doc, 3, "Leave & Time-Off Management", "Employees submit leave requests against pre-seeded Annual (24), Sick (12), and Casual (8) quotas.")
    add_step(doc, 4, "Separation & 4-Department Clearance NOC", "Resignation triggers clearance checklists across IT (hardware return), Finance (dues/loans), and HR before F&F settlement.")
    add_step(doc, 5, "Statutory Gratuity & Settlement", "Engine computes gratuity ((15 * Basic * Tenure) / 26) and unavailed leave encashment, generating the official Relieving Letter PDF.")

    # ---------------------------------------------------------
    # SECTION 5: PROFILE GENERATION & 1-CLICK ONBOARDING
    # ---------------------------------------------------------
    add_header_styled(doc, "5. Profile Generation & Deterministic Employee ID Logic", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "When an HR Manager clicks '1-Click Onboard' on an accepted candidate, the platform automatically generates their permanent ID "
        "(EMP-YYYY-XXXX), creates user login credentials, seeds statutory leave balances, and emails them their welcome package."
    )

    add_image_box(doc, os.path.join(diag_dir, "05_profile_id_generation.png"), 
        "Figure 5.1 — 1-Click Onboarding & Credential Generation Sequence")

    add_header_styled(doc, "Mathematical Sequence & Execution Flow", level=2)
    add_step(doc, 1, "Deterministic ID Calculation", "ID is minted via: String.format('EMP-%d-%04d', Year, count + 1). For example, with 48 active staff in 2026, the generated ID is EMP-2026-0049.")
    add_step(doc, 2, "User Credential Provisioning", "Creates User record with ROLE_EMPLOYEE, temporary bcrypt password Hrms@<4-random-digits>, and mustChangePassword = true.")
    add_step(doc, 3, "Statutory Quota Seeding", "Automatically seeds employee_leave_balances with 24 Annual Leaves, 12 Sick Leaves, and 8 Casual Leaves.")
    add_step(doc, 4, "Asynchronous Welcome Email", "Dispatches branded HTML email via JavaMailSender containing credentials and login URL.")

    add_image_box(doc, os.path.join(screens_dir, "03_employee_directory.png"), 
        "Figure 5.2 — Corporate Employee Master Directory with Generated Codes", width=Inches(5.5))

    # ---------------------------------------------------------
    # SECTION 6: BIOMETRIC TERMINAL INGESTION & ATTENDANCE MATH
    # ---------------------------------------------------------
    add_header_styled(doc, "6. Biometric Terminal Ingestion & Time Tracking Rules", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "Physical biometric hardware (ZKTeco/eSSL) pushes punch logs to the server. The first punch is check-in; punches after 09:30 AM "
        "are marked Late. Subsequent punches update check-out. If worked time minus breaks is under 4 hours, it automatically becomes Half Day."
    )

    add_image_box(doc, os.path.join(diag_dir, "06_biometric_attendance.png"), 
        "Figure 6.1 — Attendance Ingestion, Punctuality & Overtime Decision Tree")

    add_header_styled(doc, "Precise Mathematical Rules", level=2)
    add_step(doc, 1, "First Punch of the Day", "Recorded as checkInTime. If punch time is after 09:30 AM, status is flagged as LATE_ARRIVAL.")
    add_step(doc, 2, "Net Working Hours Calculation", "workingHours = Math.max(0.0, (totalMinutes - breakMinutes) / 60.0). Break minutes are dynamically subtracted.")
    add_step(doc, 3, "Half-Day Penalty Trigger", "If workingHours < 4.00, status is automatically overridden to HALF_DAY.")
    add_step(doc, 4, "Overtime Calculation", "overtimeHours = Math.max(0.0, workingHours - 8.00). Standard 8-hour workday threshold.")

    add_image_box(doc, os.path.join(screens_dir, "04_biometric_attendance.png"), 
        "Figure 6.2 — Biometric Stopwatch, Break Timer & Daily Attendance Hub", width=Inches(5.5))

    # ---------------------------------------------------------
    # SECTION 7: STATUTORY PAYROLL ENGINE & DISBURSEMENTS
    # ---------------------------------------------------------
    add_header_styled(doc, "7. Statutory Payroll Engine, Salary Templates & Bank Disbursements", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "The payroll engine calculates salaries in one click. It determines earned gross pay from present days, decomposes it into Basic (50%), "
        "HRA (20%), and Special Allowance (30%), deducts PF (12%), PT, and TDS, adds approved expense reimbursements, and exports an RBI-compliant bank transfer file."
    )

    add_image_box(doc, os.path.join(diag_dir, "07_payroll_engine.png"), 
        "Figure 7.1 — Payroll Batch Reconciliation, Component Splitting & Bank Payout Flow")

    add_header_styled(doc, "Mathematical Formulation of Salary Engine", level=2)
    add_step(doc, 1, "Prorated Earned Gross", "perDaySalary = grossContractual / calendarWorkingDays. earnedGross = perDaySalary * effectivePresentDays.")
    add_step(doc, 2, "MNC Component Split", "Basic Salary = 50% * earnedGross. HRA = 20% * earnedGross. Special Allowance = 30% * earnedGross.")
    add_step(doc, 3, "Statutory Deductions", "Provident Fund (PF) = 12% * Basic. Professional Tax (PT) = ₹200 (₹300 in Feb). TDS = 5% if earnedGross > ₹50,000.")
    add_step(doc, 4, "Approved Expense Reimbursement Bridge", "Queries claims where status = FINANCE_APPROVED and disburses them directly into net pay total.")
    add_step(doc, 5, "Bank Transfer CSV Export", "Outputs RBI/NACH-compliant CSV: BeneficiaryName, AccountNumber, IFSC, Amount, Narration.")

    add_image_box(doc, os.path.join(screens_dir, "05_payroll_register.png"), 
        "Figure 7.2 — Monthly Payroll Register Console with Component Breakdown", width=Inches(5.5))

    # ---------------------------------------------------------
    # SECTION 8: AUTOMATED OFFER LETTER GENERATION
    # ---------------------------------------------------------
    add_header_styled(doc, "8. Automated Offer Letter Generation & Candidate Dispatch", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "When a candidate passes final interviews, HR triggers the offer workflow. The system compiles their CTC breakdown, designation, "
        "and joining date into an official employment contract with a cryptographic verification hash, emailing it to the candidate with an acceptance button."
    )

    add_image_box(doc, os.path.join(diag_dir, "08_offer_letter.png"), 
        "Figure 8.1 — Automated Offer Letter Pipeline & Cryptographic Verification")

    add_header_styled(doc, "Offer Letter Pipeline Steps", level=2)
    add_step(doc, 1, "Interview Panel Clearance", "Interviewers submit scorecards recommending STRONG_HIRE. Candidate stage advances to OFFER_PENDING.")
    add_step(doc, 2, "Dynamic Template Merging", "DocumentService injects candidate name, CTC breakdown, designation, and reporting manager into official template.")
    add_step(doc, 3, "Cryptographic Hash & Vault Storage", "Calculates SHA-256 integrity hash and stores contract PDF in /storage/tenants/{tid}/letters/.")
    add_step(doc, 4, "Candidate Digital Acceptance", "Candidate receives email with offer letter PDF and acceptance link. Clicking accept flips stage to OFFER_ACCEPTED, unlocking 1-Click Onboard.")

    # ---------------------------------------------------------
    # SECTION 9: RECRUITMENT ATS & WEBRTC LIVE INTERVIEWS
    # ---------------------------------------------------------
    add_header_styled(doc, "9. Talent Acquisition ATS & Native WebRTC Live Interviews", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "The ATS manages candidate progression across 6 stages. Includes native peer-to-peer WebRTC video interview rooms with "
        "an embedded collaborative code compiler and structured candidate evaluation scorecards."
    )

    add_image_box(doc, os.path.join(screens_dir, "06_recruitment_ats.png"), 
        "Figure 9.1 — Corporate ATS Candidate Pipeline & Video Interview Hub", width=Inches(5.5))

    add_step(doc, 1, "6-Stage Pipeline", "Applied -> Screening -> Technical Round 1 -> Technical Round 2 (Final) -> Offer Pending -> Hired.")
    add_step(doc, 2, "In-Browser WebRTC Live Interviews", "Peer-to-peer video rooms with LiveKit integration, live chat, shared whiteboard, and interactive code compiler.")
    add_step(doc, 3, "Objective Scoring Rubrics", "Evaluates technical skills, problem solving, and culture fit, recording audit verdicts into interview_scorecards.")

    # ---------------------------------------------------------
    # SECTION 10: LEAVES & MULTI-STAGE EXPENSE CLAIMS
    # ---------------------------------------------------------
    add_header_styled(doc, "10. Leave Quotas & Multi-Stage Expense Workflows", level=1)

    add_callout(doc, "EXECUTIVE SUMMARY (IN PLAIN ENGLISH)",
        "Employees apply for leaves against dedicated Annual, Sick, and Casual balances. Expense claims support receipt uploads and a 2-stage "
        "approval workflow (Reporting Manager Review -> Finance Audit) that flows directly into monthly salary disbursement."
    )

    add_image_box(doc, os.path.join(screens_dir, "07_leave_management.png"), 
        "Figure 10.1 — Statutory Leave Balance Tracker & Approval Queue", width=Inches(5.5))

    add_image_box(doc, os.path.join(screens_dir, "08_expense_claims.png"), 
        "Figure 10.2 — Corporate Expense Reimbursement Claims & Receipt Vault", width=Inches(5.5))

    # ---------------------------------------------------------
    # SECTION 11: CRITICAL PRODUCTION EDGE CASES & DEFENSES
    # ---------------------------------------------------------
    add_header_styled(doc, "11. Critical Production Edge Cases & Architectural Defenses", level=1)

    add_callout(doc, "SYSTEM RESILIENCE SUMMARY",
        "The following catalog details real-world operational edge cases, concurrency challenges, and failure modes, along with the code-level mechanisms that prevent system breakdowns."
    )

    edge_cases = [
        ("Cross-Midnight Night Shifts (22:00 to 06:00 next day)",
         "Problem: Checkout punches occurring on the next calendar day could be treated as a new check-in.\n"
         "Defense: The system checks shift.is_night_shift == true. Checkouts occurring before shift end + grace period are retroactively bound to the previous day's check-in record."),
        
        ("Single Punch Anomaly (Forgotten Checkout)",
         "Problem: An employee clocks in at 09:00 AM but leaves without clocking out, resulting in null working hours.\n"
         "Defense: A nightly Spring cron (0 30 23 * * *) marks unclosed check-ins as INCOMPLETE_PUNCH. The employee submits an Attendance Regularization Ticket in ESS for manager sign-off, which retroactively recalculates hours."),
        
        ("Rapid Duplicate Hardware Punches (< 60s Debounce)",
         "Problem: Multiple thumb scans within seconds due to hardware sensor uncertainty.\n"
         "Defense: If Duration.between(lastPunch, currentPunch).getSeconds() < 60, subsequent scans are discarded as hardware bounce artifacts."),
        
        ("Loss of Pay (LOP) Salary Prorations",
         "Problem: Unapproved absences must not receive contractual compensation.\n"
         "Defense: earnedGross = (grossContractual / calendarWorkingDays) * effectivePresentDays. All statutory components (Basic, HRA, PF) scale strictly off earnedGross."),
        
        ("Negative Net Salary Prevention",
         "Problem: Heavy statutory deductions or unpaid leave could mathematically result in negative net pay.\n"
         "Defense: netSalary = Math.max(0.00, earnedGross - totalDeductions). Any unrecovered deduction balance rolls over into employee_salary_arrears."),
        
        ("Async Thread Pool Context Loss (@Async)",
         "Problem: Spring background mailer and PDF worker threads lose ThreadLocal tenant_id.\n"
         "Defense: Configured TenantAwareTaskDecorator copies tenant_id from the HTTP request thread into the worker thread before execution and clears it in a finally block."),
        
        ("Concurrent 1-Click Onboard ID Collisions",
         "Problem: Multiple HR managers onboarding candidates simultaneously could receive identical sequential IDs.\n"
         "Defense: Protected via database sequence allocation and a composite unique constraint UNIQUE(tenant_id, employee_number) on PostgreSQL.")
    ]

    for title, desc in edge_cases:
        p_ec = doc.add_paragraph()
        p_ec.paragraph_format.left_indent = Inches(0.2)
        p_ec.paragraph_format.space_before = Pt(6)
        p_ec.paragraph_format.space_after = Pt(4)
        
        r_title = p_ec.add_run(f"■  {title}\n")
        r_title.font.name = 'Arial'
        r_title.font.bold = True
        r_title.font.size = Pt(11)
        r_title.font.color.rgb = RGBColor(15, 23, 42)

        r_body = p_ec.add_run(desc)
        r_body.font.name = 'Arial'
        r_body.font.size = Pt(10)
        r_body.font.color.rgb = RGBColor(71, 85, 105)

    out_docx_path = os.path.join(base_dir, "docs", "HRMS_Enterprise_Technical_Blueprint.docx")
    try:
        doc.save(out_docx_path)
        print(f"Master Word Document successfully generated: {out_docx_path}")
    except PermissionError:
        fallback_path = os.path.join(base_dir, "docs", "HRMS_Enterprise_Technical_Blueprint_Updated.docx")
        doc.save(fallback_path)
        print(f"Master Word Document was open in Microsoft Word. Saved to fallback: {fallback_path}")

if __name__ == "__main__":
    build_document()

