const { defineConfig, devices } = require('../frontend/node_modules/@playwright/test')
const path = require('node:path')

const auditDir = __dirname
const frontendDir = path.resolve(auditDir, '../frontend')

module.exports = defineConfig({
  testDir: path.join(frontendDir, 'e2e'),
  timeout: 30000,
  expect: { timeout: 5000 },
  outputDir: path.join(auditDir, 'playwright-test-results'),
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'https://127.0.0.1:4174',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure'
  }
})
