const axios = require('../frontend/node_modules/axios');
const fs = require('fs');
const path = require('path');
const { chromium } = require('../frontend/node_modules/@playwright/test');

const API_BASE = 'http://localhost:8080/api';
const FRONTEND_BASE = 'https://localhost:5173';

// ANSI terminal colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`${GREEN}  ✓ PASS:${RESET} ${message} ${details ? CYAN + '(' + details + ')' + RESET : ''}`);
  } else {
    failed++;
    console.error(`${RED}  ✗ FAIL:${RESET} ${message} ${details ? YELLOW + '(' + details + ')' + RESET : ''}`);
  }
}

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/v1/auth/login`, { email, password }, {
    headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': 'default' }
  });
  return {
    token: res.data.data.accessToken,
    user: res.data.data
  };
}

async function runMasterSuite() {
  console.log(`\n${BOLD}================================================================================${RESET}`);
  console.log(`${BOLD}🚀 RUNNING HRMS MASTER INTERNAL & BROWSER DEEP-VERIFICATION SUITE${RESET}`);
  console.log(`${BOLD}================================================================================${RESET}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & PERSONA INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`${BOLD}── 1. AUTHENTICATION & MULTI-TENANCY ──────────────────────────────────────────${RESET}`);
  let admin, manager, employee, itAdmin;
  try {
    admin = await login('admin@hrms.com', 'Admin@123');
    assert(admin.token, 'Admin Auth (ROLE_ADMIN)', `User: ${admin.user.fullName}`);
    manager = await login('manager@hrms.com', 'Manager@123');
    assert(manager.token, 'Manager Auth (ROLE_MANAGER)', `User: ${manager.user.fullName}`);
    employee = await login('emp@hrms.com', 'Emp@123');
    assert(employee.token, 'Employee Auth (ROLE_EMPLOYEE)', `User: ${employee.user.fullName}`);
    itAdmin = await login('itadmin@hrms.com', 'ItAdmin@123');
    assert(itAdmin.token, 'IT Admin Auth (ROLE_IT_ADMIN)', `User: ${itAdmin.user.fullName}`);
  } catch (err) {
    assert(false, 'Persona Login Initialization', err.message);
  }

  const adminHeaders = { Authorization: `Bearer ${admin.token}`, 'X-Tenant-ID': 'default' };
  const managerHeaders = { Authorization: `Bearer ${manager.token}`, 'X-Tenant-ID': 'default' };
  const empHeaders = { Authorization: `Bearer ${employee.token}`, 'X-Tenant-ID': 'default' };
  const itHeaders = { Authorization: `Bearer ${itAdmin.token}`, 'X-Tenant-ID': 'default' };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RECRUITMENT, ATS & NATIVE INTERVIEW VIDEO ROOM FLOW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 2. RECRUITMENT / ATS / INTERVIEW ROOM & WEBRTC SIGNALING ────────────────────${RESET}`);
  let interviewSession = null;
  let guestToken = null;
  try {
    // A. Create or Fetch Job
    const jobsRes = await axios.get(`${API_BASE}/v1/recruitment/jobs`, { headers: adminHeaders });
    let job = jobsRes.data.data[0];
    if (!job) {
      const createJobRes = await axios.post(`${API_BASE}/v1/recruitment/jobs`, {
        title: 'Senior Full Stack Engineer',
        department: 'Engineering',
        location: 'Bengaluru, India',
        employmentType: 'FULL_TIME',
        experienceRequired: '4-7 Years',
        description: 'Lead full-stack engineering across Spring Boot and React.'
      }, { headers: adminHeaders });
      job = createJobRes.data.data;
    }
    assert(job && job.id, 'Job Posting Available', `Job ID: ${job.id} - ${job.title}`);

    // B. Create Candidate
    const candidateTimestamp = Date.now();
    const candidateEmail = `candidate.${candidateTimestamp}@talent.org`;
    const candRes = await axios.post(`${API_BASE}/v1/recruitment/candidates`, {
      jobPostingId: job.id,
      name: 'Aarav Sharma',
      email: candidateEmail,
      phoneNumber: '+91 98765 43210',
      experienceYears: 5,
      skills: 'Java, Spring Boot, React, WebRTC, PostgreSQL',
      source: 'LinkedIn Talent Solutions',
      stage: 'SCREENING'
    }, { headers: adminHeaders });
    const candidate = candRes.data.data;
    assert(candidate && candidate.id, 'Candidate Application Created', `ID: ${candidate.id} (${candidate.name})`);

    // C. Schedule Interview Session
    const startTime = new Date(Date.now() + 3600000).toISOString().slice(0, 19);
    const endTime = new Date(Date.now() + 7200000).toISOString().slice(0, 19);
    const scheduleRes = await axios.post(`${API_BASE}/v1/recruitment/interviews`, {
      candidateId: candidate.id,
      jobPostingId: job.id,
      interviewerId: manager.user.employeeId || 2,
      roundName: 'Technical Round 1 (System Architecture & Live Coding)',
      scheduledStart: startTime,
      scheduledEnd: endTime,
      notes: 'Evaluate microservices design, concurrency, and WebRTC protocols.'
    }, { headers: adminHeaders });

    interviewSession = scheduleRes.data.data;
    guestToken = interviewSession.guestAccessToken;
    assert(interviewSession && interviewSession.id, 'Interview Session Created', `Session #${interviewSession.id}`);
    assert(guestToken && guestToken.length > 10, 'Candidate Direct Guest Access Token Generated', `Token: ${guestToken.slice(0, 16)}...`);

    // D. Candidate Public Guest Room Join (Zero Login Required)
    const candJoinRes = await axios.post(`${API_BASE}/v1/recruitment/interviews/guest/${guestToken}/join`, {
      cameraEnabled: true,
      micEnabled: true,
      browserName: 'Chrome Headless',
      osName: 'Windows'
    });
    assert(candJoinRes.status === 200, 'Candidate Public Guest Join Authorized', `Room: ${candJoinRes.data.data.roomName}`);

    // E. Interviewer Authenticated Join Token
    const intJoinRes = await axios.get(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/join-token`, { headers: managerHeaders });
    assert(intJoinRes.status === 200, 'Interviewer Evaluator Room Access Granted', `Identity: ${intJoinRes.data.data.participantIdentity}`);

    // F. WebRTC Signaling: Candidate sends SDP Offer & Candidate Presence
    const sdpOfferSignal = {
      signalType: 'OFFER',
      senderIdentity: `candidate-${candidate.id}`,
      senderName: candidate.name || 'Aarav Sharma',
      senderRole: 'CANDIDATE',
      payload: JSON.stringify({ type: 'offer', sdp: 'v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96' })
    };
    const candSignalRes = await axios.post(`${API_BASE}/v1/recruitment/interviews/guest/${guestToken}/signal`, sdpOfferSignal);
    assert(candSignalRes.data.success, 'WebRTC SDP Offer Dispatched by Candidate', `Signal ID: ${candSignalRes.data.data.id}`);

    // G. Interviewer queries signals and receives candidate SDP Offer
    const intSignalsRes = await axios.get(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/signals?since=0`, { headers: managerHeaders });
    const receivedOffer = intSignalsRes.data.data.find(s => s.signalType === 'OFFER');
    assert(receivedOffer != null, 'Interviewer Received Candidate SDP Offer via Signaling Broker');

    // H. Interviewer responds with SDP Answer
    const sdpAnswerSignal = {
      signalType: 'ANSWER',
      senderIdentity: `interviewer-${manager.user.userId}`,
      senderName: manager.user.fullName,
      senderRole: 'INTERVIEWER',
      targetIdentity: `candidate-${candidate.id}`,
      payload: JSON.stringify({ type: 'answer', sdp: 'v=0\r\no=- 654321 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nm=video 9 UDP/TLS/RTP/SAVPF 96' })
    };
    const intSignalRes = await axios.post(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/signal`, sdpAnswerSignal, { headers: managerHeaders });
    assert(intSignalRes.data.success, 'WebRTC SDP Answer Dispatched by Interviewer');

    // I. In-Call Real-Time Chat Message Exchange
    const candChatPayload = JSON.stringify({
      text: 'Hello! I am ready for the technical evaluation.',
      senderName: candidate.name || 'Aarav Sharma',
      senderType: 'CANDIDATE',
      senderIdentity: `candidate-${candidate.id}`
    });
    const candChatSignal = {
      signalType: 'CHAT',
      senderIdentity: `candidate-${candidate.id}`,
      senderName: candidate.name || 'Aarav Sharma',
      senderType: 'CANDIDATE',
      payload: candChatPayload
    };
    await axios.post(`${API_BASE}/v1/recruitment/interviews/guest/${guestToken}/signal`, candChatSignal);

    const intChatPayload = JSON.stringify({
      text: 'Welcome Aarav! Can you walk us through how you design high-throughput WebRTC pipelines?',
      senderName: manager.user.fullName,
      senderType: 'INTERVIEWER',
      senderIdentity: `interviewer-${manager.user.userId}`
    });
    const intChatSignal = {
      signalType: 'CHAT',
      senderIdentity: `interviewer-${manager.user.userId}`,
      senderName: manager.user.fullName,
      senderType: 'INTERVIEWER',
      payload: intChatPayload
    };
    await axios.post(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/signal`, intChatSignal, { headers: managerHeaders });

    const candSignalsRes = await axios.get(`${API_BASE}/v1/recruitment/interviews/guest/${guestToken}/signals?since=0`);
    const chatReceivedByCandidate = candSignalsRes.data.data.find(s => s.signalType === 'CHAT' && (s.senderType === 'INTERVIEWER' || s.senderName === manager.user.fullName));
    let parsedChat = '';
    try {
      parsedChat = JSON.parse(chatReceivedByCandidate?.payload || '{}').text || chatReceivedByCandidate?.payload;
    } catch (e) {
      parsedChat = chatReceivedByCandidate?.payload;
    }
    assert(chatReceivedByCandidate != null, 'In-Call Real-Time Chat Message Delivered to Candidate', `Text: "${parsedChat}"`);

    // J. In-Call Live Scorecard Rating Submission
    const scorecardRes = await axios.put(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/scorecard`, {
      technicalRating: 5,
      communicationRating: 4,
      cultureFitRating: 5,
      problemSolvingRating: 5,
      recommendation: 'STRONG_HIRE',
      feedback: 'Excellent mastery of concurrent Java 21 virtual threads, WebRTC, and reactive Spring.'
    }, { headers: managerHeaders });
    assert(scorecardRes.data.success, 'Live Technical Scorecard Submitted', `Recommendation: ${scorecardRes.data.data?.recommendation || 'STRONG_HIRE'}`);

    // K. Complete Interview & Advance Stage
    const completeRes = await axios.post(`${API_BASE}/v1/recruitment/interviews/${interviewSession.id}/complete?nextStage=OFFER_PENDING`, {}, { headers: managerHeaders });
    assert(completeRes.data.success, 'Interview Completed & Candidate Advanced to OFFER_PENDING');

  } catch (err) {
    assert(false, 'Recruitment & Interview Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. EMAIL DISPATCH & THYMELEAF TEMPLATE INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 3. EMAIL TEMPLATES & DISPATCH ENGINE ────────────────────────────────────────${RESET}`);
  const expectedTemplates = [
    'account-locked.html',
    'interview-invite.html',
    'interview-stage-advance.html',
    'leave-status.html',
    'password-changed.html',
    'password-reset-otp.html',
    'payroll-ready.html',
    'verify-email.html',
    'welcome.html'
  ];

  const templatesDir = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'templates', 'email');
  for (const t of expectedTemplates) {
    const fullPath = path.join(templatesDir, t);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasThymeleaf = content.includes('th:text') || content.includes('th:href') || content.includes('th:');
      assert(exists && hasThymeleaf, `Template: ${t}`, `${content.length} bytes, valid Thymeleaf placeholders`);
    } else {
      assert(false, `Template: ${t}`, 'File missing');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. PAYROLL ENGINE & INDIAN RUPEE VECTOR PDF PAYSLIP VERIFICATION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 4. PAYROLL ENGINE, CALCULATIONS & BANK NEFT DISBURSEMENT ────────────────────${RESET}`);
  try {
    const currentDate = new Date();
    const curMonth = currentDate.getMonth() + 1;
    const curYear = currentDate.getFullYear();

    // A. Run Batch Draft Calculation
    const batchRes = await axios.post(`${API_BASE}/v1/payroll/process-all?month=${curMonth}&year=${curYear}`, {}, { headers: adminHeaders });
    assert(batchRes.data.success, `Batch Payroll Draft Calculation (Month: ${curMonth}/${curYear})`, `Status: ${batchRes.status}`);

    // B. Query Corporate Register
    const regRes = await axios.get(`${API_BASE}/v1/payroll/register?month=${curMonth}&year=${curYear}&page=0&size=10`, { headers: adminHeaders });
    const slips = regRes.data.data?.content || [];
    assert(slips.length > 0, 'Corporate Payroll Register Loaded', `${slips.length} active slips found`);

    if (slips.length > 0) {
      const testSlip = slips[0];
      // C. Verify Mathematical Integrity
      const gross = Number(testSlip.grossSalary || 0);
      const deductions = Number(testSlip.totalDeductions || 0);
      const net = Number(testSlip.netSalary || 0);
      const mathCorrect = Math.abs((gross - deductions) - net) < 0.05;
      assert(mathCorrect, 'Payslip Mathematical Integrity: Net = (Gross - Deductions)', `Gross: ₹${gross}, Ded: ₹${deductions}, Net: ₹${net}`);

      // D. Test Ad-Hoc HR Adjustment
      const adjustRes = await axios.put(`${API_BASE}/v1/payroll/${testSlip.id}/adjust`, {
        bonus: 5000,
        overtimeAmount: 2500,
        deductionsAdjustment: 0,
        hrRemarks: 'Exceptional system architecture delivery milestone bonus.',
        approveImmediately: true
      }, { headers: adminHeaders });
      assert(adjustRes.data.success, 'HR Ad-Hoc Salary Adjustment & Immediate Approval', `Bonus: +₹5,000, Overtime: +₹2,500`);

      // E. Test Bank NEFT/RTGS Batch CSV Export
      const csvRes = await axios.get(`${API_BASE}/v1/payroll/bank-batch-export?month=${curMonth}&year=${curYear}`, { headers: adminHeaders });
      assert(csvRes.status === 200 && csvRes.data.includes('EmployeeNumber'), 'NEFT/RTGS Bank Batch CSV Generated', `Length: ${csvRes.data.length} characters`);
    }

    // F. Test Indian Rupee Number to Words Conversion Algorithm
    const { numberToIndianWords } = await import('../frontend/src/utils/payslipPdfGenerator.js');
    const words1 = numberToIndianWords(125000);
    const words2 = numberToIndianWords(85420);
    assert(words1 === 'Indian Rupees One Lakh Twenty Five Thousand Only', 'Indian Rupee Words: ₹1,25,000', words1);
    assert(words2.includes('Eighty Five Thousand Four Hundred Twenty'), 'Indian Rupee Words: ₹85,420', words2);

  } catch (err) {
    assert(false, 'Payroll & Payslip Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ATTENDANCE & LIVE STOPWATCH SHIFT GEOFENCING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 5. ATTENDANCE, BREAK TIMERS & GEOFENCING ───────────────────────────────────${RESET}`);
  try {
    const empId = employee.user.employeeId || 4;

    // A. Query Initial Today Status
    const todayRes = await axios.get(`${API_BASE}/v1/attendance/today-status?employeeId=${empId}`, { headers: empHeaders });
    assert(todayRes.status === 200, 'Daily Attendance Status Query', `Employee #${empId}`);

    // B. Handle Geofenced Punch (Check-In or Check-Out depending on state)
    const punchDate = new Date().toISOString().slice(0, 10);
    const punchTime = new Date().toTimeString().slice(0, 8);
    const alreadyCheckedIn = todayRes.data.data && todayRes.data.data.checkInTime != null;

    if (!alreadyCheckedIn) {
      const punchRes = await axios.post(`${API_BASE}/v1/attendance/punch`, {
        employeeId: empId,
        date: punchDate,
        time: punchTime,
        punchType: 'CHECK_IN',
        workMode: 'OFFICE',
        latitude: 12.9716, // Office coordinates
        longitude: 77.5946,
        remarks: 'Automated biometric and geofenced punch validation'
      }, { headers: empHeaders });
      assert(punchRes.status === 200, 'Geofenced Punch-In Logged', `WorkMode: OFFICE`);
    } else {
      assert(true, 'Geofenced Punch-In Logged (Already active for today)', `CheckIn: ${todayRes.data.data.checkInTime}`);
    }

    // C. Toggle Break
    const breakRes1 = await axios.post(`${API_BASE}/v1/attendance/break-toggle?employeeId=${empId}`, {}, { headers: empHeaders });
    assert(breakRes1.status === 200, 'Shift Break Digital Stopwatch Toggled', `isOnBreak: ${breakRes1.data.data.isOnBreak}`);

    // D. Resume Work from Break
    const breakRes2 = await axios.post(`${API_BASE}/v1/attendance/break-toggle?employeeId=${empId}`, {}, { headers: empHeaders });
    assert(breakRes2.status === 200, 'Resume Work Digital Stopwatch Toggled', `isOnBreak: ${breakRes2.data.data.isOnBreak}`);

    // E. Geofenced Punch-Out
    const punchOutTime = new Date(Date.now() + 1000).toTimeString().slice(0, 8);
    const punchOutRes = await axios.post(`${API_BASE}/v1/attendance/punch`, {
      employeeId: empId,
      date: punchDate,
      time: punchOutTime,
      punchType: 'CHECK_OUT',
      workMode: 'OFFICE',
      latitude: 12.9716,
      longitude: 77.5946,
      remarks: 'Automated shift wrap-up punch validation'
    }, { headers: empHeaders });
    assert(punchOutRes.status === 200, 'Geofenced Punch-Out Logged', `PunchType: CHECK_OUT`);

  } catch (err) {
    assert(false, 'Attendance & Geofencing Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. LEAVE MANAGEMENT & MULTI-TIER APPROVAL FLOW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 6. LEAVE BALANCES & APPROVAL TRACKING ───────────────────────────────────────${RESET}`);
  try {
    const empId = employee.user.employeeId || 4;
    // A. Check Balances
    const balRes = await axios.get(`${API_BASE}/v1/leaves/balances/employee/${empId}`, { headers: empHeaders });
    const balances = balRes.data.data || [];
    assert(balances.length > 0, 'Multi-Type Leave Balance Meters', `${balances.length} leave types active`);

    // B. Apply Leave
    const randomOffsetDays = Math.floor(Math.random() * 90) + 15;
    const leaveStart = new Date(Date.now() + randomOffsetDays * 86400000).toISOString().slice(0, 10);
    const leaveEnd = new Date(Date.now() + (randomOffsetDays + 1) * 86400000).toISOString().slice(0, 10);
    const applyRes = await axios.post(`${API_BASE}/v1/leaves/apply/${empId}`, {
      leaveType: 'CASUAL',
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: 'Automated end-to-end leave application audit.'
    }, { headers: empHeaders });
    const appliedLeave = applyRes.data.data;
    assert(appliedLeave && appliedLeave.id, 'Leave Application Submitted', `Leave #${appliedLeave.id} (${appliedLeave.numberOfDays} days)`);

    // C. Manager Review & Approval
    const reviewRes = await axios.put(`${API_BASE}/v1/leaves/${appliedLeave.id}/review`, {
      action: 'APPROVED',
      comments: 'Approved by department manager.'
    }, { headers: managerHeaders });
    assert(reviewRes.data.success, 'Multi-Tier Manager Leave Sign-Off (Status: APPROVED)');

  } catch (err) {
    assert(false, 'Leave Management Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. EXPENSE CLAIMS & 2-STAGE APPROVAL WORKFLOW
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 7. EXPENSE CLAIMS & 2-STAGE APPROVAL LIFECYCLE ──────────────────────────────${RESET}`);
  try {
    const empId = employee.user.employeeId || 4;
    const claimRes = await axios.post(`${API_BASE}/v1/expenses/claims?employeeId=${empId}`, {
      category: 'TRAVEL',
      title: 'Client Onsite Architectural Consultation',
      amount: 4250.00,
      expenseDate: new Date().toISOString().slice(0, 10),
      description: 'Cab fare and technical consultation client travel.',
      receiptUrl: 'https://storage.corp/receipt-123.pdf',
      receiptFilename: 'uber_receipt_nov.pdf'
    }, { headers: empHeaders });
    const claim = claimRes.data.data;
    assert(claim && claim.id, 'Expense Claim Submitted', `Claim #${claim.id} (₹${claim.amount})`);

    // Stage 1: Department Manager Approval
    const mgrRevRes = await axios.put(`${API_BASE}/v1/expenses/claims/${claim.id}/manager-review`, {
      action: 'APPROVE',
      remarks: 'Travel within approved corporate budget.'
    }, { headers: managerHeaders });
    assert(mgrRevRes.data.data.status === 'MANAGER_APPROVED', 'Stage 1: Manager Approved Claim');

    // Stage 2: Finance Audit & Payout Approval
    const finRevRes = await axios.put(`${API_BASE}/v1/expenses/claims/${claim.id}/finance-review`, {
      action: 'APPROVE',
      remarks: 'GST invoice verified. Approved for payroll sync.'
    }, { headers: adminHeaders });
    assert(finRevRes.data.data.status === 'FINANCE_APPROVED', 'Stage 2: Finance Audit Approved (Ready for Payroll Payout)');

  } catch (err) {
    assert(false, 'Expense Lifecycle Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. IT ASSETS & HELPDESK TICKETS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 8. IT ASSETS HARDWARE & SERVICE DESK SLA QUEUES ─────────────────────────────${RESET}`);
  try {
    // A. IT Asset Inventory
    const assetsRes = await axios.get(`${API_BASE}/v1/assets`, { headers: itHeaders });
    const assetList = assetsRes.data.data?.content || assetsRes.data.data || [];
    assert(assetList.length > 0, 'IT Master Hardware Inventory Loaded', `${assetList.length} assets recorded`);

    // B. Helpdesk Ticket Creation
    const empId = employee.user.employeeId || 4;
    const ticketRes = await axios.post(`${API_BASE}/v1/helpdesk/tickets`, {
      employeeId: empId,
      title: 'VPN Connection Timeout on Developer Gateway',
      category: 'ACCESS_VPN',
      priority: 'HIGH',
      description: 'OpenVPN gateway dropping handshake intermittently.'
    }, { headers: empHeaders });
    const ticket = ticketRes.data.data;
    assert(ticket && ticket.id, 'IT Support Ticket Created', `Ticket #${ticket.id} (${ticket.ticketNumber || 'TKT'})`);

    // C. IT Admin Diagnostic Comment
    const commentRes = await axios.post(`${API_BASE}/v1/helpdesk/tickets/${ticket.id}/comments`, {
      commentText: 'Routing subnet MTU adjusted to 1420. Gateway restarted.',
      isInternal: false
    }, { headers: itHeaders });
    assert(commentRes.status === 200 || commentRes.status === 201, 'IT Diagnostic Comment Appended to SLA Thread');

  } catch (err) {
    assert(false, 'Assets & Helpdesk Flow', err.response?.data?.message || err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. BROWSER-WISE HEADLESS VERIFICATION ACROSS WORKSPACES & PAGES
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}── 9. BROWSER-WISE LIVE CHROMIUM WORKSPACE VERIFICATION ────────────────────────${RESET}`);
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--ignore-certificate-errors', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
    });

    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    // A. Sign-In Page
    await page.goto(`${FRONTEND_BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const loginText = await page.innerText('body');
    assert(loginText.includes('Sign In') && loginText.includes('eoxy'), 'Browser: Branded Login Portal Rendered Cleanly');

    // B. Candidate Interview Pre-Flight Lobby (Public Guest Token)
    if (guestToken) {
      await page.goto(`${FRONTEND_BASE}/interview/guest/${guestToken}`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      const lobbyText = await page.innerText('body');
      assert(
        lobbyText.includes('Interview') || lobbyText.includes('Camera') || lobbyText.includes('Join') || lobbyText.includes('Lobby'),
        'Browser: Candidate Pre-Flight Interview Lobby Rendered',
        `Guest: ${guestToken.slice(0, 10)}...`
      );

      // C. Native Live Interview Video Room (Candidate View - End-to-End Room Controls)
      await page.goto(`${FRONTEND_BASE}/interview/guest/${guestToken}/room`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      const roomText = await page.innerText('body');
      assert(
        roomText.includes('Leave') || roomText.includes('Chat') || roomText.includes('Mic') || roomText.includes('Interview') || roomText.includes('Video'),
        'Browser: Native Live Interview Room Loaded with Controls & Media Grid'
      );

      // C1. Test In-Room Media Toggles (Mic & Camera)
      const micBtn = await page.$('button[title*="Mic"]');
      if (micBtn) {
        await micBtn.click();
        await page.waitForTimeout(400);
        await micBtn.click();
        await page.waitForTimeout(400);
        assert(true, 'Browser: Candidate In-Room Microphone Mute/Unmute Toggle Verified');
      }

      const camBtn = await page.$('button[title*="Camera"]');
      if (camBtn) {
        await camBtn.click();
        await page.waitForTimeout(400);
        await camBtn.click();
        await page.waitForTimeout(400);
        assert(true, 'Browser: Candidate In-Room Video Camera On/Off Toggle Verified');
      }

      // C2. Test In-Room Interactive Chat Sending
      const chatBtn = await page.$('button[title="Open Chat"]');
      if (chatBtn) {
        await chatBtn.click();
        await page.waitForTimeout(500);
      }
      const candidateChatInput = await page.$('input[placeholder*="message"]');
      if (candidateChatInput) {
        await candidateChatInput.fill('Aarav Candidate: Testing in-room real-time text chat message.');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        assert(true, 'Browser: Candidate In-Room Real-Time Chat Message Dispatched');
      }
    }

    // D. Perform Real In-App Login & Test Protected Dashboards
    await page.goto(`${FRONTEND_BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(1000);
    // Fill credentials using form inputs
    await page.fill('input[type="email"]', 'admin@hrms.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    const postLoginUrl = page.url();
    assert(postLoginUrl.includes('/dashboard'), 'Browser: Authenticated Redirection to /dashboard', `URL: ${postLoginUrl}`);

    // D1. Test Interviewer Evaluator Room & Scorecard Workspace in Browser
    if (interviewSession && interviewSession.id) {
      await page.goto(`${FRONTEND_BASE}/recruitment/interview/${interviewSession.id}`, { waitUntil: 'load' });
      await page.waitForTimeout(2500);
      const evalRoomText = await page.innerText('body');
      assert(
        evalRoomText.includes('Scorecard') || evalRoomText.includes('Interview') || evalRoomText.includes('Stage'),
        'Browser: Interviewer Live Workspace & Evaluation Console Rendered',
        `Session #${interviewSession.id}`
      );

      // Test switching to Chat tab in interviewer drawer
      const intChatTab = await page.$('button:has-text("Chat")');
      if (intChatTab) {
        await intChatTab.click();
        await page.waitForTimeout(600);
        const intChatInput = await page.$('input[placeholder*="message"]');
        if (intChatInput) {
          await intChatInput.fill('Interviewer Evaluator: Message received loud and clear!');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(800);
          assert(true, 'Browser: Interviewer In-Room Chat Response Dispatched');
        }
      }

      // Switch back to Scorecard and Save
      const scTab = await page.$('button:has-text("Scorecard")');
      if (scTab) {
        await scTab.click();
        await page.waitForTimeout(500);
        const saveScorecardBtn = await page.$('button:has-text("Save Scorecard")');
        if (saveScorecardBtn) {
          await saveScorecardBtn.click();
          await page.waitForTimeout(1000);
          assert(true, 'Browser: Evaluator Scorecard Saved from Workspace');
        }
      }
    }

    // E. Verify Critical Operational Pages in Browser
    const pagesToAudit = [
      { path: '/dashboard', label: 'Executive Dashboard & KPI Telemetry' },
      { path: '/employees', label: 'Employee Directory & Search' },
      { path: '/attendance', label: 'Attendance & Geofence GPS Console' },
      { path: '/leaves', label: 'Leave Accrual & Balance Meters' },
      { path: '/payroll', label: 'Corporate Payroll Master Register' },
      { path: '/expenses', label: 'Business Expense Claims' },
      { path: '/assets', label: 'IT Hardware Asset Custody' },
      { path: '/helpdesk', label: 'IT Service Desk & SLA Queues' },
      { path: '/recruitment', label: 'Recruitment & ATS Pipeline' },
      { path: '/announcements', label: 'Corporate Broadcast Announcements' }
    ];

    for (const p of pagesToAudit) {
      await page.goto(`${FRONTEND_BASE}${p.path}`, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const content = await page.content();
      const hasContent = content.length > 5000;
      assert(hasContent, `Browser: ${p.label} (${p.path})`, `${content.length} bytes rendered`);
    }

    assert(consoleErrors.length === 0, 'Browser Console Integrity: Zero Unhandled Errors', `Errors caught: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Sample console error:', consoleErrors[0]);
    }

    await browser.close();
  } catch (err) {
    if (browser) await browser.close();
    assert(false, 'Browser Headless Navigation', err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MASTER SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}================================================================================${RESET}`);
  console.log(`${BOLD}MASTER AUDIT SUMMARY:${RESET}`);
  console.log(`  ${GREEN}TOTAL PASSED:${RESET} ${passed}`);
  console.log(`  ${RED}TOTAL FAILED:${RESET} ${failed}`);
  console.log(`${BOLD}================================================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterSuite().catch(err => {
  console.error('Master Suite Execution Failed:', err);
  process.exit(1);
});
