# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login page >> submits demo credentials and navigates to dashboard
- Location: e2e\login.spec.js:16:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('you@company.com')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img "Eoxys Systems India Pvt Ltd" [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]: Eoxys Systems India Pvt Ltd
        - generic [ref=e9]: https://www.eoxys.com Portal
    - generic [ref=e12]:
      - text: "Tenant:"
      - strong [ref=e13]: DEFAULT
  - main [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]:
        - heading "Sign In" [level=1] [ref=e17]
        - paragraph [ref=e18]: Enter your corporate credentials to access your workspace.
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Work Email Address *
          - textbox "name@company.com" [active] [ref=e22]
        - generic [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]: Password *
            - link "Forgot password?" [ref=e26] [cursor=pointer]:
              - /url: /forgot-password
          - generic [ref=e27]:
            - textbox "Enter your account password" [ref=e28]
            - button "Show password" [ref=e29] [cursor=pointer]:
              - img [ref=e30]
        - generic [ref=e33]:
          - generic [ref=e34]: Attendance Check-In Mode
          - generic [ref=e35]:
            - button "Office (Campus)" [ref=e36] [cursor=pointer]:
              - img [ref=e37]
              - text: Office (Campus)
            - button "Remote / WFH" [ref=e41] [cursor=pointer]:
              - img [ref=e42]
              - text: Remote / WFH
        - generic [ref=e45] [cursor=pointer]:
          - checkbox "Remember this device for 30 days" [ref=e46]
          - text: Remember this device for 30 days
        - button "Sign In to Workspace" [ref=e47] [cursor=pointer]
      - generic [ref=e48]:
        - paragraph [ref=e49]: Quick Role Switcher
        - generic [ref=e50]:
          - button "Admin" [ref=e51] [cursor=pointer]
          - button "HR Ops" [ref=e52] [cursor=pointer]
          - button "Manager" [ref=e53] [cursor=pointer]
          - button "Employee" [ref=e54] [cursor=pointer]
  - contentinfo [ref=e55]:
    - generic [ref=e56]:
      - generic [ref=e57]:
        - img [ref=e58]
        - text: SOC-2 Type II
      - generic [ref=e61]: •
      - generic [ref=e62]: 256-Bit TLS
      - generic [ref=e63]: •
      - generic [ref=e64]: ISO 27001 Certified
    - paragraph [ref=e65]: Enterprise Human Resource Management System © 2026
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Login page', () => {
  4  |   test('renders login form and shows validation errors', async ({ page }) => {
  5  |     await page.goto('/login')
  6  | 
  7  |     await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
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
> 37 |     await page.getByPlaceholder('you@company.com').fill('admin@hrms.com')
     |                                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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