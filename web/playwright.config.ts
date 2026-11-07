import { defineConfig, devices } from '@playwright/test'

// 실제 브라우저 화면 확인용. 스크린샷은 web/evidence/screens/ 에 저장한다.
// chrome 은 이 Mac 에 설치된 Google Chrome, webkit·firefox 는 Playwright 가 받은 브라우저 엔진이다.
// 5179: 시연 데이터 모드(fixture). 5173: Sol 실제 서버(../server, 127.0.0.1:3001) 연결 모드.
// Sol 서버의 CORS 허용 출처가 http://127.0.0.1:5173 이므로 실서버 모드는 이 주소로 연다.
const DEMO = 'http://127.0.0.1:5179'
const LIVE = 'http://127.0.0.1:5173'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  reporter: [['list']],
  webServer: [
    {
      command: 'npx vite --host 127.0.0.1 --port 5179 --strictPort',
      url: DEMO,
      reuseExistingServer: true,
      env: { VITE_API_BASE_URL: '' },
    },
    {
      // Sol 소유 서버를 수정 없이 실행만 한다 (AI 미설정 기본값).
      command: 'npm start',
      cwd: '../server',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: true,
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 5173 --strictPort',
      url: LIVE,
      reuseExistingServer: true,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:3001' },
    },
  ],
  projects: [
    ...[
      { name: 'chrome-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 900 } } },
      { name: 'chrome-mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
      { name: 'webkit-iphone', use: { ...devices['iPhone 14'] } },
      { name: 'webkit-ipad', use: { ...devices['iPad (gen 7)'] } },
      { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 900 } } },
    ].map((p) => ({ ...p, testIgnore: /server\.spec/, use: { ...p.use, baseURL: DEMO } })),
    // 실서버는 IP당 검사 30회/분 제한이 있어 두 구성만 순서대로 실행한다.
    {
      name: 'server-chrome',
      testMatch: /server\.spec/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 900 }, baseURL: LIVE, video: 'on' },
    },
    {
      name: 'server-webkit-iphone',
      testMatch: /server\.spec/,
      dependencies: ['server-chrome'],
      use: { ...devices['iPhone 14'], baseURL: LIVE, video: 'on' },
    },
  ],
})
