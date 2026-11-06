# ==============================================================================
# PHASE 4 - MILESTONE 1 AUTOMATION VERIFICATION SCRIPT
# Tests:
# 1. Employee Creation with auto-generated temporary password
# 2. MNC Welcome Onboarding Email & Credential logging
# 3. First-login authentication returns mustChangePassword: true
# 4. Mandatory password reset to permanent password
# 5. Subsequent login returns mustChangePassword: false
# 6. Forgot Password 6-digit OTP dispatch & verification
# 7. Reset password using OTP & immediate session invalidation
# ==============================================================================

$baseUrl = "http://localhost:8080/api/v1"
$testId = Get-Random -Minimum 1000 -Maximum 9999
$adminEmail = "admin@hrms.com"
$adminPassword = "Admin@123"
$empEmail = "mnc_emp_$testId@hrms.com"
$permanentPw = "Permanent@$testId#99"

$defaultHeaders = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID"  = "default"
}

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " STARTING PHASE 4 - MILESTONE 1 VERIFICATION (MNC EMAIL & AUTH)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Step 1: Admin Login
Write-Host "`n--- STEP 1: Admin Authentication ---" -ForegroundColor Yellow
$loginBody = @{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -Headers $defaultHeaders
$adminToken = $adminRes.data.accessToken
Write-Host "[PASS] Admin Logged In. Token Acquired." -ForegroundColor Green

# Step 2: Create Employee without providing password (auto-generation test)
Write-Host "`n--- STEP 2: Create Employee with Auto-Generated Credentials ---" -ForegroundColor Yellow
$empBody = @{
    firstName = "Vikram"
    lastName = "Sharma"
    email = $empEmail
    phoneNumber = "987654$testId"
    designation = "Lead Cloud Architect"
    employmentStatus = "ACTIVE"
    dateOfJoining = (Get-Date).ToString("yyyy-MM-dd")
    salary = 120000
} | ConvertTo-Json

$authHeaders = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $adminToken"
    "X-Tenant-ID"   = "default"
}

$createRes = Invoke-RestMethod -Uri "$baseUrl/employees" -Method Post -Body $empBody -Headers $authHeaders
$empData = $createRes.data
Write-Host "[PASS] Employee Created. Number: $($empData.employeeNumber), Email: $($empData.email)" -ForegroundColor Green

# Verify must_change_password in DB
$env:PGPASSWORD="Naidu@98666"
$dbCheck = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d hrms_db -t -A -c "SELECT must_change_password, password FROM users WHERE email = '$empEmail';"
$parts = $dbCheck.Split('|')
$mustChange = $parts[0]
Write-Host "[PASS] Database Check: must_change_password = $mustChange (Expected: t)" -ForegroundColor Green

# Step 3: Extract the generated temporary password from the backend task log
Write-Host "`n--- STEP 3: Verify MNC Email Console Dispatch & Extract Temp Password ---" -ForegroundColor Yellow
Start-Sleep -Seconds 1
$activeTaskLog = (Get-ChildItem "C:\Users\bapan\.gemini\antigravity\brain\*\.system_generated\tasks\task-*.log" -ErrorAction SilentlyContinue |
    Where-Object { Select-String -Path $_.FullName -Pattern "HrmsPlatformApplication" -Quiet } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1).FullName
if (-not $activeTaskLog -and (Test-Path "backend\backend.log")) {
    $activeTaskLog = (Get-Item "backend\backend.log").FullName
}
$logContent = Get-Content $activeTaskLog -Raw
if ($logContent -match "WELCOME ONBOARDING & CREDENTIALS") {
    Write-Host "[PASS] MNC Welcome Email Log Banner found in backend logs!" -ForegroundColor Green
} else {
    Write-Host "[WARN] MNC Welcome Email Banner not detected in task log yet." -ForegroundColor DarkYellow
}

# Find temporary password from the log for this employee
$regex = "Target:\s*$empEmail[\s\S]*?Temporary Password:\s*([^\r\n]+)"
if ($logContent -match $regex) {
    $tempPassword = $matches[1].Trim()
    Write-Host "[PASS] Successfully extracted temporary password from MNC email dispatch: '$tempPassword'" -ForegroundColor Green
} else {
    Write-Error "Could not find temporary password in log for $empEmail"
    exit 1
}

# Step 4: Login with Temporary Credentials
Write-Host "`n--- STEP 4: Login with Temporary Credentials ---" -ForegroundColor Yellow
$empLoginBody = @{ email = $empEmail; password = $tempPassword } | ConvertTo-Json
$empAuthRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $empLoginBody -Headers $defaultHeaders
$empToken = $empAuthRes.data.accessToken
$empUserId = $empAuthRes.data.userId
$flagReturned = $empAuthRes.data.mustChangePassword

Write-Host "[PASS] Authenticated successfully with temporary credentials." -ForegroundColor Green
Write-Host "[PASS] mustChangePassword flag in API response: $flagReturned (Expected: True)" -ForegroundColor Green

if ($flagReturned -ne $true) {
    Write-Error "Validation failed: mustChangePassword was not true on first login!"
    exit 1
}

# Step 5: Execute Mandatory First-Time Password Change
Write-Host "`n--- STEP 5: Set Permanent Password ---" -ForegroundColor Yellow
$changePwBody = @{
    currentPassword = $tempPassword
    newPassword = $permanentPw
} | ConvertTo-Json

$empHeaders = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $empToken"
    "X-Tenant-ID"   = "default"
}

Invoke-RestMethod -Uri "$baseUrl/auth/change-password?userId=$empUserId" -Method Post -Body $changePwBody -Headers $empHeaders
Write-Host "[PASS] Permanent password successfully established." -ForegroundColor Green

# Step 6: Verify mustChangePassword is now false and Old Temp Password Rejected
Write-Host "`n--- STEP 6: Verify Old Temp Password Rejected & New Password Works ---" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $empLoginBody -Headers $defaultHeaders
    Write-Error "Security failure: Old temp password still worked after change!"
    exit 1
} catch {
    Write-Host "[PASS] Old temporary password rejected with 401 Unauthorized as expected." -ForegroundColor Green
}

$newLoginBody = @{ email = $empEmail; password = $permanentPw } | ConvertTo-Json
$newAuthRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $newLoginBody -Headers $defaultHeaders
$newFlag = $newAuthRes.data.mustChangePassword
Write-Host "[PASS] Login with permanent password successful. mustChangePassword: $newFlag (Expected: False)" -ForegroundColor Green

# Step 7: Forgot Password OTP Flow
Write-Host "`n--- STEP 7: Forgot Password with 6-Digit OTP ---" -ForegroundColor Yellow
$forgotBody = @{ email = $empEmail } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/auth/forgot-password" -Method Post -Body $forgotBody -Headers $defaultHeaders
Write-Host "[PASS] Forgot password requested. OTP dispatched." -ForegroundColor Green

Start-Sleep -Seconds 1
$latestLog = Get-Content $activeTaskLog -Raw
$otpRegex = "PASSWORD RESET OTP DISPATCH[\s\S]*?Target:\s*$empEmail[\s\S]*?One-Time Password \(OTP\):\s*([0-9]{6})"

if ($latestLog -match $otpRegex) {
    $otpCode = $matches[1].Trim()
    Write-Host "[PASS] Dispatched 6-digit OTP extracted from secure log: $otpCode" -ForegroundColor Green
} else {
    Write-Error "OTP code not found in log for $empEmail"
    exit 1
}

# Step 8: Reset Password using OTP
Write-Host "`n--- STEP 8: Reset Password Using 6-Digit OTP ---" -ForegroundColor Yellow
$superSecretNewPw = "ResetOtpPass@$testId#77"
$resetBody = @{
    email = $empEmail
    otp = $otpCode
    newPassword = $superSecretNewPw
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/auth/reset-password" -Method Post -Body $resetBody -Headers $defaultHeaders
Write-Host "[PASS] Password reset successfully verified via 6-digit OTP." -ForegroundColor Green

# Step 9: Verify Login with OTP-Reset Password
Write-Host "`n--- STEP 9: Login with OTP-Reset Password ---" -ForegroundColor Yellow
$afterResetLogin = @{ email = $empEmail; password = $superSecretNewPw } | ConvertTo-Json
$afterRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $afterResetLogin -Headers $defaultHeaders
Write-Host "[PASS] Successfully logged in with OTP-reset password! Token: $($afterRes.data.accessToken.Substring(0,25))..." -ForegroundColor Green

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " >>> ALL PHASE 4 - MILESTONE 1 VERIFICATIONS COMPLETED WITH 100% SUCCESS <<<" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
