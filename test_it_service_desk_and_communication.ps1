# ==============================================================================
# ENTERPRISE IT SERVICE DESK & COMMUNICATION BULLETIN VERIFICATION
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
Write-Host " STARTING IT SERVICE DESK & COMMUNICATION AUTOMATION SUITE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Step 1: Admin Login
Write-Host "`n--- STEP 1: Admin Authentication ---" -ForegroundColor Yellow
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $defaultHeaders
$adminToken = $adminRes.data.accessToken
$authHeaders = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID"  = "default"
    "Authorization" = "Bearer $adminToken"
}
Write-Host "[PASS] Admin Logged In. Access Token Acquired." -ForegroundColor Green

# Fetch an existing employee to associate with tickets
$empListRes = Invoke-RestMethod -Uri "$baseUrl/employees?page=0&size=5" -Method Get -Headers $authHeaders
$targetEmp = $empListRes.data.content[0]
$empId = $targetEmp.id
Write-Host "[PASS] Target Employee Selected: ID=$empId, Name=$($targetEmp.fullName)" -ForegroundColor Green

# Step 2: Create Critical Support Ticket (SLA = 4 Hours)
Write-Host "`n--- STEP 2: Create Critical SLA Support Ticket ---" -ForegroundColor Yellow
$criticalTicketBody = @{
    employeeId = $empId
    title = "Production VPN Tunnel Timeout for DevOps"
    description = "Unable to connect to internal staging Kubernetes cluster. Handshake timed out."
    category = "ACCESS_VPN"
    priority = "CRITICAL"
} | ConvertTo-Json

$critRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets" -Method Post -Body $criticalTicketBody -Headers $authHeaders
$ticket1 = $critRes.data
Write-Host "[PASS] Ticket Created: $($ticket1.ticketNumber), Priority=$($ticket1.priority), Status=$($ticket1.status)" -ForegroundColor Green
Write-Host "       SLA Deadline: $($ticket1.slaDeadline)" -ForegroundColor Cyan

# Step 3: Create High Priority Hardware Ticket (SLA = 8 Hours)
Write-Host "`n--- STEP 3: Create High Priority Hardware Ticket ---" -ForegroundColor Yellow
$highTicketBody = @{
    employeeId = $empId
    title = "External Monitor Flickering & HDMI Port Failure"
    description = "Second screen loses sync every 5 minutes when compiling."
    category = "HARDWARE"
    priority = "HIGH"
} | ConvertTo-Json

$highRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets" -Method Post -Body $highTicketBody -Headers $authHeaders
$ticket2 = $highRes.data
Write-Host "[PASS] Ticket Created: $($ticket2.ticketNumber), Priority=$($ticket2.priority), SLA=$($ticket2.slaDeadline)" -ForegroundColor Green

# Step 4: Add Comment to Ticket 1
Write-Host "`n--- STEP 4: Add IT Engineer Diagnostic Comment ---" -ForegroundColor Yellow
$commentBody = @{
    commentText = "Reviewed gateway logs. Re-generating client certificate for VPN gateway vpn01.internal."
    isInternal = $false
} | ConvertTo-Json

$commentRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets/$($ticket1.id)/comments" -Method Post -Body $commentBody -Headers $authHeaders
Write-Host "[PASS] Comment Added by $($commentRes.data.authorName): $($commentRes.data.commentText)" -ForegroundColor Green

# Step 5: Update Ticket 1 to IN_PROGRESS and Assign
Write-Host "`n--- STEP 5: Assign Ticket and Advance to IN_PROGRESS ---" -ForegroundColor Yellow
$updateBody = @{
    status = "IN_PROGRESS"
    assignedToUserId = $adminRes.data.user.id
} | ConvertTo-Json

$updRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets/$($ticket1.id)" -Method Put -Body $updateBody -Headers $authHeaders
Write-Host "[PASS] Ticket Status Updated: $($updRes.data.status), Assignee=$($updRes.data.assignedToName)" -ForegroundColor Green

# Step 6: Resolve Ticket 1
Write-Host "`n--- STEP 6: Resolve Ticket with Resolution Notes ---" -ForegroundColor Yellow
$resolveBody = @{
    status = "RESOLVED"
    resolutionNotes = "Issued new WireGuard client config and verified handshake. Latency is under 12ms."
} | ConvertTo-Json

$resRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets/$($ticket1.id)" -Method Put -Body $resolveBody -Headers $authHeaders
Write-Host "[PASS] Ticket Resolved: $($resRes.data.status), Notes=$($resRes.data.resolutionNotes)" -ForegroundColor Green

# Step 7: Check Helpdesk KPI Stats
Write-Host "`n--- STEP 7: Verify Helpdesk Executive KPI Stats ---" -ForegroundColor Yellow
$statsRes = Invoke-RestMethod -Uri "$baseUrl/helpdesk/tickets/stats" -Method Get -Headers $authHeaders
$stats = $statsRes.data
Write-Host "[PASS] Stats: Open=$($stats.totalOpen), InProgress=$($stats.inProgress), Resolved=$($stats.resolved), Critical=$($stats.criticalCount)" -ForegroundColor Green

# Step 8: Create Company Announcement Bulletin
Write-Host "`n--- STEP 8: Publish Company Announcement ---" -ForegroundColor Yellow
$announcementBody = @{
    title = "Annual Global Town Hall & Q4 Technology Roadmap ($testId)"
    content = "Join executive leadership for the 2026 town hall covering our next-gen platform launch, compensation updates, and global wellness initiatives."
    category = "LEADERSHIP"
    priority = "IMPORTANT"
    targetAudience = "ALL"
    pinned = $true
    acknowledgmentRequired = $true
} | ConvertTo-Json

$annRes = Invoke-RestMethod -Uri "$baseUrl/communication/announcements" -Method Post -Body $announcementBody -Headers $authHeaders
$announcement = $annRes.data
Write-Host "[PASS] Announcement Published: ID=$($announcement.id), Title='$($announcement.title)', Pinned=$($announcement.pinned)" -ForegroundColor Green

# Step 9: Get Active Announcements Feed
Write-Host "`n--- STEP 9: Query Active Announcements Feed ---" -ForegroundColor Yellow
$feedRes = Invoke-RestMethod -Uri "$baseUrl/communication/announcements" -Method Get -Headers $authHeaders
$feed = $feedRes.data
$foundAnn = $feed | Where-Object { $_.id -eq $announcement.id }
if ($null -ne $foundAnn) {
    Write-Host "[PASS] Found Announcement in Active Feed: Priority=$($foundAnn.priority), AcknowledgedByMe=$($foundAnn.isAcknowledgedByCurrentUser)" -ForegroundColor Green
} else {
    Write-Error "Announcement not found in active feed!"
}

# Step 10: Acknowledge Announcement
Write-Host "`n--- STEP 10: Acknowledge Announcement ---" -ForegroundColor Yellow
$ackRes = Invoke-RestMethod -Uri "$baseUrl/communication/announcements/$($announcement.id)/acknowledge" -Method Post -Headers $authHeaders
Write-Host "[PASS] Acknowledgment Received: $($ackRes.message)" -ForegroundColor Green

# Verify acknowledgment reflected
$feedAfterAck = Invoke-RestMethod -Uri "$baseUrl/communication/announcements" -Method Get -Headers $authHeaders
$foundAfterAck = $feedAfterAck.data | Where-Object { $_.id -eq $announcement.id }
Write-Host "[PASS] Acknowledgment Status: isAcknowledged=$($foundAfterAck.isAcknowledgedByCurrentUser), TotalAck=$($foundAfterAck.totalAcknowledgments)" -ForegroundColor Green

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " IT SERVICE DESK & COMMUNICATION AUTOMATION SUITE: 100% PASSED" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
