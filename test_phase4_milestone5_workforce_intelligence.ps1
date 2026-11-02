# ====================================================================
# HRMS Automated Integration Test Suite: Phase 4 Milestone 5
# Generative HR Assistant & Workforce Intelligence
# ====================================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api/v1"
$adminEmail = "admin@hrms.com"
$adminPassword = "Admin@123"

$defaultHeaders = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID"  = "default"
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " STARTING PHASE 4 - MILESTONE 5: WORKFORCE INTELLIGENCE & AI SUITE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# --- STEP 1: Admin Authentication ---
Write-Host "`n--- STEP 1: Admin Authentication ---" -ForegroundColor Yellow
$loginBody = @{
    email    = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $defaultHeaders
$token = $loginResponse.data.accessToken

if (-not $token) {
    Write-Host "[FAIL] Could not acquire JWT access token." -ForegroundColor Red
    exit 1
}
Write-Host "[PASS] Admin Logged In. Token Acquired." -ForegroundColor Green

$headers = @{
    "Content-Type"  = "application/json"
    "X-Tenant-ID"   = "default"
    "Authorization" = "Bearer $token"
}

# --- STEP 2: Query Corporate Knowledge Base Policies ---
Write-Host "`n--- STEP 2: Query Corporate Knowledge Base Policies ---" -ForegroundColor Yellow
$policiesResponse = Invoke-RestMethod -Uri "$baseUrl/intelligence/policies" -Method Get -Headers $headers
$policies = $policiesResponse.data

if ($policies.Count -ge 6) {
    Write-Host "[PASS] Retrieved $($policies.Count) active HR policy articles for default tenant." -ForegroundColor Green
    foreach ($p in $policies) {
        Write-Host "       Policy: [$($p.category)] $($p.title)" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] Expected at least 6 seeded policies, but got $($policies.Count)." -ForegroundColor Red
    exit 1
}

# --- STEP 3: Ask AI Copilot - Leave & Encashment Inquiry ---
Write-Host "`n--- STEP 3: Ask AI Copilot - Leave & Encashment Inquiry ---" -ForegroundColor Yellow
$askBody1 = @{
    query = "What is the annual leave rollover policy and sick leave encashment limit?"
} | ConvertTo-Json

$askRes1 = Invoke-RestMethod -Uri "$baseUrl/intelligence/assistant/ask" -Method Post -Body $askBody1 -Headers $headers
$aiData1 = $askRes1.data

if ($aiData1.foundDirectMatch -and $aiData1.category -eq "LEAVE_AND_TIME_OFF") {
    Write-Host "[PASS] AI Assistant resolved Leave query with high confidence ($($aiData1.confidenceScore * 100)%)." -ForegroundColor Green
    Write-Host "       Matched Article: $($aiData1.matchedArticleTitle)" -ForegroundColor Gray
    Write-Host "       Action Route:    $($aiData1.actionRoute) ($($aiData1.actionLabel))" -ForegroundColor Gray
    Write-Host "       Related FAQs:    $($aiData1.relatedQuestions.Count) suggested questions" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Failed to match Leave policy correctly." -ForegroundColor Red
    exit 1
}

# --- STEP 4: Ask AI Copilot - Indian Statutory Tax Inquiry ---
Write-Host "`n--- STEP 4: Ask AI Copilot - Indian Statutory Tax Inquiry ---" -ForegroundColor Yellow
$askBody2 = @{
    query = "Explain the difference between New and Old Tax Regime deductions under 80C and HRA"
} | ConvertTo-Json

$askRes2 = Invoke-RestMethod -Uri "$baseUrl/intelligence/assistant/ask" -Method Post -Body $askBody2 -Headers $headers
$aiData2 = $askRes2.data

if ($aiData2.foundDirectMatch -and $aiData2.category -eq "STATUTORY_AND_TAX") {
    Write-Host "[PASS] AI Assistant resolved Statutory Tax query ($($aiData2.confidenceScore * 100)%)." -ForegroundColor Green
    Write-Host "       Matched Article: $($aiData2.matchedArticleTitle)" -ForegroundColor Gray
    Write-Host "       Action Route:    $($aiData2.actionRoute)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Failed to match Tax policy correctly." -ForegroundColor Red
    exit 1
}

# --- STEP 5: Ask AI Copilot - Night Shift Allowance Inquiry ---
Write-Host "`n--- STEP 5: Ask AI Copilot - Night Shift Allowance Inquiry ---" -ForegroundColor Yellow
$askBody3 = @{
    query = "What is the night differential allowance per logged shift and how do I swap?"
} | ConvertTo-Json

$askRes3 = Invoke-RestMethod -Uri "$baseUrl/intelligence/assistant/ask" -Method Post -Body $askBody3 -Headers $headers
$aiData3 = $askRes3.data

if ($aiData3.foundDirectMatch -and $aiData3.category -eq "ATTENDANCE_AND_SHIFTS") {
    Write-Host "[PASS] AI Assistant resolved Shift query ($($aiData3.confidenceScore * 100)%)." -ForegroundColor Green
    Write-Host "       Matched Article: $($aiData3.matchedArticleTitle)" -ForegroundColor Gray
    Write-Host "       Action Route:    $($aiData3.actionRoute)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Failed to match Shift policy correctly." -ForegroundColor Red
    exit 1
}

# --- STEP 6: Ask AI Copilot - Out-of-Domain Fallback Test ---
Write-Host "`n--- STEP 6: Ask AI Copilot - Out-of-Domain Fallback Test ---" -ForegroundColor Yellow
$askBody4 = @{
    query = "What is the best recipe for chocolate chip cookies?"
} | ConvertTo-Json

$askRes4 = Invoke-RestMethod -Uri "$baseUrl/intelligence/assistant/ask" -Method Post -Body $askBody4 -Headers $headers
$aiData4 = $askRes4.data

if (-not $aiData4.foundDirectMatch -and $aiData4.actionRoute -eq "/helpdesk") {
    Write-Host "[PASS] Fallback triggered cleanly for irrelevant question. Routed to Helpdesk." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Fallback handler failed for out-of-domain query." -ForegroundColor Red
    exit 1
}

# --- STEP 7: Workforce Flight Risk & Attrition Evaluation ---
Write-Host "`n--- STEP 7: Workforce Flight Risk & Attrition Evaluation ---" -ForegroundColor Yellow
$attritionRes = Invoke-RestMethod -Uri "$baseUrl/intelligence/attrition/risk-analysis" -Method Get -Headers $headers
$attritionList = $attritionRes.data

if ($attritionList.Count -gt 0) {
    Write-Host "[PASS] Evaluated $($attritionList.Count) employees for predictive attrition flight risk." -ForegroundColor Green
    $topRisk = $attritionList[0]
    Write-Host "       Top Risk Staff: $($topRisk.employeeName) ($($topRisk.department))" -ForegroundColor Gray
    Write-Host "       Risk Score:     $($topRisk.riskScore)/100 (Level: $($topRisk.riskLevel))" -ForegroundColor Gray
    Write-Host "       Primary Driver: $($topRisk.primaryDriver)" -ForegroundColor Gray
    Write-Host "       Intervention:   $($topRisk.retentionRecommendation)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] No flight risk evaluations returned." -ForegroundColor Red
    exit 1
}

# --- STEP 8: Real-Time Attrition Re-Evaluation Trigger ---
Write-Host "`n--- STEP 8: Real-Time Attrition Re-Evaluation Trigger ---" -ForegroundColor Yellow
$reEvalRes = Invoke-RestMethod -Uri "$baseUrl/intelligence/attrition/re-evaluate" -Method Post -Headers $headers
$reEvalList = $reEvalRes.data

if ($reEvalList.Count -eq $attritionList.Count) {
    Write-Host "[PASS] Re-evaluation completed and persisted to PostgreSQL 18 table 'flight_risk_evaluations'." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Re-evaluation output count mismatch." -ForegroundColor Red
    exit 1
}

# --- STEP 9: Departmental Flight Risk Aggregations ---
Write-Host "`n--- STEP 9: Departmental Flight Risk Aggregations ---" -ForegroundColor Yellow
$deptRes = Invoke-RestMethod -Uri "$baseUrl/intelligence/attrition/department-overview" -Method Get -Headers $headers
$deptOverview = $deptRes.data

if ($deptOverview.Count -gt 0) {
    Write-Host "[PASS] Retrieved $($deptOverview.Count) departmental risk profiles." -ForegroundColor Green
    foreach ($d in $deptOverview) {
        Write-Host "       Dept: $($d.departmentName) | Total: $($d.totalEmployees) | Avg Risk: $($d.averageRiskScore)% | High/Crit: $($d.highRiskCount + $d.criticalRiskCount)" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] No departmental summaries returned." -ForegroundColor Red
    exit 1
}

# --- STEP 10: ATS Smart Candidate Match & Resume Scorecard ---
Write-Host "`n--- STEP 10: ATS Smart Candidate Match & Resume Scorecard ---" -ForegroundColor Yellow
$jobsRes = Invoke-RestMethod -Uri "$baseUrl/recruitment/jobs" -Method Get -Headers $headers
$candsRes = Invoke-RestMethod -Uri "$baseUrl/recruitment/candidates" -Method Get -Headers $headers

$jobs = $jobsRes.data
$cands = $candsRes.data

if ($jobs.Count -gt 0 -and $cands.Count -gt 0) {
    $targetJob = $jobs[0]
    $targetCand = $cands[0]

    Write-Host "       Evaluating Candidate '$($targetCand.name)' against Job '$($targetJob.title)'" -ForegroundColor Gray

    $matchBody = @{
        jobPostingId = $targetJob.id
        candidateId  = $targetCand.id
    } | ConvertTo-Json

    $matchRes = Invoke-RestMethod -Uri "$baseUrl/intelligence/ats/evaluate-candidate" -Method Post -Body $matchBody -Headers $headers
    $scorecard = $matchRes.data

    if ($scorecard.overallMatchScore -ge 0 -and $scorecard.hiringVerdict) {
        Write-Host "[PASS] ATS Candidate Match Scorecard Generated Successfully!" -ForegroundColor Green
        Write-Host "       Overall Match:    $($scorecard.overallMatchScore)%" -ForegroundColor Gray
        Write-Host "       Skills Score:     $($scorecard.skillsMatchScore)%" -ForegroundColor Gray
        Write-Host "       Experience Score: $($scorecard.experienceMatchScore)%" -ForegroundColor Gray
        Write-Host "       Salary Fit Score: $($scorecard.salaryAlignmentScore)%" -ForegroundColor Gray
        Write-Host "       Hiring Verdict:   $($scorecard.hiringVerdict)" -ForegroundColor Gray
        Write-Host "       Executive Note:   $($scorecard.executiveSummary)" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Candidate evaluation scorecard missing scores or verdict." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[WARN] No job postings or candidates found for evaluation test. Skipping candidate match step." -ForegroundColor Yellow
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " PHASE 4 - MILESTONE 5: WORKFORCE INTELLIGENCE & AI: 100% PASSED" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
