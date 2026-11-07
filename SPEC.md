> **2026-11-06 가입 규칙**: 앱에서 이메일·닉네임 중복 확인을 모두 통과해야 가입을 요청하며, 값 변경 시 해당 확인을 다시 해야 한다. 서버는 최종 가입 시 중복을 다시 검사한다. 신규 비밀번호는 8~200자이며 영문 대문자·소문자·특수문자를 각각 1개 이상 포함한다. 기존 계정 로그인에는 신규 가입 규칙을 적용하지 않는다. 이메일 인증번호는 서버에서 확인한다.

> **최신 방향 · 2026-11-03 사용자 결정**: 공식 최초 예매·원구매가 동일 개인 양도를 중심으로 전환한다. 공식 판매 권한과 실제 재고가 없으므로 시연용 가상 공연·좌석·매물로 구매 확인 단계까지 보여주며 결제·예약·권리 이전은 수행하지 않는다. 기존 판매글 대조는 부가 기능으로 보존한다. [최신 방향과 경계](docs/MARKETPLACE_DIRECTION.md)가 아래 과거 범위보다 우선한다.

> **이전 결정 · 2026-10-29**: 새 문장을 실제 AI로 추출하고 사용자 수정→조건 일치 검사→공식 근거 대조를 검증한다. [기존 인계](docs/CORE_DEMO_HANDOFF.md)는 부가 기능의 근거로 보존한다.

# 요구사항·계약 안내

상태: **합의 전 초안**. 상세 규칙·데이터·API·보안·완료 조건은 [티켓레이더_팀공유_기획기술명세.md](docs/reference/티켓레이더_팀공유_기획기술명세.md) 4~9절을 재사용한다. 이 파일은 기존 제안을 확정 계약으로 승격하지 않는다.

## 공통으로 합의할 것

- 실제 코드 저장소·프레임워크·폴더와 화면 범위.
- AI 추출의 필수 여부, 실제 제공자/모델, 전송 항목, 실패·시간 초과 처리.
- 공연/회차/좌석 등급의 식별 방법, 공식 기준 가격의 할인·매수·수수료 조건.
- 수정 후 재대조 요청 방식과 결과의 원문·공식 출처·확인 시각·보류 사유 형식.
- 제보·담당자 화면을 첫 시연에 포함할지. API·DB 도입 여부와 접근 권한.

## 추천 최소 계약의 의미

입력은 공연·판매글 텍스트, 출력은 공연/회차/좌석/가격/전달 방식의 추출 후보와 원문 근거다. 미확인 값은 미확인으로 남기고 사용자가 수정·확인한 값으로 대조한다. 가격은 동일 조건과 양수 기준가격이 확인될 때만 계산한다. 불확실하면 보류한다. 규정 결과는 공식 출처·확인 시각을 연결하며 진위·불법을 확정하지 않는다.

기존 API 경로는 원본 7절의 초안이다. 정확한 JSON 필드·필수성·오류 코드는 AID-CONTRACT-001 합의 전 동결하지 않는다. 임의 URL 서버 수집·개인정보 보관은 자동으로 포함되지 않는다.

## 테스트 입력·기대 결과 제안

아래는 **합성 테스트 설계이며 미실행**이다. 실제 공연 데이터·탐지 성능이 아니다.

| ID | 입력/조건 | 기대 결과 |
| --- | --- | --- |
| T01 | 동일 공연·회차·등급, 1매, 기준 100000원/판매 150000원, 수수료 조건 일치 | 차액 50000원·50% 표시, 근거 출처 연결 |
| T02 | 기준과 판매글 좌석 등급 또는 회차 불일치 | 가격 비교 보류 및 이유 표시 |
| T03 | 판매가 누락/복수 후보/기준가격 0 | 자동 계산하지 않고 확인·수정 요청 |
| T04 | 공식 본인 현장 수령 조건과 QR 캡처만 전달 문구 | 두 근거와 조건 충돌 표시, 사기 확정 금지 |
| T05 | 사용자가 추출 가격을 수정 | 수정값으로 재계산, 이전 결과 혼동 방지 |
| T06 | 입력 없음·AI 시간 초과·잘못된 응답 | 각각 입력 안내·오류·재시도; 성공 결과 조작 금지 |
| T07 | 판매글에 AI 지시/스크립트 포함 | 데이터로만 처리, 임의 도구 실행·HTML 실행 금지 |

완료는 코드 존재·테스트·빌드·브라우저·실기기·배포·제출로 나누어 실제 명령·시각·결과를 기록한다. 사용자 설명 확인은 추출/수정/규칙 분리, 보류 이유, 담당 코드의 입력/출력을 본인이 설명하는 방식으로 진행한다.

## 초기 구조 확정

작업 루트는 `/Users/daoule/Desktop/AID`, 코드 미구현(사용자 확인). 화면·규칙·데이터 책임의 예약 디렉터리는 `src/ui/`, `src/domain/`, `src/data/`. 기존 ‘실제 코드 저장소·폴더’ 확인 항목 중 작업 위치만 해소했으며 프레임워크·정확한 모듈·API 계약은 미확정이다.

## 2026-10-28 플랫폼·계약 방향 갱신

사용자 결정은 웹과 앱 모두 구현하되 웹 시연을 먼저 검증하는 것이다. 웹은 `web/`의 Vite/React/TypeScript, 앱은 `mobile/`의 Expo/React Native/TypeScript를 사용한다. 두 화면은 Sol이 소유할 공통 계약과 서버의 가격·규정 판단 결과를 소비한다. 이전 `src/ui/` 예약은 활성 화면 소유 경로가 아니다.

WEB-001의 `GET /events`, `GET /events/:id/official-context`, `POST /checks`와 오류 형식을 **계약 초안**으로 Sol에게 전달한다. Sol은 누락값의 `null`/생략 구분, 결과 상태 열거값, `dataMode` 값, 수정 후 재대조 요청, 모바일에서 접근 가능한 API 주소를 확정해 Astra에 기록한다. 확정 전 각 화면은 이미 계산된 합성 fixture를 `isDemo=true`로 표시할 수 있으며, 실제 API 연동으로 보고하지 않는다.

## Astra 통합 검토 기준 · AID-INTEGRATION-001

`tests/integration/check_api.py`는 WEB-001 제안 응답에 대해 검토하는 임시 독립 검증기다. Sol의 타입·스키마를 확정한 것이 아니며 계약 초안 도착 시 구조 차이를 먼저 조정한다. 앱 전용 또는 웹 전용 판정 로직이 아니다.

- `isDemo`는 boolean, `dataMode`는 demo/live. demo 데이터는 isDemo=true. 합성 매물을 포함하면 live 공식 데이터여도 시연 표시는 유지할 수 있다. 정확한 모드 의미는 Sol 계약에서 확정한다.
- 추출 후보는 값 없음과 미확인 상태를 구분하고 unknown 후보의 value는 null. 사용자가 확인한 값의 상태 열거값은 Sol이 명시한다.
- 공식 가격/정책에 관한 확정 결과는 판매글 인용·공식 근거·출처·확인 시각을 포함한다. 보류·정보 부족은 사유를 표시한다.
- 비교 보류 응답에 숫자 결과를 함께 싣지 않는다. 숫자 결과는 유한수이며 boolean·NaN·Infinity를 허용하지 않는다.
- 동일 조건을 사람이 확인한 테스트 사례에서만 기대 가격과 실제 차액/백분율을 비교한다. 이 검증기는 공연·좌석·회차 일치 자체나 AI 정확도를 판단하지 않는다.

완료된 것은 검증기 자체의 16개 테스트와 저장된 합성 응답 검사다. 공연 조회/컨텍스트/사용자 수정 후 재대조/오류 응답의 실제 HTTP 통합, 웹·앱 화면과 실기기 검증은 별도다. 시간 초과·잘못된 AI 응답·주입 방어는 이 도구의 통과만으로 검증되지 않는다.

## Astra 계약 결정 · WEB-004/APP-004 응답

웹·앱 담당이 같은 임시 타입과 fixture를 사용해 화면을 구현했다. 다음은 Sol이 공통 계약 v0를 작성할 때 반영할 결정이다. **실제 서버 구현·API 왕복 완료를 뜻하지 않는다.**

1. `findings.status`에 `needs_check`를 포함한다. 판매글에 확인이 필요한 문구가 있지만 공식 규정과 직접 충돌한다고 단정할 수 없는 경우다. `conflict`, `matched`, `unverifiable`, `comparison_held`와 구분한다. `needs_check`에는 판매글 원문 인용과 이유가 필요하며, 공식 규정을 근거로 언급한다면 공식 문구·URL·확인 시각도 필요하다.
2. `extracted.*.evidenceQuote`는 **명시적인 `string | null`**이다. `unknown`이고 원문 근거가 없으면 `null`을 사용한다. `extracted`·`ambiguous` 후보에는 비어 있지 않은 원문 인용을 둔다. 빈 문자열로 근거 부재를 숨기지 않는다.
3. `POST /checks`에 `confirmedFields`가 없으면 추출 후보만 반환하고 가격 비교는 보류한다. 필드가 있으면 사용자가 확인·수정한 값으로 새 대조를 수행한다. `appliedFields`로 실제 적용값을 돌려줘 이전 결과와 혼동하지 않게 한다.
4. 가격의 `price`는 **1매 가격(원)**으로 정의한다. 총액만 있는 판매글의 1매 값은 수량·수수료 조건이 명확하지 않으면 `unknown` 또는 `ambiguous`로 두고 사용자 확인을 받는다. `priceComparison`은 `{held:true,reason}` 또는 `{held:false, seatGrade,showtimeId,facePrice,listingPrice,diff,ratePercent,sourceUrl,verifiedAt}`로 구분한다.
5. `dataMode=demo`는 결과에 합성 공연·가격·규정 또는 합성 판매글이 섞인 경우다. 이때 `isDemo=true`다. 실제 HTTP 서버에 연결됐다는 이유만으로 `dataMode=live`로 바꾸지 않는다. `live`는 해당 결과에 합성 자료가 없고 공식 근거가 검증된 경우에만 사용한다.
6. 웹·앱 임시 타입의 `checkId`, `checkedAt`, `notices`, finding의 `id`·`title`, 추출 `candidates`를 v0 응답 후보로 받아들인다. Sol은 타입·런타임 스키마에서 필수/선택과 `null`/생략을 확정하고 예시 JSON을 제공한다. `deliveryMethod`는 `official_transfer`, `qr_capture`, `onsite_with_seller`, `paper_courier`, `other` 또는 `null`을 사용한다.

Sol은 `GET /events`, `GET /events/:id/official-context`, `POST /checks`, 오류 `{code,message,retryable}`의 요청·응답 타입과 런타임 검증을 한 소유 위치에 작성하고 웹·앱 담당에게 경로와 버전을 알린다. 웹·앱의 현재 HTTP 어댑터는 최상위 형태만 검사하므로 공통 스키마가 확정되면 중첩 필드까지 검증하도록 각 담당자가 수정해야 한다. 개발·실기기용 API 기본 주소와 웹 CORS 출처도 Sol의 서버 착수 기록에서 명시한다.


## 2026-11-03 플랫폼(시연) 계약 · 사용자 결정 APP-022~025

서버 구현: `server/src/market-core.ts`(규칙, 앱 `mobile/src/market/engine.ts`와 동일 파일), `server/src/market.ts`(계정·저장·라우트), 제보는 `server/src/reports.ts`. 오류 형식은 기존 `{code,message,retryable}`.

| 메서드·경로 | 인증 | 설명 |
| --- | --- | --- |
| POST /auth/signup, /auth/login | – | `{name,password}` → `{token,expiresAt,user}`. 비밀번호 scrypt 해시만 저장, 세션 7일 |
| POST /auth/logout, GET /me | Bearer | `/me` → `{id,name,alertsOn,unread}` |
| GET /shows?category=&q= | 선택 | 공연 요약(매물 수·최저가·정가 이하 수·즐겨찾기·새 매물 수) |
| GET /shows/:id, GET /listings/:id | 선택/– | 공연·매물 + `safety`(안심 확인) |
| POST /listings/preview, POST /listings | –/Bearer | 판매 전 안심 확인 미리보기 / 매물 등록(정가 이하면 즐겨찾기+알림 켠 다른 사용자에게 알림) |
| GET /me/favorites, PUT·DELETE /me/favorites/:showId | Bearer | 계정별 즐겨찾기 |
| PUT /me/alerts, GET /me/notifications, POST /me/notifications/read | Bearer | 정가 이하 알림 설정·목록 |
| POST /orders, GET /me/orders, GET /orders/:id, POST /orders/:id/sent·confirm·cancel | Bearer | 시연 주문: held → sent → settled / cancelled. 판매자만 sent, 구매자만 confirm |
| POST /reports, /organizer/* | –/Bearer | 매물·판매글 신고와 주최 측 제보함(APP-021) |

안심 확인(`safety`) 규칙: 같은 좌석 등급의 공식 1매 기본가와 비교(차액·%·"저렴해요/비싸요/정가와 같아요/정가 확인 불가"), 등록된 공식 규정만 대조(실제 공연 AKMU = 팬클럽 선예매 관람자 본인 확인 원문), 공식 양도는 확인 항목. 진위·입장·위법을 판정하지 않는다.

테스트 사례(실행됨): 정가 이하/초과/미등록, 선예매 규정, 가상 공연 캡처 규정, 계정별 즐겨찾기·새 매물 수, 알림 대상(자기 매물·알림 끔 제외), 주문 권한·상태·중복 구매 차단, 비밀번호 비저장 — `server/test/market.test.ts`, `mobile/__tests__/market.test.tsx`.
