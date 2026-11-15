import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './e2e', testMatch: 'isolated-cross-trade.spec.ts', use: { browserName: 'webkit', headless: true }, timeout: 30000, workers: 1, reporter: 'list' })
