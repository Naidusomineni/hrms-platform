# ==============================================================================
# HRMS Enterprise Platform - Phase 6 QA Regression & Verification Suite
# Enterprise Operations, Expense Claims, Geo-Fencing, White-Labeling & 2FA TOTP
# ==============================================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api/v1"
$tenantId = "default"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 6 QA TEST SUITE] Enterprise Operations & Scale" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

function Assert-Step($desc, $cond) {
    if ($cond) {
        Write-Host " [PASS] $desc" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $desc" -ForegroundColor Red
        exit 1
    }
}

# ------------------------------------------------------------------------------
# 1. Admin Authentication
# ------------------------------------------------------------------------------
Write-Host "`n>>> 1. Authenticating as Admin..." -ForegroundColor Yellow
$loginPayload = @{
    email = "admin@hrms.com"
    password = "Admin@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPayload -ContentType "application/json" -Headers @{"X-Tenant-ID" = $tenantId}
$token = $loginRes.data.accessToken
$adminUserId = $loginRes.data.userId

Assert-Step "Admin authenticated with JWT access token" ($token -ne $null -and $token.Length -gt 20)
Assert-Step "User tenant correctly resolved as $tenantId" ($loginRes.data.tenantId -eq $tenantId)

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}

# ------------------------------------------------------------------------------
# 2. Two-Factor Authentication (2FA / TOTP) Setup
# ------------------------------------------------------------------------------
Write-Host "`n>>> 2. Initializing 2FA TOTP Setup..." -ForegroundColor Yellow
$setup2fa = Invoke-RestMethod -Uri "$baseUrl/auth/2fa/setup?userId=$adminUserId" -Method Post -Headers $headers
Assert-Step "2FA secret key generated" ($setup2fa.data.secret -ne $null -and $setup2fa.data.secret.Length -gt 10)
Assert-Step "RFC 6238 otpauth:// QR URI generated" ($setup2fa.data.qrCodeUri.StartsWith("otpauth://totp/"))

# ------------------------------------------------------------------------------
# 3. Tenant Dynamic White-Labeling & Branding
# ------------------------------------------------------------------------------
Write-Host "`n>>> 3. Updating Tenant Corporate Branding..." -ForegroundColor Yellow
$brandUpdate = Invoke-RestMethod -Uri "$baseUrl/tenants/$tenantId/branding?name=Acme%20Corporation%20Global&primaryColor=%230f172a" -Method Put -Headers $headers
Assert-Step "Tenant brand name updated to Acme Corporation Global" ($brandUpdate.data.name -eq "Acme Corporation Global")
Assert-Step "Tenant primary color updated to #0f172a" ($brandUpdate.data.primaryColor -eq "#0f172a")

# ------------------------------------------------------------------------------
# 4. Geo-Fenced Office Locations Verification
# ------------------------------------------------------------------------------
Write-Host "`n>>> 4. Verifying Geo-Fenced Office Locations..." -ForegroundColor Yellow
$locations = Invoke-RestMethod -Uri "$baseUrl/attendance/office-locations" -Method Get -Headers $headers
Assert-Step "Office location registry returns active corporate branches" ($locations.data.Count -gt 0)
Assert-Step "Office location has valid GPS latitude/longitude" ($locations.data[0].latitude -ne $null -and $locations.data[0].longitude -ne $null)

# ------------------------------------------------------------------------------
# 5. Fetch Target Employee for Expense Claim
# ------------------------------------------------------------------------------
Write-Host "`n>>> 5. Fetching Active Employee for Expense Claims..." -ForegroundColor Yellow
$empListRes = Invoke-RestMethod -Uri "$baseUrl/employees?size=5" -Method Get -Headers $headers
$targetEmp = $empListRes.data.content[0]
$targetEmpId = $targetEmp.id
Write-Host "    Selected Employee: $($targetEmp.firstName) $($targetEmp.lastName) (ID: $targetEmpId)" -ForegroundColor DarkGray

# ------------------------------------------------------------------------------
# 6. Submit New Corporate Expense Claim
# ------------------------------------------------------------------------------
Write-Host "`n>>> 6. Submitting Corporate Expense Claim..." -ForegroundColor Yellow
$expensePayload = @{
    category = "TRAVEL"
    title = "Client Quarterly Architecture Summit Cab Fare"
    description = "Cab fare for client site security and architectural review."
    amount = 1850.50
    expenseDate = (Get-Date).ToString("yyyy-MM-dd")
    receiptUrl = "https://storage.hrms.corp/receipts/cab_receipt_2026.pdf"
    receiptFilename = "cab_receipt_2026.pdf"
} | ConvertTo-Json

$submitRes = Invoke-RestMethod -Uri "$baseUrl/expenses/claims?employeeId=$targetEmpId" -Method Post -Body $expensePayload -ContentType "application/json" -Headers $headers
$claim = $submitRes.data
$claimId = $claim.id
$claimNumber = $claim.claimNumber

Assert-Step "Expense claim created with unique claim number $claimNumber" ($claimNumber.StartsWith("EXP-"))
Assert-Step "Expense claim initial status is SUBMITTED" ($claim.status -eq "SUBMITTED")
Assert-Step "Expense claim amount matches submitted amount" ([math]::Round($claim.amount, 2) -eq 1850.50)

# ------------------------------------------------------------------------------
# 7. Query Employee Expense Claims
# ------------------------------------------------------------------------------
Write-Host "`n>>> 7. Querying Employee Claims..." -ForegroundColor Yellow
$myClaims = Invoke-RestMethod -Uri "$baseUrl/expenses/claims/my?employeeId=$targetEmpId" -Method Get -Headers $headers
Assert-Step "Employee claims list contains submitted claim" ($myClaims.data.content.Count -gt 0)

# ------------------------------------------------------------------------------
# 8. Stage 1: Manager Review (Approve)
# ------------------------------------------------------------------------------
Write-Host "`n>>> 8. Executing Stage 1: Manager Approval..." -ForegroundColor Yellow
$managerReviewPayload = @{
    action = "APPROVE"
    remarks = "Travel confirmed and approved for client architecture summit."
} | ConvertTo-Json

$mgrRes = Invoke-RestMethod -Uri "$baseUrl/expenses/claims/$claimId/manager-review" -Method Put -Body $managerReviewPayload -ContentType "application/json" -Headers $headers
Assert-Step "Claim advanced to MANAGER_APPROVED state" ($mgrRes.data.status -eq "MANAGER_APPROVED")
Assert-Step "Manager audit remarks preserved" ($mgrRes.data.managerRemarks -like "*Travel confirmed*")

# ------------------------------------------------------------------------------
# 9. Stage 2: Finance Audit Review (Approve)
# ------------------------------------------------------------------------------
Write-Host "`n>>> 9. Executing Stage 2: Finance Department Approval..." -ForegroundColor Yellow
$financeReviewPayload = @{
    action = "APPROVE"
    remarks = "Valid tax invoice verified. Approved for monthly payroll reimbursement."
} | ConvertTo-Json

$finRes = Invoke-RestMethod -Uri "$baseUrl/expenses/claims/$claimId/finance-review" -Method Put -Body $financeReviewPayload -ContentType "application/json" -Headers $headers
Assert-Step "Claim advanced to FINANCE_APPROVED state" ($finRes.data.status -eq "FINANCE_APPROVED")
Assert-Step "Finance audit remarks preserved" ($finRes.data.financeRemarks -like "*Valid tax invoice*")

# ------------------------------------------------------------------------------
# 10. Auto-Sync & Disbursement with Payroll 2.0
# ------------------------------------------------------------------------------
Write-Host "`n>>> 10. Auto-Syncing Reimbursements into Monthly Payroll 2.0..." -ForegroundColor Yellow
# Using month 11 (November 2026)
$payrollRes = Invoke-RestMethod -Uri "$baseUrl/payroll/process?employeeId=$targetEmpId&month=11&year=2026" -Method Post -Headers $headers
$slip = $payrollRes.data

Assert-Step "Payroll processed successfully for employee" ($slip.id -ne $null)
Assert-Step "Reimbursements attached to payroll slip" ($slip.reimbursements -ne $null -and $slip.reimbursements -gt 0)

# Verify that the expense claim is now marked DISBURSED
$updatedClaim = Invoke-RestMethod -Uri "$baseUrl/expenses/claims/$claimId" -Method Get -Headers $headers
Assert-Step "Expense claim automatically transitioned to DISBURSED" ($updatedClaim.data.status -eq "DISBURSED")
Assert-Step "Expense claim linked to payroll slip #$($slip.id)" ($updatedClaim.data.payrollSlipId -eq $slip.id)

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host " [ALL 10 VERIFICATION CHECKS PASSED 100%] Phase 6 Certified!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
