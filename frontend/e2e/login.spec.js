import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders login form and shows validation errors', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email is required|password is required/i)).toBeVisible()
  })

  test('submits demo credentials and navigates to dashboard', async ({ page }) => {
    await page.route('**/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            userId: 1,
            email: 'admin@hrms.com',
            fullName: 'Admin User',
            role: 'ROLE_ADMIN',
            emailVerified: true,
            profilePicture: ''
          }
        })
      })
    })

    await page.goto('/login')
    await page.getByPlaceholder('you@company.com').fill('admin@hrms.com')
    await page.getByPlaceholder('••••••••').fill('Admin@123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/dashboard/)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBe('fake-access-token')
  })
})
