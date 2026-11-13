# 티켓레이더 웹 (`web/`)

담당: 웹 담당(Opus 1 역할). 스택: Vite 8 + React 19 + TypeScript 7 (AID-20261028-ASTRA-003 결정).

## 실행

```bash
npm install
npm run dev            # 시연 데이터 모드 (API 미연결) → http://localhost:5173
# Sol 서버 연결: 먼저 cd ../server && npm start (127.0.0.1:3001, CORS 허용 출처는 :5173)
VITE_API_BASE_URL=http://127.0.0.1:3001 npx vite --host 127.0.0.1 --port 5173
npm test               # 단위·컴포넌트 테스트 (Vitest + Testing Library)
npm run typecheck      # tsc -b
npm run build
npm run e2e            # Playwright: Chrome(설치본)·WebKit·Firefox 화면 흐름 + 스크린샷
```

실패 화면 확인: `http://localhost:5173/?demoFail=checks` (`events`, `context`, `checks` 중 첫 요청 1회 실패).

## 사용자 흐름

공연 선택 → 판매글 입력(예시 판매글 버튼은 시연 모드에서만) → 추출값 확인·수정 → 공식 자료 대조 결과.
각 결과 항목은 **판매글 원문 문구 · 공식 안내 문구 · 공식 근거 링크 · 확인 시각 · 이유**를 함께 보여줍니다.

## 구조와 구현 이유

| 경로 | 역할 | 이유 |
| --- | --- | --- |
| `src/contract/types.ts` | Sol 공통 계약 `@ticket-radar/shared` v0.1.0 재노출 + 하위 타입 별칭 | 계약 필드를 웹에서 새로 정의하지 않는다. `package.json`의 `file:../shared` 의존성으로 읽는다 |
| `src/api/client.ts` | `TicketRadarApi` 인터페이스, `ApiError` | 화면은 데이터 출처(시연/실제)를 몰라도 된다 |
| `src/api/httpApi.ts` | 실제 API 어댑터 | 타임아웃·네트워크·형식 오류를 `{code,message,retryable}`로 통일. 형식이 다른 응답은 성공으로 보여주지 않는다 |
| `src/contract/validate.ts` | Sol Zod 스키마 검증 + 요청 대조 | 스키마 외에 인용이 보낸 판매글의 실제 구간인지, 적용값이 보낸 확인값과 같은지 확인한다 |
| `src/api/demoApi.ts` | 시연 API | 미리 준비한 응답을 **찾아서 돌려주기만** 한다. 가격·규정 판단을 하지 않는다 |
| `src/demo/fixtures.ts` | 합성 공연·판매글·결과 | 차액·비율·충돌 결과도 미리 적어 둔 값이다. 웹 전용 판단 규칙을 만들지 않기 위해서다 |
| `src/components/*` | 단계별 화면 | 로딩·입력 오류·확인 불가·API 실패·재시도 상태를 각 단계에 둔다 |
| `src/App.tsx` | 단계 상태 관리 | 판매글이 바뀌면 이전 결과를 버리고, 추출값이 바뀌면 이전 결과를 “수정 전 값 기준”으로 흐리게 표시한다(T05) |
| `src/ui/format.ts` | 화면 문구·숫자/시각 형식 | 진위·입장·위법을 확정하는 표현을 쓰지 않도록 문구를 한곳에 모았다 |

- 시연 데이터는 상단 배너, 각 카드의 “시연 데이터” 배지, “공식 근거 (시연용 예시 링크)” 문구로 실제 데이터와 구분합니다. 시연 링크는 `example.com`입니다.
- 시연 모드에서 직접 입력한 판매글은 추출 결과를 지어내지 않고 모든 값을 “확인 불가”로 둡니다. 준비되지 않은 수정값 조합은 “가격 비교 보류”로 표시합니다.
- 판매글은 React 텍스트로만 렌더링합니다. `dangerouslySetInnerHTML`을 쓰지 않는다(T07).

## 실서버 요청 흐름 (WEB-005)

1. 추출: `{eventId, listingText, syntheticListing}` → AI 미설정이면 503 `AI_NOT_CONFIGURED` 오류 표시(성공 결과 없음).
2. 추출 후 수정: `previousCheckId` + 12개 확인값 **전체 스냅샷**으로 재대조. 409 `CHECK_EXPIRED_OR_MISMATCH`면 다시 추출하라고 안내.
3. 직접 입력: 사용자가 버튼을 눌렀을 때만 `extractionMode:'manual'` + 확인값. 자동 전환하지 않는다.
4. 가격 비교 조건(공연 일치·가격 기준·수수료·할인·예매 유형·관람자=예매자)은 모두 “확인 불가”에서 시작하고 자동으로 채우지 않습니다.
5. 공식 근거 링크 문구는 결과의 `isDemo`가 아니라 공식 자료 출처 유형(`officialSourceType`/`sourceType`)으로 정합니다. 날짜만 있는 확인일에 시각을 붙이지 않습니다.

## AI 실패와 직접 입력 (WEB-005)

- 추출 실패(`AI_NOT_CONFIGURED`, 시간 초과, 잘못된 응답)는 시연 결과로 대체하지 않습니다. 오류·재시도와 **“AI 추출 없이 직접 입력”** 버튼만 제공합니다.
- 3단계 상단에 추출 방식(`AI 모델` / `시연 fixture 조회 · AI 호출 없음` / `직접 입력`)을 표시합니다. 필드 `extraction`은 웹 제안입니다.
- 연결 방식(`demo`/`http`)과 결과의 시연 여부(`isDemo`/`dataMode`)는 별개다. HTTP에 연결돼도 결과별 배지를 따릅니다.

## 소개 랜딩과 효과 (WEB-008, 사용자 결정)

- 메인은 스크롤 몰입형 서비스 소개(`src/components/Landing.tsx`): 질문 히어로 → 판매글 문구가 스크롤에 따라 강조 → 공식 안내와 나란히(연결선·판정 칩·차액) → 3단계(진행선) → 결과 미리보기 → 판단하지 않는 것 → "서비스 체험하러 가기". 예시 문구는 모두 가상 공연 fixture 값이며 화면에 "가상 공연 예시"로 표시한다.
- `src/ui/useScrollEffects.ts`: `[data-reveal]`은 IntersectionObserver로 등장, `[data-scrub]`은 섹션 통과 정도를 `--p`(0~1)로 CSS에 넘긴다. 모션 축소·미지원 환경에서는 `.fx`를 붙이지 않아 모든 내용이 정지 상태로 보입니다.
- 서비스 화면 효과: 스크롤 시 유리 헤더, 단계 진입 등장(`key={step}`), 진행 단계 미끄러지는 표시, 스켈레톤 로딩, 결과 금액 카드·확인할 점 순차 등장, 선택 링 파동, details 부드러운 열림(지원 브라우저), 흐르는 그라디언트 CTA. 숫자 카운트업·가짜 진행률·입력 차단 효과는 넣지 않습니다.

## 테스트·화면 증거

- `src/App.test.tsx`, `src/api/httpApi.test.ts`: SPEC T01~T07 관련 사례, 금지 표현 검사(판매글 인용 제외).
- `src/contract/validate.test.ts`: Sol `shared/examples` 실제 예시와 웹 시연 응답 전부 통과 + 잘못된 응답 거부.
- `e2e/server.spec.ts`: **Sol 실제 서버(AI 미설정)** 에 연결해 공식 자료 조회 → AI_NOT_CONFIGURED → 직접 입력 → 조건 누락 보류 → 비교(근거·출처·확인일) → 수정 재대조 → 회차·공연 불일치 보류. Chrome·WebKit(iPhone 14). 녹화 `evidence/videos/`. 실제 AI 추출은 검증하지 않았습니다.
- `e2e/landing.spec.ts`: 실제 스크롤로 `--p` 진행·강조·연결선·헤더 전환 확인, 모션 축소에서 전부 표시·애니메이션 없음. 화면 `evidence/screens/landing/`.
- `e2e/flow.spec.ts`: 브라우저 5종 구성(Chrome 데스크톱/모바일, WebKit iPhone/iPad, Firefox)에서 흐름 + 가로 스크롤 없음 확인.
- 스크린샷: `evidence/screens/<프로젝트>/`. Playwright 자동 실행 결과이며 실기기 화면이 아닙니다.

## 공개 시연 배포 · 2026-11-02

주소: https://ticketradar.daoule-6b5.workers.dev

Cloudflare Workers Static Assets에 web/dist만 배포했습니다. API/실제 AI는 미배포이며 현재는 fixture-demo다. 판매글을 AI가 실제 분석했다고 주장하지 않습니다. 친구 Pen 최신 앱 디자인의 웹 이식은 별도 남아 있습니다.

```sh
npm run deploy:demo
npm run verify:deployed -- https://ticketradar.daoule-6b5.workers.dev
```

Wrangler OAuth 로그인 필요. deploy:demo는 단위 테스트→API 주소를 비운 정적 빌드→배포 순서다. VITE_ 접두 환경변수는 공개 번들에 들어가므로 비밀 키를 넣지 않습니다. wrangler.jsonc에서 SPA fallback을 설정했습니다. Git 연동/자동 CI·도메인 구매·기존 다른 서비스 변경은 하지 않았습니다.

배포 버전·공개 동작 검증: evidence/deployment/.
