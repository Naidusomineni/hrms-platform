# test_phase4_milestone3_offboarding_settlement.ps1
# Senior QA Automation & Integration Verification Suite for Phase 4 Milestone 3
# Tests: Separation Workflow, Multi-Department Clearance NOC, Statutory Gratuity, Leave Encashment, and F&F Settlement

$baseUrl = "http://localhost:8080/api"
$global:totalTests = 0
$global:passedTests = 0
$global:failedTests = 0

function Report-Assert($testName, $condition, $details) {
    $global:totalTests++
    if ($condition) {
        $global:passedTests++
        Write-Host "  [PASS] $testName" -ForegroundColor Green
    } else {
        $global:failedTests++
        Write-Host "  [FAIL] $testName" -ForegroundColor Red
        if ($details) { Write-Host "         Details: $details" -ForegroundColor Yellow }
    }
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " HRMS ENTERPRISE QA: PHASE 4 MILESTONE 3 AUTOMATED TEST SUITE    " -ForegroundColor Cyan
Write-Host " (Full & Final Settlement, Department NOC & Offboarding Engine)  " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Admin Authentication
Write-Host "`n--- Step 1: Admin Authentication ---" -ForegroundColor Cyan
$loginPayload = @{ email = "admin@hrms.com"; password = "Admin@123" } | ConvertTo-Json
try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/v1/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $token = $loginRes.data.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-ID"   = "default"
        "Content-Type"  = "application/json"
    }
    Report-Assert "Admin authentication successful" ($token -ne $null -and $token.Length -gt 20) "Token length: $($token.Length)"
} catch {
    Report-Assert "Admin authentication successful" $false $_.Exception.Message
    exit 1
}

# Step 2: Employee Provisioning / Selection for Separation Test
Write-Host "`n--- Step 2: Employee Retrieval for Offboarding ---" -ForegroundColor Cyan
try {
    $empRes = Invoke-RestMethod -Uri "$baseUrl/v1/employees?size=50" -Method Get -Headers $headers
    $employee = $empRes.data.content[0]
    $empId = $employee.id
    $empNum = $employee.employeeNumber
    Report-Assert "Retrieved test employee" ($empId -gt 0) "Employee: $($employee.fullName) ($empNum, ID: $empId)"
} catch {
    Report-Assert "Retrieved test employee" $false $_.Exception.Message
    exit 1
}

# Clean any existing active separation for this employee to allow fresh test run
try {
    $existingRes = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations/my?employeeId=$empId" -Method Get -Headers $headers
    if ($existingRes.data -and $existingRes.data.id) {
        $existingId = $existingRes.data.id
        $env:PGPASSWORD="Naidu@98666"
        & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d hrms_db -c "DELETE FROM employee_separations WHERE id = $existingId;" > $null 2>&1
    }
} catch {}

# Step 3: Submit Employee Resignation
Write-Host "`n--- Step 3: Submit Employee Resignation / Separation ---" -ForegroundColor Cyan
$todayStr = (Get-Date).ToString("yyyy-MM-dd")
$lwdStr = (Get-Date).AddDays(90).ToString("yyyy-MM-dd")
$resignationPayload = @{
    employeeId               = $empId
    resignationDate          = $todayStr
    requestedLastWorkingDay  = $lwdStr
    reason                   = "Pursuing advanced master's degree in cloud computing"
    separationType           = "RESIGNATION"
} | ConvertTo-Json

try {
    $submitRes = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations" -Method Post -Body $resignationPayload -Headers $headers
    $sepData = $submitRes.data
    $sepId = $sepData.id
    Report-Assert "Separation request created" ($submitRes.success -eq $true -and $sepId -gt 0) "Separation ID: $sepId"
    Report-Assert "Separation status is SUBMITTED" ($sepData.status -eq "SUBMITTED") "Status: $($sepData.status)"
    Report-Assert "4 Clearance Checkpoints Auto-Provisioned" ($sepData.clearances.Count -eq 4) "Clearances count: $($sepData.clearances.Count)"
} catch {
    Report-Assert "Separation request creation" $false $_.Exception.Message
    exit 1
}

# Step 4: Separation Register & My Separation Queries
Write-Host "`n--- Step 4: Separation Register & Queries ---" -ForegroundColor Cyan
try {
    # 4.1 Register Query
    $listRes = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations" -Method Get -Headers $headers
    $allSeps = $listRes.data.content
    Report-Assert "Separations register query succeeded" ($allSeps.Count -gt 0) "Total registered cases: $($allSeps.Count)"

    # 4.2 My Separation Query
    $myRes = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations/my?employeeId=$empId" -Method Get -Headers $headers
    Report-Assert "My active separation retrieved" ($myRes.data.id -eq $sepId) "Matched separation ID: $($myRes.data.id)"
} catch {
    Report-Assert "Separation queries" $false $_.Exception.Message
}

# Step 5: Manager / HR Review & Approval
Write-Host "`n--- Step 5: Manager / HR Separation Review ---" -ForegroundColor Cyan
try {
    $approvedLwd = (Get-Date).AddDays(60).ToString("yyyy-MM-dd")
    $reviewUrl = "$baseUrl/v1/offboarding/separations/$sepId/review?action=APPROVED&approvedLwd=$approvedLwd&comments=Notice+period+buyout+approved+by+management"
    $reviewRes = Invoke-RestMethod -Uri $reviewUrl -Method Put -Headers $headers
    $reviewedData = $reviewRes.data
    Report-Assert "Separation approved by HR" ($reviewRes.success -eq $true) "Message: $($reviewRes.message)"
    Report-Assert "Separation status promotes to CLEARANCE_PENDING" ($reviewedData.status -eq "CLEARANCE_PENDING") "Status: $($reviewedData.status)"
    Report-Assert "Approved LWD persisted" ($reviewedData.approvedLastWorkingDay -eq $approvedLwd) "Approved LWD: $($reviewedData.approvedLastWorkingDay)"
} catch {
    Report-Assert "Separation review and approval" $false $_.Exception.Message
}

# Step 6: Multi-Department NOC Clearance Checkpoints
Write-Host "`n--- Step 6: Multi-Department NOC Clearance Checkpoints ---" -ForegroundColor Cyan
try {
    $clearances = $reviewedData.clearances
    Report-Assert "Clearances array populated" ($clearances.Count -eq 4) "Count: $($clearances.Count)"

    foreach ($c in $clearances) {
        $cId = $c.id
        $dept = $c.departmentType
        $dues = 0.00
        $remarks = "Departmental handover verified"
        if ($dept -eq "FINANCE") {
            $dues = 500.00 # Simulated unreturned advance
            $remarks = "Travel advance balance deduction of 500 INR"
        }

        $cUrl = "$baseUrl/v1/offboarding/clearances/$($cId)?status=CLEARED&pendingDues=$dues&remarks=$([System.Uri]::EscapeDataString($remarks))"
        $cRes = Invoke-RestMethod -Uri $cUrl -Method Put -Headers $headers
        Report-Assert "Clearance updated for $dept" ($cRes.data.status -eq "CLEARED") "Dues: ₹$($cRes.data.pendingDues)"
    }

    # Verify separation promotes to CLEARANCE_COMPLETED
    $checkSep = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations/$sepId" -Method Get -Headers $headers
    Report-Assert "Separation promotes to CLEARANCE_COMPLETED" ($checkSep.data.status -eq "CLEARANCE_COMPLETED") "Status: $($checkSep.data.status)"
} catch {
    Report-Assert "Department clearance verification" $false $_.Exception.Message
}

# Step 7: Statutory Full & Final Settlement (F&F) Calculation
Write-Host "`n--- Step 7: Statutory Full & Final Settlement (F&F) Calculation ---" -ForegroundColor Cyan
try {
    $calcUrl = "$baseUrl/v1/offboarding/settlements/calculate?separationId=$sepId"
    $calcRes = Invoke-RestMethod -Uri $calcUrl -Method Post -Headers $headers
    $fnf = $calcRes.data

    Report-Assert "F&F calculation succeeded" ($calcRes.success -eq $true) "Calculated for: $($fnf.employeeName)"
    Report-Assert "Last drawn basic derived" ([double]$fnf.lastDrawnBasic -gt 0) "Basic: ₹$($fnf.lastDrawnBasic)"
    Report-Assert "Tenure years calculated" ([double]$fnf.tenureYears -ge 0) "Tenure: $($fnf.tenureYears) Years"
    Report-Assert "Leave encashment computed" ([double]$fnf.leaveEncashmentAmount -gt 0) "Leave Encashment: ₹$($fnf.leaveEncashmentAmount) ($($fnf.earnedLeaveBalance) days)"
    Report-Assert "Prorated salary computed" ([double]$fnf.proratedSalaryAmount -gt 0) "Prorated Salary: ₹$($fnf.proratedSalaryAmount)"
    Report-Assert "Asset recovery includes Finance dues" ([double]$fnf.assetRecoveryDuction -ge 500) "Recoveries: ₹$($fnf.assetRecoveryDuction)"
    Report-Assert "Net payable amount computed" ([double]$fnf.netPayableAmount -gt 0) "Net Payable: ₹$($fnf.netPayableAmount)"
} catch {
    Report-Assert "F&F calculation executed" $false $_.Exception.Message
}

# Step 8: Finalize & Disburse Settlement
Write-Host "`n--- Step 8: Finalize & Disburse Settlement ---" -ForegroundColor Cyan
try {
    $fnfPayload = $fnf | ConvertTo-Json
    $disburseUrl = "$baseUrl/v1/offboarding/settlements?disburse=true"
    $disburseRes = Invoke-RestMethod -Uri $disburseUrl -Method Post -Body $fnfPayload -Headers $headers
    $finalFnf = $disburseRes.data

    Report-Assert "Settlement status is DISBURSED" ($finalFnf.status -eq "DISBURSED") "Status: $($finalFnf.status)"
    Report-Assert "Transaction reference generated" ($finalFnf.transactionReference -ne $null -and $finalFnf.transactionReference.StartsWith("FNF-TXN-")) "Ref: $($finalFnf.transactionReference)"
    Report-Assert "Disbursed timestamp set" ($finalFnf.disbursedAt -ne $null) "Disbursed At: $($finalFnf.disbursedAt)"

    # Verify separation status promotes to SETTLED
    $settledSep = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/separations/$sepId" -Method Get -Headers $headers
    Report-Assert "Separation status finalized to SETTLED" ($settledSep.data.status -eq "SETTLED") "Status: $($settledSep.data.status)"

    # Verify employee employmentStatus transitions to TERMINATED
    $empCheck = Invoke-RestMethod -Uri "$baseUrl/v1/employees/$empId" -Method Get -Headers $headers
    Report-Assert "Employee transitioned to TERMINATED" ($empCheck.data.employmentStatus -eq "TERMINATED") "Status: $($empCheck.data.employmentStatus)"
    Report-Assert "Employee date of leaving recorded" ($empCheck.data.dateOfLeaving -ne $null) "Date of leaving: $($empCheck.data.dateOfLeaving)"
} catch {
    Report-Assert "Finalize and disburse settlement" $false $_.Exception.Message
}

# Step 9: Retrieve Disbursed Settlement Query
Write-Host "`n--- Step 9: Settlement Query by Separation ID ---" -ForegroundColor Cyan
try {
    $getFnfRes = Invoke-RestMethod -Uri "$baseUrl/v1/offboarding/settlements/separation/$sepId" -Method Get -Headers $headers
    Report-Assert "Retrieved disbursed settlement statement" ($getFnfRes.data.netPayableAmount -eq $finalFnf.netPayableAmount) "Net Payable: ₹$($getFnfRes.data.netPayableAmount)"
} catch {
    Report-Assert "Settlement query" $false $_.Exception.Message
}

# Final Summary
$summaryColor = "Green"
if ($global:failedTests -gt 0) { $summaryColor = "Red" }
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " TEST RUN SUMMARY: Total: $global:totalTests | Passed: $global:passedTests | Failed: $global:failedTests" -ForegroundColor $summaryColor
Write-Host " Success Rate: $([math]::Round(($global:passedTests / $global:totalTests) * 100, 1))%" -ForegroundColor $summaryColor
Write-Host "=================================================================" -ForegroundColor Cyan

if ($global:failedTests -gt 0) { exit 1 } else { exit 0 }
