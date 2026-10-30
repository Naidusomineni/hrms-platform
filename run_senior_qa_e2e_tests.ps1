# ==============================================================================
# HRMS Senior QA End-to-End Automation & Smoke Test Suite v2.2
# Tests: Auth, Employee Lifecycle, Email Sync Bug, Validation, All 12 Modules
# ==============================================================================

$baseUrl = "http://localhost:8080/api"
$testResults = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Result {
    param(
        [string]$TestId,
        [string]$Category,
        [string]$Description,
        [bool]$Passed,
        [string]$Details = ""
    )
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    Write-Host "[$status] $TestId - $Description" -ForegroundColor $color
    if ($Details -and -not $Passed) {
        Write-Host "       Error: $Details" -ForegroundColor Yellow
    }
    $testResults.Add([PSCustomObject]@{
        TestId      = $TestId
        Category    = $Category
        Description = $Description
        Status      = $status
        Details     = $Details
    })
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    $url = "$baseUrl$Path"
    $reqHeaders = @{
        "Content-Type" = "application/json"
        "X-Tenant-ID"  = "default"
    }
    foreach ($k in $Headers.Keys) {
        $reqHeaders[$k] = $Headers[$k]
    }

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $resp = Invoke-RestMethod -Uri $url -Method $Method -Headers $reqHeaders -Body $jsonBody -ErrorAction Stop
        } else {
            $resp = Invoke-RestMethod -Uri $url -Method $Method -Headers $reqHeaders -ErrorAction Stop
        }
        return @{ Success = $true; StatusCode = 200; Data = $resp }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $rawResp = ""
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $rawResp = $reader.ReadToEnd()
        }
        return @{ Success = $false; StatusCode = $status; Error = $_.Exception.Message; Raw = $rawResp }
    }
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " STARTING SENIOR QA AUTOMATION TEST HARNESS - HRMS PLATFORM v2.0" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# ------------------------------------------------------------------------------
# 1. AUTHENTICATION & MULTI-ROLE SMOKE TESTS
# ------------------------------------------------------------------------------
Write-Host "`n--- CATEGORY 1: Authentication & Role-Based Access ---" -ForegroundColor Yellow

$adminLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = "admin@hrms.com"; password = "Admin@123" }
$adminToken = $adminLogin.Data.data.accessToken
Record-Result -TestId "AUTH-01" -Category "Authentication" -Description "Super Admin Login" -Passed ($adminLogin.Success -and $adminToken) -Details $adminLogin.Error

$hrLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = "hr@hrms.com"; password = "Hr@123" }
$hrToken = $hrLogin.Data.data.accessToken
Record-Result -TestId "AUTH-02" -Category "Authentication" -Description "HR Manager Login" -Passed ($hrLogin.Success -and $hrToken) -Details $hrLogin.Error

$mgrLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = "manager@hrms.com"; password = "Manager@123" }
$mgrToken = $mgrLogin.Data.data.accessToken
Record-Result -TestId "AUTH-03" -Category "Authentication" -Description "Department Manager Login" -Passed ($mgrLogin.Success -and $mgrToken) -Details $mgrLogin.Error

$empLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = "emp@hrms.com"; password = "Emp@123" }
$empToken = $empLogin.Data.data.accessToken
Record-Result -TestId "AUTH-04" -Category "Authentication" -Description "Standard Employee Login" -Passed ($empLogin.Success -and $empToken) -Details $empLogin.Error

$badLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = "admin@hrms.com"; password = "WrongPassword!999" }
Record-Result -TestId "AUTH-05" -Category "Authentication" -Description "Reject Bad Credentials with 401" -Passed (-not $badLogin.Success -and $badLogin.StatusCode -eq 401) -Details "Status was $($badLogin.StatusCode)"

# ------------------------------------------------------------------------------
# 2. VALIDATION & ERROR HANDLING TESTS
# ------------------------------------------------------------------------------
Write-Host "`n--- CATEGORY 2: Input Validation & Error Surfacing ---" -ForegroundColor Yellow

$dupEmail = Invoke-Api -Method "POST" -Path "/v1/employees" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    firstName = "Duplicate"; lastName = "User"; email = "admin@hrms.com"; phoneNumber = "9876543210"
    designation = "Engineer"; dateOfJoining = "2026-01-01"; employmentStatus = "ACTIVE"
}
$isDuplicateHandled = (-not $dupEmail.Success -and ($dupEmail.StatusCode -eq 409 -or $dupEmail.Raw -like "*already exists*"))
Record-Result -TestId "VAL-01" -Category "Validation" -Description "Duplicate Email Rejected with 409 Conflict" -Passed $isDuplicateHandled -Details $dupEmail.Raw

$invalidPhone = Invoke-Api -Method "POST" -Path "/v1/employees" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    firstName = "Invalid"; lastName = "Phone"; email = "invalidphone_qa@hrms.com"; phoneNumber = "abc123"
    designation = "Engineer"; dateOfJoining = "2026-01-01"; employmentStatus = "ACTIVE"
}
$isPhoneValidationClear = (-not $invalidPhone.Success -and $invalidPhone.StatusCode -eq 400 -and $invalidPhone.Raw -like "*Validation error*")
Record-Result -TestId "VAL-02" -Category "Validation" -Description "Invalid Phone Format Surfaced with Clear Validation Message" -Passed $isPhoneValidationClear -Details $invalidPhone.Raw

# ------------------------------------------------------------------------------
# 3. CRITICAL BUG REGRESSION: EMPLOYEE CREATION, EMAIL EDIT & AUTH SYNC
# ------------------------------------------------------------------------------
Write-Host "`n--- CATEGORY 3: Critical Bug Regression: Employee Email Edit & Auth Sync ---" -ForegroundColor Yellow

$uniqueSuffix = Get-Random -Minimum 1000 -Maximum 9999
$origEmail = "testqa_$uniqueSuffix@hrms.com"
$updatedEmail = "testqa_updated_$uniqueSuffix@hrms.com"
$initialPass = "QAInitial@2026"
$newPass = "QANewPass@2026"

# A. Create Employee
$createEmp = Invoke-Api -Method "POST" -Path "/v1/employees" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    firstName = "QA"; lastName = "Specialist"; email = $origEmail; phoneNumber = "9988776655"
    designation = "Automation Engineer"; dateOfJoining = "2026-02-01"; employmentStatus = "ACTIVE"
    password = $initialPass; salary = 85000; bankAccountNumber = "998811223344"; bankName = "HDFC Bank"; ifscCode = "HDFC0001234"
}
$createdEmpId = $createEmp.Data.data.id
$createdUserId = $createEmp.Data.data.userId
Record-Result -TestId "BUG-01" -Category "Employee Lifecycle" -Description "Create New Employee with Initial Email ($origEmail)" -Passed ($createEmp.Success -and $createdEmpId) -Details $createEmp.Error

# B. Login with Initial Email
$initialLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = $origEmail; password = $initialPass }
$empAuthToken = $initialLogin.Data.data.accessToken
Record-Result -TestId "BUG-02" -Category "Auth Sync" -Description "Login with Initial Employee Email & Password" -Passed ($initialLogin.Success -and $empAuthToken) -Details $initialLogin.Error

# C. Edit Employee Email to new email
$updateEmp = Invoke-Api -Method "PUT" -Path "/v1/employees/$createdEmpId" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    firstName = "QA"; lastName = "Lead"; email = $updatedEmail; phoneNumber = "9988776655"
    designation = "Senior Automation Lead"; dateOfJoining = "2026-02-01"; employmentStatus = "ACTIVE"
    salary = 95000; bankAccountNumber = "998811223344"; bankName = "HDFC Bank"; ifscCode = "HDFC0001234"
}
$isUpdateOk = ($updateEmp.Success -and $updateEmp.Data.data.email -eq $updatedEmail)
Record-Result -TestId "BUG-03" -Category "Employee Lifecycle" -Description "Update Employee Email to ($updatedEmail)" -Passed $isUpdateOk -Details $updateEmp.Error

# D. Old Email MUST be rejected
$oldEmailLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = $origEmail; password = $initialPass }
$oldEmailRejected = (-not $oldEmailLogin.Success -and $oldEmailLogin.StatusCode -eq 401)
Record-Result -TestId "BUG-04" -Category "Auth Sync" -Description "Login with Old Email Must Be Rejected (401)" -Passed $oldEmailRejected -Details "Status: $($oldEmailLogin.StatusCode)"

# E. New Email MUST succeed with original password
$newEmailLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = $updatedEmail; password = $initialPass }
$newEmailToken = $newEmailLogin.Data.data.accessToken
$loggedUserId = $newEmailLogin.Data.data.userId
$loggedEmployeeId = $newEmailLogin.Data.data.employeeId
$isNewEmailLoginOk = ($newEmailLogin.Success -and $newEmailToken -and $newEmailLogin.Data.data.email -eq $updatedEmail)
Record-Result -TestId "BUG-05" -Category "Auth Sync" -Description "Login with New Updated Email Successfully Authenticates" -Passed $isNewEmailLoginOk -Details $newEmailLogin.Error

# F. Change Password flow
$changePw = Invoke-Api -Method "POST" -Path "/v1/auth/change-password?userId=$loggedUserId" -Headers @{ Authorization = "Bearer $newEmailToken" } -Body @{
    currentPassword = $initialPass; newPassword = $newPass; confirmPassword = $newPass
}
Record-Result -TestId "BUG-06" -Category "Auth Sync" -Description "Change Password for Updated User ($updatedEmail)" -Passed $changePw.Success -Details $changePw.Error

# G. Verify old password rejected
$oldPassLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = $updatedEmail; password = $initialPass }
Record-Result -TestId "BUG-07" -Category "Auth Sync" -Description "Login with Old Password Rejected After Change" -Passed (-not $oldPassLogin.Success -and $oldPassLogin.StatusCode -eq 401) -Details "Status: $($oldPassLogin.StatusCode)"

# H. Verify new password succeeds
$newPassLogin = Invoke-Api -Method "POST" -Path "/v1/auth/login" -Body @{ email = $updatedEmail; password = $newPass }
$finalEmpToken = $newPassLogin.Data.data.accessToken
Record-Result -TestId "BUG-08" -Category "Auth Sync" -Description "Login with New Password Succeeds and Returns Valid Session" -Passed ($newPassLogin.Success -and $finalEmpToken) -Details $newPassLogin.Error

# ------------------------------------------------------------------------------
# 4. FUNCTIONAL MATRIX: ALL 12 APPLICATION MODULES
# ------------------------------------------------------------------------------
Write-Host "`n--- CATEGORY 4: Complete Functional Matrix Across 12 Modules ---" -ForegroundColor Yellow

# Module 1: Tenant Admin & Dashboard Analytics
$tenantInfo = Invoke-Api -Method "GET" -Path "/v1/tenants/current" -Headers @{ Authorization = "Bearer $adminToken" }
$dashStats = Invoke-Api -Method "GET" -Path "/v1/dashboard/admin" -Headers @{ Authorization = "Bearer $adminToken" }
Record-Result -TestId "MOD-01" -Category "Tenant & Dashboard" -Description "Tenant Details & Admin Dashboard Analytics" -Passed ($tenantInfo.Success -and $dashStats.Success) -Details $dashStats.Error

# Module 2: Department Management
$createDept = Invoke-Api -Method "POST" -Path "/v1/departments" -Headers @{ Authorization = "Bearer $adminToken" } -Body @{
    name = "Quality Engineering $uniqueSuffix"; code = "QE$uniqueSuffix"; description = "Enterprise Automated Testing"
}
$createdDeptId = $createDept.Data.data.id
$listDepts = Invoke-Api -Method "GET" -Path "/v1/departments" -Headers @{ Authorization = "Bearer $adminToken" }
Record-Result -TestId "MOD-02" -Category "Department" -Description "Department Creation & Listing" -Passed ($createDept.Success -and $listDepts.Success) -Details $createDept.Error

# Module 3: Employee Management
$empSearch = Invoke-Api -Method "GET" -Path "/v1/employees?search=QA&page=0&size=10" -Headers @{ Authorization = "Bearer $hrToken" }
Record-Result -TestId "MOD-03" -Category "Employee" -Description "Employee Search, Pagination & Listing" -Passed ($empSearch.Success -and $empSearch.Data.data.content.Count -ge 1) -Details $empSearch.Error

# Module 4: Attendance & Geofencing Punch
$officeLocs = Invoke-Api -Method "GET" -Path "/v1/attendance/office-locations" -Headers @{ Authorization = "Bearer $adminToken" }
$officeId = if ($officeLocs.Success -and $officeLocs.Data.data.Count -gt 0) { $officeLocs.Data.data[0].id } else { 1 }
$punch = Invoke-Api -Method "POST" -Path "/v1/attendance/punch" -Headers @{ Authorization = "Bearer $finalEmpToken" } -Body @{
    employeeId = $createdEmpId; date = (Get-Date -Format "yyyy-MM-dd"); time = (Get-Date -Format "HH:mm:ss")
    punchType = "CHECK_IN"; latitude = 17.385044; longitude = 78.486671; officeLocationId = $officeId; remarks = "QA Automated Check-In"
}
Record-Result -TestId "MOD-04" -Category "Attendance" -Description "Geofenced GPS Attendance Punch & Office Geofences" -Passed ($officeLocs.Success -and $punch.Success) -Details $punch.Error

# Module 5: Leave Management (Enum: CASUAL, Future Dates)
$leaveStart = (Get-Date).AddDays(5).ToString("yyyy-MM-dd")
$leaveEnd   = (Get-Date).AddDays(6).ToString("yyyy-MM-dd")
$leaveBal = Invoke-Api -Method "GET" -Path "/v1/leaves/balances/employee/$createdEmpId" -Headers @{ Authorization = "Bearer $finalEmpToken" }
$applyLeave = Invoke-Api -Method "POST" -Path "/v1/leaves/apply/$createdEmpId" -Headers @{ Authorization = "Bearer $finalEmpToken" } -Body @{
    leaveType = "CASUAL"; startDate = $leaveStart; endDate = $leaveEnd; reason = "QA Automation Leave Test"
}
Record-Result -TestId "MOD-05" -Category "Leave" -Description "Leave Balance Retrieval & Leave Application" -Passed ($leaveBal.Success -and $applyLeave.Success) -Details $applyLeave.Error

# Module 6: Workflow & Approvals
$wfInbox = Invoke-Api -Method "GET" -Path "/v1/workflows/inbox" -Headers @{ Authorization = "Bearer $adminToken" }
$wfDefs = Invoke-Api -Method "GET" -Path "/v1/workflows/definitions" -Headers @{ Authorization = "Bearer $adminToken" }
Record-Result -TestId "MOD-06" -Category "Workflow" -Description "Workflow Definitions & Approvals Inbox" -Passed ($wfInbox.Success -and $wfDefs.Success) -Details $wfInbox.Error

# Module 7: Document Vault & Pending Verification
$pendingDocs = Invoke-Api -Method "GET" -Path "/v1/documents/pending-verification" -Headers @{ Authorization = "Bearer $hrToken" }
$empDocs = Invoke-Api -Method "GET" -Path "/v1/documents/employee/$createdEmpId" -Headers @{ Authorization = "Bearer $hrToken" }
Record-Result -TestId "MOD-07" -Category "Document" -Description "Document Vault & Verification Queue" -Passed ($pendingDocs.Success -and $empDocs.Success) -Details $pendingDocs.Error

# Module 8: ESS (Employee Self-Service Requests)
$submitRequest = Invoke-Api -Method "POST" -Path "/v1/requests" -Headers @{ Authorization = "Bearer $finalEmpToken" } -Body @{
    employeeId = $createdEmpId; requestType = "WORK_FROM_HOME"; title = "Remote Automated Testing"
    startDate = "2026-11-15"; endDate = "2026-11-16"; description = "Regression verification"
}
$empRequests = Invoke-Api -Method "GET" -Path "/v1/requests/employee/$createdEmpId" -Headers @{ Authorization = "Bearer $finalEmpToken" }
Record-Result -TestId "MOD-08" -Category "ESS Requests" -Description "Submit WFH / Expense Request & View Requests" -Passed ($submitRequest.Success -and $empRequests.Success) -Details $submitRequest.Error

# Module 9: Payroll Management
$processPay = Invoke-Api -Method "POST" -Path "/v1/payroll/process?employeeId=$createdEmpId&month=1&year=2026" -Headers @{ Authorization = "Bearer $hrToken" }
$empSlips = Invoke-Api -Method "GET" -Path "/v1/payroll/employee/$createdEmpId" -Headers @{ Authorization = "Bearer $hrToken" }
$isPayOk = (($processPay.Success -or $processPay.StatusCode -eq 409) -and $empSlips.Success)
Record-Result -TestId "MOD-09" -Category "Payroll" -Description "Payroll Processing & Employee Slips" -Passed $isPayOk -Details $processPay.Error

# Module 10: Performance Management (Phase 3)
$cycles = Invoke-Api -Method "GET" -Path "/v1/performance/cycles" -Headers @{ Authorization = "Bearer $adminToken" }
$empGoals = Invoke-Api -Method "GET" -Path "/v1/performance/goals/employee/$createdEmpId" -Headers @{ Authorization = "Bearer $adminToken" }
Record-Result -TestId "MOD-10" -Category "Performance" -Description "Appraisal Cycles & Employee Goals (Phase 3)" -Passed ($cycles.Success -and $empGoals.Success) -Details $cycles.Error

# Module 11: Recruitment & 1-Click Candidate-to-Employee (Phase 3)
$jobPostings = Invoke-Api -Method "GET" -Path "/v1/recruitment/jobs" -Headers @{ Authorization = "Bearer $hrToken" }
$jobId = if ($jobPostings.Success -and $jobPostings.Data.data.Count -gt 0) { $jobPostings.Data.data[0].id } else { 1 }
$candidates = Invoke-Api -Method "GET" -Path "/v1/recruitment/candidates" -Headers @{ Authorization = "Bearer $hrToken" }
$newCand = Invoke-Api -Method "POST" -Path "/v1/recruitment/candidates" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    name = "Candidate $uniqueSuffix"; email = "candidate_$uniqueSuffix@example.com"; phone = "9876543219"
    jobPostingId = $jobId; experienceYears = 4; expectedCtc = 75000; notes = "Screened by QA"
}
$candId = $newCand.Data.data.id
$convertCand = Invoke-Api -Method "POST" -Path "/v1/recruitment/candidates/$candId/convert-to-employee" -Headers @{ Authorization = "Bearer $hrToken" } -Body @{
    employeeNumber = "EMP-CONV-$uniqueSuffix"; dateOfJoining = "2026-11-01"; designation = "QA Analyst"; salary = 75000
}
$isRecOk = ($jobPostings.Success -and $newCand.Success -and $convertCand.Success)
Record-Result -TestId "MOD-11" -Category "Recruitment" -Description "Job Postings, Candidate Pipeline & 1-Click Onboarding" -Passed $isRecOk -Details $convertCand.Error

# Module 12: Assets & Reports (Phase 3)
$assets = Invoke-Api -Method "GET" -Path "/v1/assets" -Headers @{ Authorization = "Bearer $adminToken" }
$taxDecl = Invoke-Api -Method "POST" -Path "/v1/reports/tax" -Headers @{ Authorization = "Bearer $finalEmpToken" } -Body @{
    employeeId = $createdEmpId; financialYear = "2025-2026"; section80C = 150000; section80D = 25000; hraRentPaid = 180000; regime = "NEW"
}
$execAnalytics = Invoke-Api -Method "GET" -Path "/v1/reports/analytics" -Headers @{ Authorization = "Bearer $adminToken" }
Record-Result -TestId "MOD-12" -Category "Assets & Reports" -Description "Asset Inventory, Tax Declarations & Executive BI (Phase 3)" -Passed ($assets.Success -and $taxDecl.Success -and $execAnalytics.Success) -Details $taxDecl.Error

# ------------------------------------------------------------------------------
# 5. LOGOUT & SESSION INVALIDATION
# ------------------------------------------------------------------------------
Write-Host "`n--- CATEGORY 5: Logout & Session Invalidation ---" -ForegroundColor Yellow

$refreshToken = $newPassLogin.Data.data.refreshToken
$logout = Invoke-Api -Method "POST" -Path "/v1/auth/logout?refreshToken=$refreshToken"
Record-Result -TestId "SESS-01" -Category "Session" -Description "User Logout & Refresh Token Revocation" -Passed $logout.Success -Details $logout.Error

# ------------------------------------------------------------------------------
# SUMMARY REPORT GENERATION
# ------------------------------------------------------------------------------
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " SENIOR QA AUTOMATION TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$passRate = [math]::Round(($passedCount / $totalTests) * 100, 2)

Write-Host "TOTAL EXECUTED: $totalTests" -ForegroundColor White
Write-Host "PASSED:         $passedCount" -ForegroundColor Green
Write-Host "FAILED:         $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })
Write-Host "PASS RATE:      $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } else { "Yellow" })

$testResults | Format-Table -Property TestId, Category, Status, Description -AutoSize

if ($failedCount -eq 0) {
    Write-Host "`n>>> SENIOR QA VERIFICATION: ALL 28 AUTOMATION TESTS PASSED WITH ZERO FAILURES! (100% SUCCESS) <<<" -ForegroundColor Green
} else {
    Write-Host "`n>>> SENIOR QA ALERT: $failedCount TESTS FAILED! INVESTIGATE DETAILS ABOVE. <<<" -ForegroundColor Red
}
