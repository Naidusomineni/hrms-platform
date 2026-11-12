import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette: Corporate Executive Slate & Navy
    NAVY_DARK = RGBColor(15, 23, 42)       # #0F172A
    NAVY_LIGHT = RGBColor(30, 41, 59)      # #1E293B
    TEXT_DARK = RGBColor(15, 23, 42)       # #0F172A
    TEXT_MUTED = RGBColor(100, 116, 139)   # #64748B
    ACCENT_BLUE = RGBColor(37, 99, 235)    # #2563EB
    EMERALD_GREEN = RGBColor(16, 185, 129) # #10B981
    BG_LIGHT = RGBColor(248, 250, 252)     # #F8FAFC
    CARD_BG = RGBColor(255, 255, 255)      # White
    CARD_BORDER = RGBColor(226, 232, 240)  # #E2E8F0

    blank_layout = prs.slide_layouts[6]
    screenshots_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../docs/screenshots"))

    def add_header(slide, title_text, category_text="ENTERPRISE HRMS PLATFORM"):
        # Header container
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.0))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = category_text.upper()
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = ACCENT_BLUE

        p2 = tf.add_paragraph()
        p2.text = title_text
        p2.font.size = Pt(22)
        p2.font.bold = True
        p2.font.color.rgb = NAVY_DARK

    # -------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE (Dark Executive Theme)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = NAVY_DARK
    bg1.line.fill.background()

    # Title content
    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(2.0), Inches(10.9), Inches(3.5))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "ENTERPRISE WORKFORCE MANAGEMENT PLATFORM"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = EMERALD_GREEN

    p = tf1.add_paragraph()
    p.text = "Production Architectural Blueprint & Operational Documentary"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

    p = tf1.add_paragraph()
    p.text = "Spring Boot 3.2.3 (Java 21 LTS) | PostgreSQL 18 | React 18 SPA | Multi-Tenant Architecture\nAutomated Statutory Payroll, Biometric Ingestion & ATS 1-Click Onboarding"
    p.font.size = Pt(15)
    p.font.color.rgb = RGBColor(203, 213, 225)

    # Footer metrics bar on title slide
    f_box = s1.shapes.add_textbox(Inches(1.2), Inches(6.0), Inches(10.9), Inches(0.8))
    f_tf = f_box.text_frame
    fp = f_tf.paragraphs[0]
    fp.text = "21 Modules Integrated   •   55 Relational Tables   •   Multi-Tier RBAC   •   High-Resilience Edge-Case Engines"
    fp.font.size = Pt(12)
    fp.font.bold = True
    fp.font.color.rgb = RGBColor(148, 163, 184)

    # -------------------------------------------------------------
    # SLIDE 2: SYSTEM ARCHITECTURE & MODULAR MONOLITH
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "System Architecture: Multi-Tenant Modular Monolith")

    # Left Column: Architectural Pillars
    left_box = s2.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(5.8), Inches(5.2))
    ltf = left_box.text_frame
    ltf.word_wrap = True

    pillars = [
        ("Presentation Layer (React 18 + Vite)", "Stateless SPA utilizing Redux Toolkit, typed API clients, and real-time STOMP WebSockets over SockJS for instantaneous telemetry and alerts."),
        ("Multi-Tenant Isolation Filter", "ThreadLocal tenant scoping (TenantContextFilter) ensures zero cross-organization contamination on a shared-schema PostgreSQL 18 database."),
        ("Enterprise Security & DoS Protection", "Bucket4j IP rate limiter (120 req/min), HMAC-SHA256 JWT rotation, BCrypt (cost factor 12), and RFC 6238 TOTP two-factor authentication."),
        ("Transactional Domain Service Layer", "Spring Boot 3.2.3 managed service boundaries (@Transactional) orchestrating payroll mathematics, attendance tracking, and ATS lifecycles.")
    ]

    for title, desc in pillars:
        p = ltf.add_paragraph()
        p.text = f"■  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = ltf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11.5)
        p_desc.font.color.rgb = TEXT_MUTED

    # Right Column: Login UI & Security Entrypoint Screenshot
    login_img = os.path.join(screenshots_dir, "01_login_page.png")
    if os.path.exists(login_img):
        s2.shapes.add_picture(login_img, Inches(6.8), Inches(1.6), width=Inches(5.7))

    # -------------------------------------------------------------
    # SLIDE 3: CORPORATE SAAS DASHBOARD & COMMAND CENTER
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Executive Dashboard: Corporate SaaS Command Center")

    # Image top / left
    dash_img = os.path.join(screenshots_dir, "02_corporate_dashboard.png")
    if os.path.exists(dash_img):
        s3.shapes.add_picture(dash_img, Inches(0.8), Inches(1.5), width=Inches(7.8))

    # Right side: Architecture callouts
    r_box = s3.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.8), Inches(5.4))
    rtf = r_box.text_frame
    rtf.word_wrap = True

    dash_points = [
        ("Corporate Styling", "Elevated from legacy saturated aesthetics to a modern, crisp SaaS palette with subtle 1px slate borders, high-contrast typography, and refined status pills."),
        ("Real-Time Telemetry", "Dynamic workforce KPIs aggregating active staff (42), pending leave requests (11), and geofenced attendance status via live Spring Boot endpoints."),
        ("Department Analytics", "Visual distribution charts mapping headcount allocations and monthly organizational growth trajectories.")
    ]

    for title, desc in dash_points:
        p = rtf.add_paragraph()
        p.text = f"● {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = rtf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 4: RECRUITMENT ATS & 1-CLICK ONBOARDING
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Talent Acquisition & 1-Click Candidate Onboarding")

    rec_img = os.path.join(screenshots_dir, "06_recruitment_ats.png")
    if os.path.exists(rec_img):
        s4.shapes.add_picture(rec_img, Inches(0.8), Inches(1.5), width=Inches(7.8))

    r_box4 = s4.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.8), Inches(5.4))
    rtf4 = r_box4.text_frame
    rtf4.word_wrap = True

    rec_points = [
        ("End-to-End Pipeline", "Tracks candidates through 6 formal stages: Applied -> Screening -> Tech 1 -> Final Round -> Offer Pending -> Hired."),
        ("WebRTC Video Rooms", "Native peer-to-peer technical interview rooms with embedded code compiler, live chat, and structured evaluation rubrics."),
        ("1-Click Onboard Action", "Single-click conversion that provisions an active Employee profile, generates system credentials (mustChangePassword=true), initializes statutory leave balances, and triggers the corporate Welcome Email.")
    ]

    for title, desc in rec_points:
        p = rtf4.add_paragraph()
        p.text = f"● {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = rtf4.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 5: PROFILE GENERATION & ID ALLOCATION LOGIC
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Profile Generation & Unique Employee ID Sequence")

    emp_img = os.path.join(screenshots_dir, "03_employee_directory.png")
    if os.path.exists(emp_img):
        s5.shapes.add_picture(emp_img, Inches(0.8), Inches(1.5), width=Inches(7.8))

    r_box5 = s5.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.8), Inches(5.4))
    rtf5 = r_box5.text_frame
    rtf5.word_wrap = True

    id_points = [
        ("Deterministic ID Minting", "Employee IDs follow the enterprise format EMP-YYYY-XXXX (e.g. EMP-2026-0047), calculated sequentially from tenant count and current calendar year."),
        ("User & Profile Atomicity", "Employee creation creates both the User credential entity and Employee demographic entity inside a single atomic transaction."),
        ("Automatic Quota Seeding", "Every new profile is instantly provisioned with standard statutory leave balances: 24 Annual Leaves, 12 Sick Leaves, and 8 Casual Leaves.")
    ]

    for title, desc in id_points:
        p = rtf5.add_paragraph()
        p.text = f"● {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = rtf5.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 6: BIOMETRIC TERMINAL INTEGRATION & ATTENDANCE MATH
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Biometric Hardware Ingestion & Time Tracking Engine")

    att_img = os.path.join(screenshots_dir, "04_biometric_attendance.png")
    if os.path.exists(att_img):
        s6.shapes.add_picture(att_img, Inches(0.8), Inches(1.5), width=Inches(7.8))

    r_box6 = s6.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.8), Inches(5.4))
    rtf6 = r_box6.text_frame
    rtf6.word_wrap = True

    att_points = [
        ("Dual Ingestion Pipeline", "Accepts live JSON punch events from ZKTeco/eSSL physical biometric terminals via HTTP POST and bulk daily CSV log uploads."),
        ("09:30 AM Late Grace Rule", "First punch of the day before 09:30 AM marks PRESENT; punches after 09:30 AM are flagged automatically as LATE_ARRIVAL."),
        ("Net Working Hours Formula", "Calculates net duration: workingHours = (totalMinutes - breakMinutes) / 60.0. If workingHours < 4.0h, status shifts to HALF_DAY. Overtime hours = max(0.0, workingHours - 8.0).")
    ]

    for title, desc in att_points:
        p = rtf6.add_paragraph()
        p.text = f"● {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = rtf6.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 7: STATUTORY PAYROLL ENGINE & MONTHLY DISBURSEMENT
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Statutory Payroll Engine & Automated Disbursement")

    pay_img = os.path.join(screenshots_dir, "05_payroll_register.png")
    if os.path.exists(pay_img):
        s7.shapes.add_picture(pay_img, Inches(0.8), Inches(1.5), width=Inches(7.8))

    r_box7 = s7.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(3.8), Inches(5.4))
    rtf7 = r_box7.text_frame
    rtf7.word_wrap = True

    pay_points = [
        ("MNC Salary Decomposition", "Contractual Gross is prorated by present days and split: Basic (50%), HRA (20%), and Special Allowance (30%)."),
        ("Statutory Compliance", "Computes Employee Provident Fund (PF: 12% of Basic), Professional Tax (PT: ₹200/mo, ₹300 in Feb), and TDS withholdings (5% if earned > ₹50,000)."),
        ("Expense Reimbursement Bridge", "Automatically queries approved Expense Claims and settles them in the net pay total. Generates RBI/NACH-compliant bank batch CSVs for NEFT/RTGS salary transfers.")
    ]

    for title, desc in pay_points:
        p = rtf7.add_paragraph()
        p.text = f"● {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = rtf7.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 8: LEAVE MANAGEMENT & EXPENSE CLAIMS
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Employee Self-Service: Leaves & Expense Workflows")

    leave_img = os.path.join(screenshots_dir, "07_leave_management.png")
    exp_img = os.path.join(screenshots_dir, "08_expense_claims.png")
    if os.path.exists(leave_img):
        s8.shapes.add_picture(leave_img, Inches(0.8), Inches(1.5), width=Inches(5.7))
    if os.path.exists(exp_img):
        s8.shapes.add_picture(exp_img, Inches(6.8), Inches(1.5), width=Inches(5.7))

    # Bottom overview text box
    b_box8 = s8.shapes.add_textbox(Inches(0.8), Inches(5.7), Inches(11.7), Inches(1.3))
    btf8 = b_box8.text_frame
    btf8.word_wrap = True
    p = btf8.paragraphs[0]
    p.text = "Unified Employee Workflows: Leave Balances & Multi-Stage Expense Reimbursements"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY_LIGHT

    p2 = btf8.add_paragraph()
    p2.text = "Employees submit time-off requests against dedicated Annual, Sick, and Casual quotas. Expense claims feature mandatory receipt attachment and a 2-stage approval workflow (Manager Approval -> Finance Disbursement) that flows directly into monthly payroll slips."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 9: CRITICAL EDGE CASES & ARCHITECTURAL DEFENSES
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Critical Edge Cases & Architectural Defenses")

    grid_box = s9.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.4))
    gtf = grid_box.text_frame
    gtf.word_wrap = True

    edge_cases = [
        ("Loss of Pay (LOP) & Proration", "When an employee has unapproved absences, the payroll engine dynamically computes perDaySalary = Gross / calendarWorkingDays and calculates earnedGross = perDaySalary * effectivePresentDays, preventing overpayment."),
        ("Cross-Midnight Shift Ingestion", "Night shift biometric punches (e.g., 22:00 to 06:00) match the check-in date rather than the check-out timestamp, avoiding duplicate records or inverted duration calculations."),
        ("Missed Punch Regularization", "Employees missing check-in/out timestamps can raise regularization tickets. Approved tickets retroactively populate timestamps and recalculate working hours."),
        ("Race-Condition-Safe ID Generation", "To avoid duplicate EMP codes when multiple candidates are onboarded simultaneously, generation is protected with database-level isolation and transactional sequence locking."),
        ("Negative Salary Prevention", "Statutory deductions and tax withholdings are bounded: deductions can never exceed earned gross salary.")
    ]

    for title, desc in edge_cases:
        p = gtf.add_paragraph()
        p.text = f"■  {title}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = NAVY_LIGHT

        p_desc = gtf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = TEXT_MUTED

    # -------------------------------------------------------------
    # SLIDE 10: PRODUCTION ROADMAP & VERIFICATION
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Quality Assurance, Security & Production Readiness")

    summary_box = s10.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(5.4))
    stf = summary_box.text_frame
    stf.word_wrap = True

    qa_points = [
        ("Automated E2E Regression Suite", "67/67 automated end-to-end integration and Playwright browser tests passing, verifying authentication, attendance, ATS, and payroll."),
        ("Strict TypeScript Verification", "Zero TypeScript compilation errors (tsc --noEmit) across all modular pages, API clients, and Redux slices."),
        ("Multi-Factor Authentication & Cryptography", "BCrypt (cost 12), RFC 6238 TOTP, and HMAC-SHA256 JWT rotation preventing replay attacks."),
        ("Docker & Cloud Deployability", "Production multi-stage Dockerfiles and docker-compose.prod.yml configurations with PostgreSQL 18, Redis Pub/Sub, and Nginx SSL termination.")
    ]

    for title, desc in qa_points:
        p = stf.add_paragraph()
        p.text = f"✔  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = EMERALD_GREEN

        p_desc = stf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(11.5)
        p_desc.font.color.rgb = TEXT_MUTED

    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../docs/HRMS_Enterprise_Presentation.pptx"))
    prs.save(out_path)
    print(f"Presentation saved successfully to: {out_path}")

if __name__ == "__main__":
    create_deck()

