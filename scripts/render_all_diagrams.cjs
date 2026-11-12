const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve(__dirname, '../frontend/node_modules/playwright'));

const diagrams = [
  {
    name: '01_system_architecture',
    title: 'High-Level System Architecture & Flow',
    code: `graph TD
    Client["Client Tier: React 18 SPA (Vite + Tailwind CSS + Redux Toolkit)"]
    Gateway["Security Ingress: Nginx Proxy & Bucket4j Rate Limiter (120 req/min)"]
    Filter["Filter Chain: RequestIdFilter -> TenantContextFilter (ThreadLocal) -> JwtAuthFilter"]
    Core["Spring Boot Core: 21 Modular Monolith Domains (@Transactional)"]
    DB[("PostgreSQL 18 Multi-Tenant DB: 55 Relational Tables with tenant_id")]
    WS["Real-Time Alerts: Spring STOMP over SockJS"]

    Client -->|HTTPS REST| Gateway
    Client -->|WSS Socket| WS
    Gateway --> Filter
    Filter --> Core
    Core -->|HikariCP Pool| DB
    Core -.->|Event Push| WS`
  },
  {
    name: '02_rbac_matrix',
    title: 'Role-Based Actions: HR Manager vs Employee vs Admin',
    code: `flowchart TD
    User["Authenticated User Token"] --> CheckRole{"Role Claim?"}
    
    CheckRole -->|ROLE_ADMIN| AdminNode["System Admin:<br/>• Tenant Provisioning<br/>• 2FA TOTP Security<br/>• Immutable Audit Forensics<br/>• Biometric Terminal Registry"]
    CheckRole -->|ROLE_HR| HRNode["HR Manager:<br/>• ATS Pipeline & 1-Click Onboard<br/>• Full Employee Master CRUD<br/>• Statutory Payroll Batch Engine<br/>• Bank NACH/NEFT CSV Export<br/>• Biometric Punch Reconciliation"]
    CheckRole -->|ROLE_EMPLOYEE| EmpNode["Employee Self-Service (ESS):<br/>• Geofenced GPS Punch In/Out<br/>• Leave Balances & Applications<br/>• Monthly Payslip Inspection & PDF<br/>• Expense Reimbursements + Receipts<br/>• IT Service Desk SLA Tickets"]`
  },
  {
    name: '03_sysadmin_security',
    title: 'System Admin Setup, Security & Tenant Isolation',
    code: `sequenceDiagram
    autonumber
    actor Admin as System Admin
    participant Gateway as Security Filter Chain
    participant Tenant as TenantContextFilter
    participant Auth as Security & 2FA Engine
    participant DB as PostgreSQL 18

    Admin->>Gateway: API Request + X-Tenant-ID
    Gateway->>Gateway: Bucket4j checks IP Rate Limit (<120 req/min)
    Gateway->>Tenant: Injects tenant_id into ThreadLocal
    Tenant->>Auth: Verify JWT + BCrypt + RFC 6238 2FA TOTP
    Auth->>DB: Query User & Validate Tenant Matching
    DB-->>Auth: Verified
    Auth->>DB: Record Action into audit_logs table
    Auth-->>Admin: Execution Allowed & Response Returned
    Tenant->>Tenant: TenantContext.clear() (Prevent Thread Leak)`
  },
  {
    name: '04_employee_lifecycle',
    title: 'Employee Lifecycle: From Joining to Relieving (ESS Portal)',
    code: `stateDiagram-v2
    [*] --> Recruited: Candidate Clears Final Round
    Recruited --> Onboarded: HR Clicks 1-Click Onboard
    Onboarded --> FirstLoginGate: Credentials Emailed (mustChangePassword=true)
    FirstLoginGate --> ESSActive: Mandatory Password Reset Completed
    
    state ESSActive {
        DailyPunch: Biometric / GPS Geofenced Punch
        BreakTimer: Take Break / Resume Tracking
        LeaveLedger: Deduct from Annual/Sick/Casual Quotas
        ExpenseClaims: Submit Claims with Receipt Attachments
        Payslips: View & Download Monthly Payslip PDF
    }
    
    ESSActive --> ResignationSubmitted: Employee Submits Resignation in ESS
    ResignationSubmitted --> MultiDeptClearance: IT, Finance & HR Sign-Off
    MultiDeptClearance --> FnFCalculated: Gratuity & Leave Encashment Settlement
    FnFCalculated --> Relieved: Relieving & Experience Letters Issued
    Relieved --> [*]`
  },
  {
    name: '05_profile_id_generation',
    title: 'Profile Generation & Unique Employee ID Sequence',
    code: `sequenceDiagram
    autonumber
    actor HR as HR Talent Acquisition
    participant ATS as Recruitment ATS
    participant RS as RecruitmentService
    participant ES as EmployeeService
    participant DB as PostgreSQL 18
    participant Mail as JavaMailSender

    HR->>ATS: Clicks "1-Click Onboard" for Candidate
    ATS->>RS: POST /v1/recruitment/candidates/{id}/convert
    RS->>ES: generateNumber()
    ES->>DB: SELECT count(*) FROM employees WHERE tenant_id = :tid
    DB-->>ES: count = 48
    ES-->>RS: Formatted ID: "EMP-2026-0049"
    RS->>DB: INSERT INTO users (email, role=ROLE_EMPLOYEE, must_change_pw=true)
    RS->>DB: INSERT INTO employees (emp_number, salary, designation, dept_id)
    RS->>DB: INSERT INTO employee_leave_balances (annual=24, sick=12, casual=8)
    RS->>DB: UPDATE candidates SET stage = 'HIRED'
    RS-->>Mail: Dispatch MNC Welcome Email with Portal Credentials
    RS-->>ATS: Return Employee Profile (Candidate flips to "Active Employee")`
  },
  {
    name: '06_biometric_attendance',
    title: 'Biometric Integration & Attendance Calculation Rules',
    code: `flowchart TD
    Scanner["Biometric Terminal (ZKTeco / eSSL)"] -->|HTTP Push or CSV| Ingest["AttendanceService Ingestion Pipeline"]
    Ingest --> IsFirst{"First Punch of the Day?"}
    
    IsFirst -->|Yes: Check-In| TimeCheck{"Punch Time > 09:30 AM?"}
    TimeCheck -->|Yes| LateMark["Status: LATE_ARRIVAL"]
    TimeCheck -->|No| PresentMark["Status: PRESENT"]
    
    IsFirst -->|No: Check-Out| CalcHours["Compute: workingHours = (totalMinutes - breakMinutes) / 60.0"]
    CalcHours --> HalfDayCheck{"workingHours < 4.0 Hours?"}
    HalfDayCheck -->|Yes| HalfDayMark["Status: HALF_DAY"]
    HalfDayCheck -->|No| CalcOT["overtimeHours = max(0.0, workingHours - 8.0)"]`
  },
  {
    name: '07_payroll_engine',
    title: 'Statutory Payroll Engine & Bank NACH/NEFT Disbursements',
    code: `flowchart TD
    RunBatch["POST /v1/payroll/calculate-all?month=11&year=2026"] --> Recon["Reconcile Working Days vs Present Days"]
    Recon --> Earned["earnedGross = (grossContractual / workingDays) * effectivePresentDays"]
    
    Earned --> Basic["Basic Salary = 50% * earnedGross"]
    Earned --> HRA["HRA = 20% * earnedGross"]
    Earned --> Special["Special Allowance = 30% * earnedGross"]
    
    Basic --> PF["PF Deduction = 12% * Basic"]
    Earned --> PT["Professional Tax = ₹200 (₹300 in Feb)"]
    Earned --> TDS["Income Tax (TDS) = 5% (if earned > ₹50,000)"]
    
    PF & PT & TDS --> TotalDed["totalDeductions = PF + PT + TDS"]
    
    Earned & TotalDed --> ExpenseSync["Fetch Approved Expense Claims (status = FINANCE_APPROVED)"]
    ExpenseSync --> NetPay["netSalary = (earnedGross - totalDeductions) + approvedReimbursements"]
    NetPay --> DraftSlip["Save PayrollSlip (Status: APPROVED)"]
    DraftSlip --> BankCSV["Export RBI/NACH Bank CSV: Beneficiary, Account, IFSC, Amount"]`
  },
  {
    name: '08_offer_letter',
    title: 'Automated Offer Letter Generation & Candidate Dispatch',
    code: `sequenceDiagram
    autonumber
    actor HR as HR Talent Acquisition
    participant ATS as Recruitment ATS
    participant Doc as DocumentService
    participant Storage as File Storage (/storage/letters)
    participant Mail as EmailService
    actor Cand as Candidate

    HR->>ATS: Candidate passes interview -> Stage OFFER_PENDING
    HR->>ATS: Clicks "Generate & Release Offer"
    ATS->>Doc: POST /v1/documents/letters/generate (Type: OFFER_LETTER)
    Doc->>Doc: Merge Placeholders (Name, CTC, Designation, Joining Date)
    Doc->>Storage: Persist Offer Document with SHA-256 Hash
    Doc-->>ATS: Return Download URL & Verification Hash
    ATS->>Mail: sendInterviewStageAdvanceEmail(isFinalOffer=true)
    Mail-->>Cand: Dispatches Official Offer Letter with Acceptance Link
    Cand->>ATS: Candidate Reviews & Clicks "Accept Offer"
    ATS->>HR: Candidate stage updates to OFFER_ACCEPTED (Ready for 1-Click Onboard)`
  }
];

(async () => {
  const outDir = path.resolve(__dirname, '../docs/diagrams');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--ignore-certificate-errors']
  });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const mermaidJsPath = path.resolve(__dirname, '../frontend/node_modules/mermaid/dist/mermaid.min.js');
  const mermaidJsContent = fs.readFileSync(mermaidJsPath, 'utf8');

  for (const diag of diagrams) {
    console.log(`Rendering diagram: ${diag.name} (${diag.title})...`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 40px;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 24px;
            text-align: center;
            letter-spacing: -0.02em;
          }
          .diagram-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            display: inline-block;
          }
          .mermaid {
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="title">${diag.title}</div>
        <div class="diagram-card">
          <div class="mermaid">
            ${diag.code}
          </div>
        </div>
        <script>
          ${mermaidJsContent}
          mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'basis' },
            sequence: { useMaxWidth: false, showSequenceNumbers: true }
          });
        </script>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    const card = await page.$('.diagram-card');
    if (card) {
      const pngPath = path.join(outDir, `${diag.name}.png`);
      await card.screenshot({ path: pngPath });
      console.log(`  Saved PNG: ${pngPath}`);
    } else {
      console.error(`  Failed to locate card for ${diag.name}`);
    }
  }

  await browser.close();
  console.log('All diagrams successfully rendered into docs/diagrams!');
})();
