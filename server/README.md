# Ticket Radar API · Sol / CORE-002

## 이메일 인증 시연 · 2026-11-06

Gmail SMTP를 사용하려면 서버 `.env`에 `EMAIL_PROVIDER=gmail`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`를 설정합니다. Google 2단계 인증을 사용하고 전용 앱 비밀번호를 직접 발급해 서버에만 입력합니다. SMTP는 `smtp.gmail.com:465`의 TLS를 사용합니다. 값이 없거나 선택한 공급자가 잘못되면 메일 미설정 오류를 반환하며 Resend로 자동 전환하지 않습니다. `EMAIL_PROVIDER`를 생략하면 기존 Resend 구성을 유지합니다. Gmail 연결·실제 수신은 별도로 확인해야 합니다.

서버 전용 `.env`에 `RESEND_API_KEY`와 `RESEND_FROM`을 설정합니다. 테스트 발신자는 `onboarding@resend.dev`이며 수신자 제한이 적용됩니다. 여러 수신자에게 보내려면 소유한 발신 도메인을 Resend에서 검증해야 합니다. 키를 채팅·앱 번들·저장소에 넣지 않습니다. 이미 실행 중인 서버는 설정/코드 변경이 자동 적용되지 않으며 재시작 시 기존 메모리 세션과 인증번호가 사라진다.

`POST /auth/email/send`에 `{email}`을 보내고, 받은 6자리 번호를 이메일 가입 요청 `{name,email,password,verificationCode}`에 포함합니다. 이메일 없는 기존 시연 계정은 기존 경로를 유지합니다. 인증번호는 서버 메모리에만 보관되며 10분 만료, 5회 시도 제한, 60초 재발송 제한입니다. 미설정·발송 실패 시 성공으로 대체하지 않습니다. 실제 발송과 수신은 아직 검증되지 않았으며 단일 프로세스 시연용입니다.

> 최신 인계: [SOL-005 이후 웹·앱 검증 절차](#sol-005-이후-웹앱-검증-인계). R1~R4는 Astra 독립 재검증 대기이며 추가 기능은 보류한다. 제품 AI 제공자·모델은 미정이다. 아래 선택형 AI 설정 예시는 현재 실행 지시가 아니다.

Node.js 24 이상(TypeScript 직접 실행), 공통 계약 `../shared/index.ts`를 사용합니다. UI·규칙·외부 추출을 분리했습니다.

```sh
cd /Users/daoule/Desktop/AID/shared
npm ci --ignore-scripts
cd ../server
npm ci --ignore-scripts
npm run typecheck
npm test
npm start
```

기본 주소 `http://127.0.0.1:3001`. 초기 설정은 AI 미설정입니다. `POST /checks` 기본 추출 요청은 503 AI_NOT_CONFIGURED를 반환하며 가짜 성공으로 바꾸지 않습니다. 공식 공연 조회와 명시적인 수동 입력은 동작합니다. 계약·전환 절차는 [shared 안내](../shared/README.md).

## 소스 역할

| 파일 | 책임 |
| --- | --- |
| src/catalog.ts | 검토된 공식 공지 JSON만 읽고 출처 버전·조건·범위를 연결 |
| data/akmu-price-evidence.json | 실제 공지에서 재확인한 가격 문장·출처·가격 확인일; 서비스 작성 설명과 분리 |
| src/extraction.ts | ExtractionProvider, 선택형 Ollama·Anthropic(Claude), 원문/값 근거 검증 |
| src/rules.ts | 확인값에 대한 가격 조건 검사·선예매 범위·근거 결과 |
| src/service.ts | 요청 검증·추출/수정 분리·오류·15분 재대조 메모리 |
| src/http.ts | 라우팅·본문 제한·JSON 오류·CORS·호출 제한 |
| src/main.ts | 환경변수와 서버 시작 |
| test/ | 규칙·스키마·추출 모의·실 로컬 HTTP 테스트 |

## AI 연결

기본 제공자는 선정되지 않았습니다. 이번 작업에서 제품 모델·유료 API를 호출하지 않습니다. `ExtractionProvider`를 새로 구현하면 교체 가능합니다. API 키는 서버 환경에만 두고 로그·클라이언트에 출력하지 않습니다.

준비된 Ollama 어댑터는 [공식 구조화 출력 문서](https://docs.ollama.com/capabilities/structured-outputs)에 따라 로컬 `/api/chat`에 JSON Schema와 `stream:false`를 전달합니다. 일반 구조화 응답 검증은 [Zod 문서](https://zod.dev/api)를 따릅니다. 이는 제공자 채택 결정이나 실제 모델 성능 검증이 아닙니다.

로컬 모델을 사용하기로 정하고 설치·가용성과 비용을 확인한 뒤 `.env.example`을 참고해 서버 `.env`에 설정합니다. `.env`는 Git 제외 대상입니다. 이 작업은 모델 다운로드·설치·선정을 하지 않았습니다.

```dotenv
EXTRACTION_PROVIDER=ollama
AI_MODEL=<확인한-로컬-모델>
OLLAMA_BASE_URL=http://127.0.0.1:11434
AI_TIMEOUT_MS=10000
```

어댑터는 루프백 주소만 허용하고 명시적인 `:cloud` 이름은 거부합니다. 로컬 서버에 다른 원격 모델 별칭을 설정한 경우까지 보증하지 않으므로 모델 선택 시 실제 실행 위치를 확인해야 합니다. 다른 제공자는 별도 어댑터와 검증이 필요합니다. 타임아웃/상위 오류/JSON 오류/원문 없는 값은 오류로 반환하고 자동 fixture·수동 성공 전환은 하지 않습니다.

### 클라우드 AI(Gemini) 연결 · 2026-11-03 사용자 지시 "우선 gemini 키로"

`GeminiProvider`(fetch, 새 의존성 없음)를 추가했습니다. 키는 `x-goog-api-key` 헤더로만 보내고 URL·로그·응답에 넣지 않습니다. 프롬프트는 Ollama·Claude와 같은 `extractionSystemPrompt`를 쓰고, 응답 JSON은 `validateGroundedExtraction`을 통과해야 합니다. 503·429는 짧게 기다렸다가 최대 2번 재시도하고(서비스 시간 제한 안에서), 그 밖의 오류는 바로 `AI_PROVIDER_ERROR`로 처리합니다. 안전·길이 중단과 JSON 아님은 `AI_INVALID_RESPONSE`로 처리합니다.

```dotenv
EXTRACTION_PROVIDER=gemini
GEMINI_API_KEY=<여기에만 입력>
AI_MODEL=gemini-3.1-flash-lite
AI_TIMEOUT_MS=30000
```

2026-11-03 실제 키 확인(합성 판매글 1건, CheckService 경유): `gemini-3.1-flash-lite` 5/5 성공, 1.9~3.9초, 12개 항목 모두 근거 검사 통과. `gemini-3.5-flash`는 수요 과다 503이 잦았고(3번 중 2번 실패), `gemini-2.5-flash`는 신규 사용자 제공 중단(404). 판매글 1건 기준이며 정확도·성능 측정이 아닙니다.

### 클라우드 AI(Claude) 연결 · 2026-11-03 사용자 결정

사용자 결정(클라우드 AI)과 직접 지시("API 키도 연결하자")에 따라 앱 담당이 `AnthropicProvider`를 추가했다(Terra 검토 대상, Communicate APP-019). 공식 SDK `@anthropic-ai/sdk`를 쓰고, Ollama와 같은 근거 규칙 프롬프트(`extractionSystemPrompt`)를 사용한다. 응답 JSON은 기존 `validateGroundedExtraction`을 그대로 통과해야 한다. 거절·잘림·JSON 아님은 `AI_INVALID_RESPONSE`, 통신 실패는 `AI_PROVIDER_ERROR`로 처리한다. SDK 재시도는 끄고(시간 제한은 서비스가 관리), `fallbacks: "default"`(거절 시 서버 측 대체)를 사용한다. 키는 서버 `.env`에만 둔다(Git 제외 대상, 기록·코드·앱에 넣지 않는다).

```dotenv
EXTRACTION_PROVIDER=anthropic
ANTHROPIC_API_KEY=<여기에만 입력>
AI_MODEL=claude-opus-5-5
AI_TIMEOUT_MS=30000
```

실제 키로 호출해 본 결과는 따로 기록합니다. 키가 없는 상태에서는 가짜 클라이언트로 단위 테스트만 했다(`test/anthropic.test.ts`).

원문 인용은 입력의 실제 부분 문자열이어야 하며 숫자·날짜/시간·좌석·범주에 보수적인 추가 검사를 합니다. 지원하지 않는 표현은 오류 또는 unknown으로 처리해야 합니다. 이 제한적 검사가 의미적 완전성·오탐 0·프롬프트 주입 완전 방어를 보장하지는 않습니다. 원문은 시스템 메시지와 분리된 JSON 데이터로 전달하고 도구 호출 기능은 제공하지 않습니다.

## 로컬 HTTP 확인

```sh
curl -sS http://127.0.0.1:3001/events
curl -sS http://127.0.0.1:3001/events/akmu-daegu-20261121/official-context
curl -sS -H 'Content-Type: application/json' --data-binary @../shared/examples/model-request.json http://127.0.0.1:3001/checks
curl -sS -H 'Content-Type: application/json' --data-binary @../shared/examples/manual-request.json http://127.0.0.1:3001/checks
```

위 model-request는 AI 미설정 시 503 오류를 확인하는 요청이고, manual-request는 합성 문장의 명시적 수동 입력 예시다. 실제 모델 추출 결과라고 발표하지 않습니다.

## 연동·운영 경계

- 웹 CORS 기본 허용 출처: `http://localhost:5173`, `http://127.0.0.1:5173`. `CORS_ORIGINS`로 명시적 목록 지정. 와일드카드·자격증명 허용 없음. 웹 `VITE_API_BASE_URL=http://127.0.0.1:3001`은 웹 담당이 설정·검증합니다.
- iOS 시뮬레이터는 호스트의 루프백 주소를 사용할 수 있습니다. 실제 기기에서는 기기의 localhost를 쓰지 않고 검증한 LAN/HTTPS 주소가 필요합니다. `HOST` 기본은 127.0.0.1이며 이번 작업에서 외부 공개하지 않았습니다. 네이티브 HTTP 정책·실기기 동작은 별도 확인합니다.
- 이 서버는 로컬 데모용입니다. 인증·계정별 격리·TLS 종료·지속 저장·분산 호출 제한은 구현하지 않았습니다. 외부 공개 전에 이 작업들이 필요합니다. CORS는 인증을 대신하지 않습니다.
- 16KiB 본문/3000자 입력, AI 응답 1MiB, IP당 검사 30회/분, 기본 AI 시간 10초. timeout은 환경에서 최대 120초이나 웹 어댑터 15초와 정렬해야 합니다. 로그에 판매글·제공자 응답·키를 출력하지 않습니다.
- 원문 파일/DB 저장 없음. 재대조 메모리에 원문 해시·인용 후보·제공자 정보가 최대 100건/15분 남고 요청 시 만료 항목을 정리합니다. 유휴 시 물리 메모리에서 즉시 지우는 삭제 보장이 아니며 프로세스 종료 시 사라진다. 공개 운영 전 보관·권한 정책을 정해야 합니다.

## 검증 범위

`npm test`의 모델은 주입한 테스트 fixture 또는 모의 fetch다. 실제 HTTP 테스트는 로컬 소켓에서 실행하지만 실제 제품 AI/웹/앱 왕복을 의미하지 않습니다. `npm run examples`는 명시 수동·합성 예시만 생성합니다. 실 모델 정확도, 웹 브라우저·앱 연결, 기기, 배포·제출은 별도다.

## ASTRA-016 R1~R4 회귀 수정

`test/review-regressions.test.ts`는 복합 한글 금액의 전체값/부분값, 단일/별도 금액, 잘못된 복합 표현, 작성문 대신 공식 가격 인용, 동일 좌석의 회차별 서로 다른 가격/문구/URL/날짜, 판단 원문 인용 누락 거부를 검사합니다. 회귀 7개를 포함해 40개 테스트와 타입 검사를 통과했습니다. 명령과 수정 전 실패·수정 후 결과는 `../evidence/logs/sol-review-20261101-*`에 보존합니다.

가격 보조 인용은 YES24 공지를 직접 재열람해 보존했습니다. 해당 원문은 API 실행 때 외부에서 가져오지 않습니다. 기존 `docs/official/demo-event-akmu.json`은 Astra 소유라 수정하지 않았으며, 보조 인용을 정식 자료에 병합하는 작업은 Communicate에서 요청합니다. 공식 확인일은 개별 자료의 날짜 단위를 유지합니다. 이 수정으로 전달 방식 전체의 규정 대조·공식 자료 전체 최신성·실제 AI 정확도가 검증된 것은 아닙니다. 제공자 설정과 운영 서버는 변경/재시작하지 않았습니다.

## SOL-005 이후 웹·앱 검증 인계

이번 인계는 실행 안내 문서다. Sol은 서버·화면을 시작/재시작하지 않았고 환경 파일·의존성·모델 설정도 변경하지 않았습니다. 기존에 실행된 서버가 최신 코드인지 `contractVersion`만으로는 알 수 없습니다. 시작/재시작은 검증 담당자가 기존 서버 실행 담당자와 조율하고, 자신이 실행한 터미널에서 종료 후 수행합니다. 다른 담당자의 프로세스를 임의 종료하거나 포트를 변경하지 않습니다.

### 1. AI 없이 최신 서버 확인

기존 의존성이 준비된 환경에서 검증 담당자가 실행할 **일회성 프로세스 명령 예시**다. `.env`를 만들거나 수정하지 않고 `--env-file`도 사용하지 않습니다. 제공자·모델을 선택하는 단계가 아닙니다.

```sh
cd /Users/daoule/Desktop/AID/server
EXTRACTION_PROVIDER=none HOST=127.0.0.1 PORT=3001 node src/main.ts
```

별도 터미널에서 조회만 먼저 합니다.

```sh
curl -sS http://127.0.0.1:3001/health
curl -sS http://127.0.0.1:3001/events/akmu-daegu-20261121/official-context
```

- `/health`는 `aiConfigured:false`여야 합니다. true이거나 상태를 확인할 수 없으면 추출 POST를 보내지 않고 담당자에게 알린다.
- `official-context`의 가격 `sourceText`는 실제 가격 인용이며 생성 설명인 “공식 공지 기본가: … 수수료·할인 제외 기본가 비교.”가 없어야 합니다. 가격 tier의 `verifiedAt`은 2026-11-01이고, 기존 공연/정책 확인일은 별개다.
- 현재 파일 기준 `sourceVersion` 기대값은 `sha256:37f23141d317d7b6106cfc406cd8e732e6bf544d6e85e31d097987493dc0d3eb`입니다. 다르면 오래된 프로세스인지 먼저 확인합니다. Astra의 공식 자료 통합 후에는 정상적으로 달라질 수 있으므로 새 기록과 대조합니다.
- 로컬 파일의 기대 버전만 확인하려면 아래를 실행할 수 있습니다. 제공자 생성·HTTP·모델 호출 없이 카탈로그만 읽는다.

```sh
node --input-type=module -e 'import {catalog} from "./src/catalog.ts"; console.log(catalog[0].context.sourceVersion)'
```

`aiConfigured:false`를 확인한 뒤에만 아래 요청을 검증합니다.

```sh
curl -i -H 'Content-Type: application/json' --data-binary @../shared/examples/model-request.json http://127.0.0.1:3001/checks
curl -i -H 'Content-Type: application/json' --data-binary @../shared/examples/manual-request.json http://127.0.0.1:3001/checks
```

첫 요청은 `503 AI_NOT_CONFIGURED`, 두 번째는 `200`과 `extraction.method=manual`, `actualModelCall=false`, `isDemo=true`가 기대값입니다. 전자는 미설정 오류 검증이고 후자는 사용자가 명시한 합성 수동 입력이며 실제 AI 성공이 아닙니다. 실패를 fixture나 수동 성공으로 자동 대체하지 않습니다.

### 2. 계약·공식 근거 변경

| 항목 | 소비자가 유지할 것 |
| --- | --- |
| 공통 계약 | `shared/index.ts`, Zod 4.6.7, wire 형태·contractVersion 0.1.0 유지. 버전 문자열만으로 SOL-005 로딩 여부를 판정하지 않음 |
| R4 원문 | conflict/matched/needs_check는 비어 있지 않은 listingQuote 필수. 수동 입력의 전체 실제 원문을 유지하고 화면에서 접어 보기 가능 |
| 수정값 | 원문 인용·extracted와 사용자 확인값 appliedFields를 구분. 수정한 금액을 원문 인용으로 만들어 넣지 않음 |
| R2 공식 가격 | sourceText/officialExcerpt는 공지에서 확인한 문장. facePrice는 정규화 가격, 비교 설명은 reason/notices 및 조건 필드 |
| R3 회차 | 가격·원문·URL·확인일은 같은 유일 tier. 회차가 다르거나 조건 미확인이면 숫자 비교 보류 |
| 출처 버전 | docs/official의 기존 스냅샷과 server/data/akmu-price-evidence.json을 결합한 SHA-256. 가격 확인일 갱신을 정책 전체 재확인으로 확대하지 않음 |
| 데이터/AI 표시 | 합성 판매글이면 실제 공식 자료를 써도 demo. HTTP 연결·실제 공식 자료·모델 호출은 서로 다른 정보 |

정식 `docs/official` 통합은 Astra 소유 작업으로 요청한 상태다. 웹·앱은 보조파일을 따로 복사·편집하지 않고 서버 응답을 소비합니다. UI에 새 기능을 추가하는 인계가 아닙니다.

### 3. 웹·앱 담당별 검증

아래 클라이언트 명령도 각 담당자가 실행할 예시이며 Sol이 실행하지 않았습니다. 클라이언트 전용 환경변수는 해당 프로세스의 로컬 API 주소만 지정합니다. 기존 설정 파일은 변경하지 않습니다.

웹은 `web/`에서 다음과 같이 시작합니다.

```sh
VITE_API_BASE_URL=http://127.0.0.1:3001 npx vite --host 127.0.0.1 --port 5173
```

서버 기본 CORS 출처는 `http://localhost:5173`, `http://127.0.0.1:5173`다. 다른 포트를 임의로 사용하지 않습니다. 다음 사례의 실제 요청·응답·화면을 기존 테스트에서 확인하고 공식 인용의 과거 생성 설명 기대값을 갱신합니다.

- AI 미설정 → 오류만 표시, 자동 fixture·자동 수동 전환 없음.
- 사용자가 직접 입력 선택 → 조건 확인 후 기본가 비교, 가격 250000은 차액 74000 / 42.05%, 200000으로 수정 후 차액 24000 / 13.64%. 수동 재대조는 다시 `extractionMode:manual`과 전체 확인값을 전송하며 `previousCheckId`를 넣지 않습니다.
- 조건/회차/좌석 불명확 → 숫자 없이 보류. 선예매 여부 미확인 → 적용 보류·추가 확인. 일반예매에는 선예매 규정 적용하지 않음.
- 실제 가격 원문·출처·날짜 단위 확인일·sourceVersion·사용자 수정값이 서로 구분돼 보이는지 확인. 원문 인용을 null로 바꾼 응답은 성공 화면에 표시하지 않음.

앱은 웹 최신 인계 확인 후, 이미 구성된 shared 직접 소비·Metro 별칭을 유지합니다. 공통 파일을 앱 사본으로 덮어쓰거나 Node 전용 API를 shared에 추가하지 않습니다.

```sh
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001 npx expo start --dev-client
LIVE_API_BASE_URL=http://127.0.0.1:3001 npm run test:live
```

두 명령은 `mobile/`에서 실행합니다. iOS 시뮬레이터용 주소이며 실제 기기·Android 연결을 보장하지 않습니다. 이번 인계를 위해 HOST를 0.0.0.0으로 바꾸거나 LAN/외부 공개 설정을 추가하지 않습니다. 앱도 동일한 오류·명시적 수동·수정·보류·근거 표시를 확인합니다. 딥링크 캡처·Jest 입력·실제 탭/키보드·실기기 결과는 구분해 보고합니다.

### 4. 검증·보고 경계

기존 Sol 수정 검증은 회귀 7개 포함 40개 테스트·타입 검사 통과이며, 이 문서 편집에서 다시 실행한 결과가 아닙니다. R1~R4 최종 승인은 Astra 재검증을 기다린다. APP-009의 최신 서버 왕복 8개·Jest 65개·Metro 번들, WEB-006B의 단위 테스트 37개·브라우저 12개·SOL-005 원문/확인일 검증은 각 담당자의 완료 보고로 확인했고 Sol이 독립 재실행하지 않았습니다. APP-010은 바로가기 없는 실제 사용자 조작 검증 착수로, 아직 완료 보고가 아닙니다.

AI 제공자·모델 미정이므로 실제 model 추출·성공 후 재사용·추출 성능은 검증했다고 표시하지 않습니다. 기존 격리 모의 테스트는 실제 모델 검증으로 바꾸지 않습니다. 담당자는 변경 파일, 실행 명령/시각, sourceVersion, 실패/재시도, 화면·기기 범위를 Communicate에 추가합니다. Astra의 새 구체적 수정 요청이 오면 Sol은 shared/server에서 해당 재현과 회귀 검증만 수행하고 추가 기능은 보류합니다.


### 가입 이메일 인증 필수 (보안, APP-031 · 2026-11-06)

`POST /auth/signup`은 이메일과 인증번호(`/auth/email/send`로 받은 6자리)가 있어야 합니다. 예전에는 요청 본문에 email이 있을 때만 인증번호를 검사해서, `{name,password}`만 보내면 인증 없이 가입됐습니다(EMAIL_REQUIRED로 차단). 메일 발송 설정이 없으면 가입도 막힙니다(설정 누락이 인증 생략이 되지 않게). 로컬 테스트에서만 `ALLOW_SIGNUP_WITHOUT_EMAIL=1`로 예외를 허용합니다. 공유·공개 서버에는 설정하지 않습니다.
