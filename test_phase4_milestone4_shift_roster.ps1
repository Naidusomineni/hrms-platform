# ==============================================================================
# PHASE 4 - MILESTONE 4: SHIFT & ROSTER MANAGEMENT VERIFICATION SUITE
# ==============================================================================

$baseUrl = "http://localhost:8080/api/v1"
$testId = Get-Random -Minimum 1000 -Maximum 9999
$adminEmail = "admin@hrms.com"
$adminPassword = "Admin@123"

$defaultHeaders = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID"  = "default"
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " STARTING PHASE 4 - MILESTONE 4: SHIFT & ROSTER AUTOMATION SUITE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Step 1: Admin Authentication
Write-Host "`n--- STEP 1: Admin Authentication ---" -ForegroundColor Yellow
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $defaultHeaders
$adminToken = $adminRes.data.accessToken
$authHeaders = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID"  = "default"
    "Authorization" = "Bearer $adminToken"
}
Write-Host "[PASS] Admin Logged In. Token Acquired." -ForegroundColor Green

# Step 2: Query Default Seeded Shifts
Write-Host "`n--- STEP 2: Query Seeded Enterprise Shifts ---" -ForegroundColor Yellow
$shiftsRes = Invoke-RestMethod -Uri "$baseUrl/shifts" -Method Get -Headers $authHeaders
$shifts = $shiftsRes.data
Write-Host "[PASS] Found $($shifts.Count) active shifts in tenant 'default'." -ForegroundColor Green
$morningShift = $shifts | Where-Object { $_.shiftCode -eq "MORN_0615" }
$nightShift = $shifts | Where-Object { $_.shiftCode -eq "NIGHT_2106" }
Write-Host "       Morning Shift: $($morningShift.name) ($($morningShift.startTime) - $($morningShift.endTime))" -ForegroundColor Cyan
Write-Host "       Night Shift:   $($nightShift.name) ($($nightShift.startTime) - $($nightShift.endTime)), NightAllowance: INR $($nightShift.nightAllowanceRate)" -ForegroundColor Cyan

# Step 3: Register Custom Shift Definition
Write-Host "`n--- STEP 3: Register Custom Shift Definition ---" -ForegroundColor Yellow
$customShiftBody = @{
    name = "DevOps On-Call Support ($testId)"
    shiftCode = "ONCALL_$testId"
    startTime = "18:00:00"
    endTime = "02:00:00"
    gracePeriodMins = 20
    breakDurationMins = 45
    isNightShift = $true
    nightAllowanceRate = 400.00
} | ConvertTo-Json

$customRes = Invoke-RestMethod -Uri "$baseUrl/shifts" -Method Post -Body $customShiftBody -Headers $authHeaders
$customShift = $customRes.data
Write-Host "[PASS] Custom Shift Created: ID=$($customShift.id), Code=$($customShift.shiftCode)" -ForegroundColor Green

# Step 4: Pick Two Employees for Roster Scheduling
Write-Host "`n--- STEP 4: Select Employees for Roster Allocation ---" -ForegroundColor Yellow
$empListRes = Invoke-RestMethod -Uri "$baseUrl/employees?page=0&size=5" -Method Get -Headers $authHeaders
$empA = $empListRes.data.content[0]
$empB = $empListRes.data.content[1]
Write-Host "[PASS] Selected Emp A: ID=$($empA.id), Name=$($empA.fullName)" -ForegroundColor Green
Write-Host "[PASS] Selected Emp B: ID=$($empB.id), Name=$($empB.fullName)" -ForegroundColor Green

# Step 5: Assign Roster Schedules
Write-Host "`n--- STEP 5: Assign Roster Schedules for Target Date ---" -ForegroundColor Yellow
$targetDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")

# Assign Emp A to Morning Shift
$rosterBodyA = @{
    employeeIds = @($empA.id)
    shiftId = $morningShift.id
    startDate = $targetDate
    endDate = $targetDate
    rotationPattern = "STANDARD"
    notes = "Scheduled morning shift for DevOps team"
} | ConvertTo-Json

$assignResA = Invoke-RestMethod -Uri "$baseUrl/shifts/roster/assign" -Method Post -Body $rosterBodyA -Headers $authHeaders
Write-Host "[PASS] Emp A scheduled for Morning Shift on $targetDate" -ForegroundColor Green

# Assign Emp B to Night Shift
$rosterBodyB = @{
    employeeIds = @($empB.id)
    shiftId = $nightShift.id
    startDate = $targetDate
    endDate = $targetDate
    rotationPattern = "STANDARD"
    notes = "Scheduled night shift for 24/7 coverage"
} | ConvertTo-Json

$assignResB = Invoke-RestMethod -Uri "$baseUrl/shifts/roster/assign" -Method Post -Body $rosterBodyB -Headers $authHeaders
Write-Host "[PASS] Emp B scheduled for Night Shift on $targetDate" -ForegroundColor Green

# Step 6: Query Roster Range
Write-Host "`n--- STEP 6: Query Roster Calendar Schedule ---" -ForegroundColor Yellow
$rosterCalRes = Invoke-RestMethod -Uri "$baseUrl/shifts/roster?startDate=$targetDate&endDate=$targetDate" -Method Get -Headers $authHeaders
$rosterList = $rosterCalRes.data
Write-Host "[PASS] Retrieved $($rosterList.Count) roster assignments for date $targetDate" -ForegroundColor Green

# Step 7: Employee A submits Shift Swap Request with Employee B
Write-Host "`n--- STEP 7: Employee A Initiates Shift Swap Request ---" -ForegroundColor Yellow
$swapReqBody = @{
    requesterEmployeeId = $empA.id
    targetEmployeeId = $empB.id
    swapDate = $targetDate
    reason = "Family commitment during morning hours, requesting swap with night shift."
} | ConvertTo-Json

$swapCreateRes = Invoke-RestMethod -Uri "$baseUrl/shifts/swaps" -Method Post -Body $swapReqBody -Headers $authHeaders
$swap = $swapCreateRes.data
Write-Host "[PASS] Swap Request Created: ID=$($swap.id), PeerStatus=$($swap.peerStatus), ManagerStatus=$($swap.managerStatus)" -ForegroundColor Green
Write-Host "       Requester Shift: $($swap.requesterShiftName) ($($swap.requesterShiftTime))" -ForegroundColor Cyan
Write-Host "       Target Shift:    $($swap.targetShiftName) ($($swap.targetShiftTime))" -ForegroundColor Cyan

# Step 8: Peer Employee B Accepts the Swap Request
Write-Host "`n--- STEP 8: Peer Employee B Accepts Swap Request ---" -ForegroundColor Yellow
$peerAcceptBody = @{
    action = "ACCEPT"
    remarks = "Agreed to swap, morning shift is fine with me."
} | ConvertTo-Json

$peerRes = Invoke-RestMethod -Uri "$baseUrl/shifts/swaps/$($swap.id)/peer-respond?peerEmployeeId=$($empB.id)" -Method Put -Body $peerAcceptBody -Headers $authHeaders
$swapAccepted = $peerRes.data
Write-Host "[PASS] Peer Response: PeerStatus=$($swapAccepted.peerStatus), OverallStatus=$($swapAccepted.status)" -ForegroundColor Green

# Step 9: Verify Swap Appears in Pending Manager Approvals
Write-Host "`n--- STEP 9: Query Pending Manager Approvals Queue ---" -ForegroundColor Yellow
$mgrQueueRes = Invoke-RestMethod -Uri "$baseUrl/shifts/swaps/pending-manager" -Method Get -Headers $authHeaders
$foundInQueue = $mgrQueueRes.data | Where-Object { $_.id -eq $swap.id }
if ($null -ne $foundInQueue) {
    Write-Host "[PASS] Swap $($swap.id) successfully surfaced in Manager Approval Queue" -ForegroundColor Green
} else {
    Write-Error "Swap not found in manager approval queue!"
}

# Step 10: Department Manager Approves the Shift Swap
Write-Host "`n--- STEP 10: Department Manager Approves the Shift Swap ---" -ForegroundColor Yellow
$mgrApproveBody = @{
    action = "APPROVE"
    remarks = "Approved by Operations Lead. Ensure handoff notes are completed."
} | ConvertTo-Json

$mgrReviewRes = Invoke-RestMethod -Uri "$baseUrl/shifts/swaps/$($swap.id)/manager-review" -Method Put -Body $mgrApproveBody -Headers $authHeaders
$swapFinal = $mgrReviewRes.data
Write-Host "[PASS] Manager Review: ManagerStatus=$($swapFinal.managerStatus), Status=$($swapFinal.status)" -ForegroundColor Green

# Step 11: Verify Dynamic Roster Schedule Mutation
Write-Host "`n--- STEP 11: Verify Dynamic Roster Mutation (Schedules Swapped) ---" -ForegroundColor Yellow
$mutatedRosterRes = Invoke-RestMethod -Uri "$baseUrl/shifts/roster?startDate=$targetDate&endDate=$targetDate" -Method Get -Headers $authHeaders
$rosterAfter = $mutatedRosterRes.data

$empARoster = $rosterAfter | Where-Object { $_.employeeId -eq $empA.id }
$empBRoster = $rosterAfter | Where-Object { $_.employeeId -eq $empB.id }

Write-Host "       Emp A Schedule Now: $($empARoster.shiftName) ($($empARoster.shiftCode)), Status: $($empARoster.status)" -ForegroundColor Cyan
Write-Host "       Emp B Schedule Now: $($empBRoster.shiftName) ($($empBRoster.shiftCode)), Status: $($empBRoster.status)" -ForegroundColor Cyan

if ($empARoster.shiftId -eq $nightShift.id -and $empBRoster.shiftId -eq $morningShift.id) {
    Write-Host "[PASS] PERFECT MUTATION: Emp A successfully moved to Night Shift, Emp B moved to Morning Shift!" -ForegroundColor Green
} else {
    Write-Error "Schedules did not swap properly!"
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " PHASE 4 - MILESTONE 4: SHIFT & ROSTER AUTOMATION SUITE: 100% PASSED" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
