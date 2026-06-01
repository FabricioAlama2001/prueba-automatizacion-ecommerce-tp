import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: {
    timeout: 30_000,
  },

  fullyParallel: false,
  retries: 0,
  workers: 1,

  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    viewport: {
      width: 1920,
      height: 1080,
    },

    permissions: [],

    launchOptions: {
      args: [
        '--disable-notifications',
        '--disable-save-password-bubble',
        '--disable-infobars',
        '--disable-autofill',
        '--disable-features=AutofillServerCommunication,PasswordManagerEnableSaving,PasswordManagerOnboarding,OptimizationHints',
        '--password-store=basic',
        '--use-mock-keychain',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      },
    },
  ],
});