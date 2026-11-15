/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sol 공통 계약(../shared, file: 의존성)을 개발 서버가 읽을 수 있게 허용한다.
  server: {
    fs: { allow: ['.', '../shared'] },
    // 브라우저 시연의 Worker 경로를 로컬 공연 서버에 연결한다. 배포 Worker에는 영향 없음.
    proxy: {
      '/api/toss-test': {
        target: 'http://127.0.0.1:3019',
        rewrite: (path) => path.replace(/^\/api\/toss-test/, ''),
      },
      '/api/performances': {
        target: 'http://127.0.0.1:3001',
        rewrite: (path) => path.replace(/^\/api\/performances(?=\?|$)/, '/performances'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
