# test_phase4_milestone2_attendance_payroll.ps1
# Senior QA Automation & Integration Verification Suite for Phase 4 Milestone 2
# Tests: Enterprise Payroll 2.0 (Batch Payroll, Bank CSV Export) + Attendance 2.0 (Auto Login, Break, Biometric Sync)

$baseUrl = "http://localhost:8080/api"
$totalTests = 0
$passedTests = 0
$failedTests = 0

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
Write-Host " HRMS ENTERPRISE QA: PHASE 4 MILESTONE 2 AUTOMATED TEST SUITE    " -ForegroundColor Cyan
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
    }
    Report-Assert "Admin authentication successful" ($token -ne $null -and $token.Length -gt 20) "Token length: $($token.Length)"
} catch {
    Report-Assert "Admin authentication successful" $false $_.Exception.Message
    exit 1
}

# Find test employee
Write-Host "`n--- Step 2: Employee Retrieval ---" -ForegroundColor Cyan
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

# Step 3: Batch Payroll Processing
Write-Host "`n--- Step 3: Batch Payroll Processing (All Active Employees) ---" -ForegroundColor Cyan
try {
    $batchRes = Invoke-RestMethod -Uri "$baseUrl/v1/payroll/process-all?month=10&year=2026" -Method Post -Headers $headers
    $data = $batchRes.data
    Report-Assert "Batch payroll executed successfully" ($batchRes.success -eq $true) "Message: $($batchRes.message)"
    Report-Assert "Batch processed count > 0" ($data.processed -gt 0 -or $data.processedCount -gt 0) "Processed: $($data.processed)"
    Report-Assert "Batch total net disbursed calculated" ($data.totalNetDisbursed -ne $null) "Total Disbursed: ₹$($data.totalNetDisbursed)"
} catch {
    Report-Assert "Batch payroll executed successfully" $false $_.Exception.Message
}

# Step 4: Corporate Bank Batch Disbursement API
Write-Host "`n--- Step 4: Corporate Bank Batch Disbursement Query ---" -ForegroundColor Cyan
try {
    $bankRes = Invoke-RestMethod -Uri "$baseUrl/v1/payroll/bank-batch?month=10&year=2026" -Method Get -Headers $headers
    $disbursements = $bankRes.data
    Report-Assert "Retrieved bank disbursement list" ($disbursements.Count -gt 0) "Total records: $($disbursements.Count)"
    $sampleRecord = $disbursements[0]
    Report-Assert "Bank record contains required NEFT fields" (
        $sampleRecord.employeeNumber -ne $null -and
        $sampleRecord.employeeName -ne $null -and
        $sampleRecord.bankAccountNumber -ne $null
    ) "Sample: $($sampleRecord.employeeName) | Account: $($sampleRecord.bankAccountNumber) | IFSC: $($sampleRecord.ifscCode)"
} catch {
    Report-Assert "Retrieved bank disbursement list" $false $_.Exception.Message
}

# Step 5: Corporate Bank Batch CSV Export
Write-Host "`n--- Step 5: Bank Batch CSV Export ---" -ForegroundColor Cyan
try {
    $csvResponse = Invoke-WebRequest -Uri "$baseUrl/v1/payroll/bank-batch-export?month=10&year=2026" -Method Get -Headers $headers -UseBasicParsing
    $csvContent = $csvResponse.Content
    $hasHeader = $csvContent.Contains("BeneficiaryName,AccountNumber,IFSCCode")
    Report-Assert "CSV export returns HTTP 200" ($csvResponse.StatusCode -eq 200) "Status: $($csvResponse.StatusCode)"
    Report-Assert "CSV Content-Type is text/csv" ($csvResponse.Headers["Content-Type"].Contains("text/csv")) "Content-Type: $($csvResponse.Headers["Content-Type"])"
    Report-Assert "CSV contains standard NEFT banking headers" $hasHeader "Header match confirmed"
    Report-Assert "CSV contains disbursement rows" ($csvContent.Split("`n").Length -gt 2) "Lines: $($csvContent.Split("`n").Length)"
} catch {
    Report-Assert "CSV export executed" $false $_.Exception.Message
}

# Step 6: Auto-Login Attendance Punch (Option A)
Write-Host "`n--- Step 6: Auto-Login Attendance Punch (Option A) ---" -ForegroundColor Cyan
try {
    $autoPunchRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/auto-login-punch?employeeId=$empId&workMode=OFFICE" -Method Post -Headers $headers
    $att = $autoPunchRes.data
    Report-Assert "Auto-login punch recorded" ($autoPunchRes.success -eq $true) "Message: $($autoPunchRes.message)"
    Report-Assert "Check-In time is set" ($att.checkInTime -ne $null) "Check-In Time: $($att.checkInTime)"
    Report-Assert "Punch source marked as AUTO_LOGIN" ($att.punchSource -eq "AUTO_LOGIN") "Punch Source: $($att.punchSource)"
    Report-Assert "Work mode marked as OFFICE" ($att.workMode -eq "OFFICE") "Work Mode: $($att.workMode)"
} catch {
    Report-Assert "Auto-login punch recorded" $false $_.Exception.Message
}

# Step 7: Break Management (Take Break & Resume Work)
Write-Host "`n--- Step 7: Break Management (Take Break & Resume Work) ---" -ForegroundColor Cyan
try {
    # 7.1 Start Break
    $startBreakRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/break-toggle?employeeId=$empId" -Method Post -Headers $headers
    $breakAtt = $startBreakRes.data
    Report-Assert "Break started successfully" ($breakAtt.isOnBreak -eq $true) "isOnBreak: $($breakAtt.isOnBreak)"

    # Wait 1.5 seconds to simulate break duration
    Start-Sleep -Milliseconds 1500

    # 7.2 Resume Work
    $endBreakRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/break-toggle?employeeId=$empId" -Method Post -Headers $headers
    $resumedAtt = $endBreakRes.data
    Report-Assert "Work resumed successfully" ($resumedAtt.isOnBreak -eq $false) "isOnBreak: $($resumedAtt.isOnBreak)"
    Report-Assert "Break minutes tracked" ($resumedAtt.breakMinutes -ne $null) "Total Break: $($resumedAtt.breakMinutes) mins"
} catch {
    Report-Assert "Break management executed" $false $_.Exception.Message
}

# Step 8: Today Shift Status
Write-Host "`n--- Step 8: Today Shift Status API ---" -ForegroundColor Cyan
try {
    $statusRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/today-status?employeeId=$empId" -Method Get -Headers $headers
    $todayAtt = $statusRes.data
    Report-Assert "Retrieved today shift status" ($todayAtt -ne $null) "Date: $($todayAtt.date) | CheckIn: $($todayAtt.checkInTime)"
    Report-Assert "Shift status reflects break state" ($todayAtt.isOnBreak -eq $false) "isOnBreak: $($todayAtt.isOnBreak)"
} catch {
    Report-Assert "Retrieved today shift status" $false $_.Exception.Message
}

# Step 9: Biometric Device Fleet
Write-Host "`n--- Step 9: Biometric Turnstile Fleet & Registry ---" -ForegroundColor Cyan
try {
    # 9.1 Get Devices
    $devRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/biometric-devices" -Method Get -Headers $headers
    $devices = $devRes.data
    Report-Assert "Retrieved biometric devices" ($devices.Count -ge 2) "Found $($devices.Count) registered devices"
    $hasGate01 = ($devices | Where-Object { $_.deviceCode -eq "GATE-01" }) -ne $null
    Report-Assert "Default device GATE-01 exists" $hasGate01 "GATE-01 registered"

    # 9.2 Add New Device
    $newDevPayload = @{
        deviceCode = "GATE-TEST-$(Get-Random -Minimum 100 -Maximum 999)"
        deviceName = "Automated Test Turnstile"
        ipAddress  = "192.168.10.88"
        location   = "North Security Wing"
        isActive   = $true
    } | ConvertTo-Json

    $addDevRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/biometric-devices" -Method Post -Body $newDevPayload -ContentType "application/json" -Headers $headers
    Report-Assert "Registered new biometric device" ($addDevRes.success -eq $true) "Device: $($addDevRes.data.deviceCode)"
} catch {
    Report-Assert "Biometric device registry test" $false $_.Exception.Message
}

# Step 10: Biometric Direct Webhook Sync
Write-Host "`n--- Step 10: Biometric Direct Webhook Sync ---" -ForegroundColor Cyan
try {
    $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    $punchObj = @{
        employeeNumber = $empNum
        timestamp      = $timestamp
        deviceId       = "GATE-01"
    } | ConvertTo-Json
    $punchPayload = '[' + $punchObj + ']'

    $syncRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/biometric-sync" -Method Post -Body $punchPayload -ContentType "application/json" -Headers $headers
    $syncData = $syncRes.data
    Report-Assert "Biometric punch synced via webhook" ($syncRes.success -eq $true) "Processed: $($syncData.processed), Failed: $($syncData.failed)"
    Report-Assert "Punch processed count == 1" ($syncData.processed -eq 1) "Processed count: $($syncData.processed)"
} catch {
    Report-Assert "Biometric sync webhook" $false $_.Exception.Message
}

# Step 11: Bulk Biometric CSV Upload
Write-Host "`n--- Step 11: Bulk Biometric CSV Upload ---" -ForegroundColor Cyan
try {
    $csvTempPath = [System.IO.Path]::GetTempFileName() + ".csv"
    $csvLines = @(
        "employeeNumber,timestamp,deviceId",
        "$empNum,$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss')),GATE-02"
    )
    $csvLines | Out-File -FilePath $csvTempPath -Encoding ascii

    # Upload using curl.exe
    $curlCmd = "curl.exe -s -X POST `"$baseUrl/v1/attendance/biometric-upload`" -H `"Authorization: Bearer $token`" -H `"X-Tenant-ID: default`" -F `"file=@$csvTempPath`""
    $curlOutput = Invoke-Expression $curlCmd | ConvertFrom-Json
    Report-Assert "Biometric CSV uploaded and processed" ($curlOutput.success -eq $true) "Processed: $($curlOutput.data.processed)"
    Report-Assert "CSV processed count >= 1" ($curlOutput.data.processed -ge 1) "Processed: $($curlOutput.data.processed)"

    Remove-Item -Path $csvTempPath -Force -ErrorAction SilentlyContinue
} catch {
    Report-Assert "Biometric CSV upload" $false $_.Exception.Message
}

# Step 12: Check-Out Punch & Working Hours Calculation
Write-Host "`n--- Step 12: Check-Out Punch & Working Hours Calculation ---" -ForegroundColor Cyan
try {
    $nowTime = (Get-Date).ToString("HH:mm:ss")
    $punchOutPayload = @{
        employeeId       = $empId
        date             = (Get-Date).ToString("yyyy-MM-dd")
        time             = $nowTime
        punchType        = "CHECK_OUT"
        latitude         = 0.0
        longitude        = 0.0
        officeLocationId = $null
        remarks          = "End of automated shift test"
    } | ConvertTo-Json

    $outRes = Invoke-RestMethod -Uri "$baseUrl/v1/attendance/punch" -Method Post -Body $punchOutPayload -ContentType "application/json" -Headers $headers
    $finalAtt = $outRes.data
    Report-Assert "Check-out punch recorded" ($outRes.success -eq $true) "Status: $($finalAtt.status)"
} catch {
    Report-Assert "Check-out punch recorded" $false $_.Exception.Message
}

# Final Summary
$summaryColor = "Green"
if ($failedTests -gt 0) { $summaryColor = "Red" }
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " TEST RUN SUMMARY: Total: $totalTests | Passed: $passedTests | Failed: $failedTests" -ForegroundColor $summaryColor
Write-Host " Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 1))%" -ForegroundColor $summaryColor
Write-Host "=================================================================" -ForegroundColor Cyan

if ($failedTests -gt 0) { exit 1 } else { exit 0 }
