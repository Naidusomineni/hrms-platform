# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login page >> renders login form and shows validation errors
- Location: e2e\login.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /welcome back/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /welcome back/i })

```

```yaml
- banner:
  - img "Eoxys Systems India Pvt Ltd"
  - text: "Eoxys Systems India Pvt Ltd https://www.eoxys.com Portal Tenant:"
  - strong: DEFAULT
- main:
  - heading "Sign In" [level=1]
  - paragraph: Enter your corporate credentials to access your workspace.
  - text: Work Email Address *
  - textbox "name@company.com"
  - text: Password *
  - link "Forgot password?":
    - /url: /forgot-password
  - textbox "Enter your account password"
  - button "Show password":
    - img
  - text: Attendance Check-In Mode
  - button "Office (Campus)":
    - img
    - text: Office (Campus)
  - button "Remote / WFH":
    - img
    - text: Remote / WFH
  - checkbox "Remember this device for 30 days"
  - text: Remember this device for 30 days
  - button "Sign In to Workspace"
  - paragraph: Quick Role Switcher
  - button "Admin"
  - button "HR Ops"
  - button "Manager"
  - button "Employee"
- contentinfo:
  - img
  - text: SOC-2 Type II • 256-Bit TLS • ISO 27001 Certified
  - paragraph: Enterprise Human Resource Management System © 2026
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Login page', () => {
  4  |   test('renders login form and shows validation errors', async ({ page }) => {
  5  |     await page.goto('/login')
  6  | 
> 7  |     await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
     |                                                                        ^ Error: expect(locator).toBeVisible() failed
  8  |     await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
  9  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  10 |     await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  11 | 
  12 |     await page.getByRole('button', { name: /sign in/i }).click()
  13 |     await expect(page.getByText(/email is required|password is required/i)).toBeVisible()
  14 |   })
  15 | 
  16 |   test('submits demo credentials and navigates to dashboard', async ({ page }) => {
  17 |     await page.route('**/v1/auth/login', async route => {
  18 |       await route.fulfill({
  19 |         status: 200,
  20 |         contentType: 'application/json',
  21 |         body: JSON.stringify({
  22 |           data: {
  23 |             accessToken: 'fake-access-token',
  24 |             refreshToken: 'fake-refresh-token',
  25 |             userId: 1,
  26 |             email: 'admin@hrms.com',
  27 |             fullName: 'Admin User',
  28 |             role: 'ROLE_ADMIN',
  29 |             emailVerified: true,
  30 |             profilePicture: ''
  31 |           }
  32 |         })
  33 |       })
  34 |     })
  35 | 
  36 |     await page.goto('/login')
  37 |     await page.getByPlaceholder('you@company.com').fill('admin@hrms.com')
  38 |     await page.getByPlaceholder('••••••••').fill('Admin@123')
  39 |     await page.getByRole('button', { name: /sign in/i }).click()
  40 | 
  41 |     await expect(page).toHaveURL(/dashboard/)
  42 |     await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  43 |     await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBe('fake-access-token')
  44 |   })
  45 | })
  46 | 
```