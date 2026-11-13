# 티켓레이더 모바일 앱 (`mobile/`)

담당: 앱 담당(Opus 2 역할). 결정 근거: `Communicate.md`의 AID-20261028-ASTRA-003 (Expo + React Native + TypeScript).

핵심 흐름: **공연 선택 → 판매글 붙여넣기 → 추출값 확인·수정 → 공식 가격·입장 규정 대조 결과**(판매글 원문·공식 출처·확인 시각).

## 현재 상태

| 항목 | 상태 |
| --- | --- |
| 계약 | Sol 공통 계약 `@ticket-radar/shared` v0.1.0(`../shared/index.ts`)을 직접 사용. 웹 사본은 더 이상 쓰지 않음 |
| 데이터 | 기본은 **시연 데이터(합성 fixture)**. `EXPO_PUBLIC_API_BASE_URL`을 주면 Sol 서버 연결 |
| API 연동 | Sol 로컬 서버(127.0.0.1:3001, AI 미설정)와 왕복 확인: `npm run test:live` 8개, iOS 시뮬레이터 화면 4장(APP-008 기록). 실제 AI 추출은 미검증 |
| 테스트 | Jest + React Native Testing Library (`npm test`) |
| iOS | 시뮬레이터 개발 빌드로 확인(결과는 Communicate.md 완료 기록 참조) |
| Android·실기기 | 미검증 (Android SDK 라이선스·adb 미설정, 실제 iPhone 미연결) |

## 실행

```sh
cd mobile
npm install
npm test              # 단위·흐름 테스트
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
npm run check:contract  # 공통 계약 연결(shared 예시 파싱)·응답 검사 테스트
LIVE_API_BASE_URL=http://127.0.0.1:3001 npm run test:live  # Sol 서버 실행 중일 때만: 실서버 왕복

npx expo run:ios      # iOS 시뮬레이터 개발 빌드 (ios/ 는 자동 생성, git 제외)
```

실서버 모드: `cd ../server && npm start` 후 `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001 npx expo start --dev-client` (iOS 시뮬레이터는 Mac의 루프백 주소를 쓸 수 있다). `CI=1`을 붙이면 Metro가 파일 변경을 감시하지 않으니 수정 후에는 다시 시작합니다.
실기기에서는 `localhost`가 휴대폰 자신을 가리키므로 같은 Wi-Fi의 Mac IP 또는 HTTPS 주소가 필요합니다.

## 구조와 이유

```text
src/
├── app/            # 화면(Expo Router). 화면 파일은 상태를 꺼내 컴포넌트에 넘기기만 한다
│   ├── _layout.tsx #   API 인스턴스·흐름 상태 제공, 스택 내비게이션
│   ├── index.tsx   #   1. 공연 선택 (+ 시연 도구: 네트워크 실패 재현)
│   ├── listing.tsx #   2. 판매글 입력, 공식 기준 요약
│   ├── review.tsx  #   3. 추출값 확인·수정
│   └── result.tsx  #   4. 대조 결과
├── components/     # 표시 전용 컴포넌트 (테스트 대상)
├── state/          # FlowContext: 화면 간 공유 상태와 API 호출
├── api/            # TicketRadarApi 인터페이스, 시연 API, HTTP 어댑터
├── contract/       # @ticket-radar/shared 재노출 + 하위 타입 이름(필드 추가·변경 없음)
├── demo/           # 시연 fixture(공통 계약 형식, 합성, AI 결과 아님)
└── ui/             # 표시 문구·서식(fields/format/display/theme)
```

- **앱에는 가격 계산·위험 판정 규칙이 없다.** 차액·비율·상태는 응답 값을 그대로 보여준다. 시연 API도 미리 계산된 응답을 찾아 돌려줄 뿐이며, 준비되지 않은 입력 조합은 "가격 비교 보류"로 돌려준다.
- **공통 계약을 직접 불러온다.** `shared/`는 Sol 소유이며 앱은 읽기만 합니다. npm 설치(`file:`) 대신 별칭으로 연결해 `shared/` 폴더에 아무것도 쓰지 않는다: `tsconfig.json` paths, `metro.config.js`(watchFolders + `@ticket-radar/shared` → `../shared/index.ts`), Jest `moduleNameMapper`. zod는 `shared/node_modules`에서 찾습니다. `npx expo export --platform ios`로 Hermes 번들에 포함됨을 확인했습니다.
- **시연 데이터는 앱 소유 fixture.** 웹과 같은 사례(A·B·C·공식 자료 없음)를 공통 계약 형식으로 옮겼다. 응답은 `CheckResponseSchema.parse`를 통과해야 하고, `extraction.method`는 항상 `fixture`(또는 명시적 `manual`)입니다.
- **데이터 접근은 `TicketRadarApi` 인터페이스 뒤에 있다.** 시연 ↔ 실제 API 전환 시 화면 코드는 바뀌지 않습니다.
- **실제 API 응답은 표시 전에 검사한다(`api/validate.ts`).** 1단계 공통 계약 Zod 스키마(중첩 필드·근거·모드 일관성·가격 산술), 2단계 '보낸 요청과 맞는가'(공연 ID, 인용이 보낸 판매글의 실제 구간, `appliedFields`=보낸 확인값 전체, 확인 전 무계산, manual 요청에 manual 응답). 어긋나면 `INVALID_RESPONSE`로 보여주고 성공 화면에 띄우지 않는다. 판정 규칙이 아니다. 계약에 맞지 않는 요청은 보내지 않는다(`INVALID_REQUEST`).
- **요청 형태(v0.1.0).** 추출: `{eventId, listingText, syntheticListing:true, extractionMode:'model'}`. 재대조: 처음 응답의 `checkId`를 `previousCheckId`로, 확인값 12개 **전체**를 `confirmedFields`로. 직접 입력: 사용자가 'AI 없이 직접 입력'을 누를 때만 `extractionMode:'manual'`(AI 오류 후 자동 전환 없음). 409 `CHECK_EXPIRED_OR_MISMATCH`면 '판매글 다시 분석하기'를 보인다.
- **비교 전제 조건 6개는 자동으로 채우지 않는다.** 공연 일치·예매 유형·가격 기준·수수료·할인·예매자 본인. 사용자가 고르지 않으면 null이고 서버가 비교를 보류합니다.
- **출처 표시.** 결과마다 추출 방식(`method`·이번 요청의 `actualModelCall`·`reused`)과 `provenance`(합성 판매글 여부·공식 자료 유형·버전)를 보여줍니다. 배지는 `isDemo`(합성 자료 포함 여부)이며 서버 연결 여부가 아닙니다. 날짜 단위 확인일에는 시각을 만들어 붙이지 않습니다.
- **AI 오류를 시연 데이터 성공으로 대체하지 않는다.** 실제 API 모드에서 `AI_NOT_CONFIGURED`·시간 초과 등은 서버 문구와 오류 코드를 보여주고, `retryable`일 때만 '다시 시도'를 보인다. 실제 API 모드에서는 시연 예시 버튼도 숨긴다.

- **AI 추출값은 후보다.** 추출 상태(추출/후보 여러 개/찾지 못함)와 판매글 근거 문구를 보여주고, 사용자가 고친 항목에는 "사용자 수정" 표시를 한다. 수정값으로 다시 대조한 결과에는 그 사실을 표시한다(T05).
- **작은 화면·큰 글자:** 모든 화면은 스크롤 가능, 높이 고정 없음, 칩·행은 줄바꿈(`flexWrap`), 버튼 최소 높이 48. 글자 크기 배율 제한(`allowFontScaling=false`)을 쓰지 않습니다.
- **판매글은 데이터로만 다룬다.** 원문은 일반 `Text`로 표시하며 HTML·스크립트를 해석하지 않는다(T07).
- 진위·입장 가능 여부·사기/불법을 확정하는 문구를 쓰지 않습니다. 결과 화면 하단에 고지문을 둡니다.

## 테스트가 다루는 것

- `__tests__/demoApi.test.ts`: 시연 응답(T01·T02·T03·T05·T06), fixture 원본 불변, 실패 1회 재현
- `__tests__/httpApi.test.ts`: 가짜 fetch로 오류 본문 전달·형식 오류·네트워크 실패 (실제 서버 검증 아님)
- `__tests__/display.test.ts`: 숫자 입력 해석, 표시 문구
- `__tests__/flow.test.tsx`: 실제 화면 4개를 라우터로 묶은 흐름 — 정상 결과, 수정 후 재대조, 잘못된 숫자 차단, 빈 입력, 네트워크 실패·재시도, 공식 자료 없는 공연
- `__tests__/sharedLink.test.ts`: `@ticket-radar/shared` 연결, Sol 예시 JSON 파싱
- `__tests__/validate.test.ts`: Sol 예시·모든 시연 응답 통과, 계약 위반·원문에 없는 인용·수정값 미적용·fixture를 실제/AI로 표시·다른 공연 응답 거부
- `__tests__/httpFlow.test.tsx`: HTTP 어댑터 + Sol 예시 응답으로 만든 가짜 서버 — AI 미설정(재시도 없음·자동 전환 없음), 화면 선택만으로 Sol 예시 요청과 같은 직접 입력 요청 생성·결과 표시, AI 시간 초과 후 재시도·previousCheckId, 계약 위반 응답 차단, 공식 기준 요약
- `__tests__/live/server.live.test.ts`: (기본 실행 제외) Sol 실서버 왕복 8개 — 조회·AI 미설정·직접 입력 비교·수정 재대조·보류·예매 유형 미확인·409·지시문 포함 글

## 증거

- `evidence/screenshots/ios-*.png`: iPhone 17 시뮬레이터(iOS 26.5) 개발 빌드 캡처. 01~08은 웹 계약 동기화(11:30) **이전**, 09~10은 이후. 06~08은 글자 크기 accessibility-XXXL.
  - 이 Xcode에는 Simulator 화면 앱이 없고 탭 자동화 도구도 없어서, 02~10은 개발 빌드 전용 딥링크(`dev.aid.ticketradar:///?demoScenario=A&demoStep=result`)로 화면 흐름과 같은 API 호출을 실행해 이동한 상태다. **시뮬레이터에서 손가락 탭 조작을 확인한 것은 아니다.** 탭·입력 동작은 `__tests__/flow.test.tsx`가 검증합니다.
- `evidence/screenshots/ios-live-01~04.png`: 2026-11-01 Sol 실서버(AI 미설정) 연결 iOS 시뮬레이터 — 공연 목록, AI 미설정 오류, 직접 입력 비교(+74,000원), 조건 미확인 보류. 01은 앱을 열어 서버 응답을 받은 화면, 02~04는 개발 전용 바로가기(`?devLive=extract|manual&devEvent=&devText=&devFields=`)로 화면 버튼과 같은 실제 요청을 보낸 화면입니다. **손가락 탭이 아니다.**
- `evidence/contract/app-008-live-roundtrip.json`: 실서버 왕복 8단계 결과. `evidence/contract/mobile-*.json`·`validator-result.txt`는 10-28 구 임시 계약 기준 기록(현재 형식 아님).
- `evidence/logs/app-008-*.txt`: 검사 결과, shared/server 무변경 해시.

## 남은 일

캡처 업로드·OCR·알림은 핵심 흐름 검증 후. Android·실기기 검증, Sol 계약 교체와 실제 API 왕복 확인.

## iOS 시뮬레이터 실제 조작 검증 (XCUITest)

`e2e-ios/`는 앱과 분리된 UI 테스트 전용 Xcode 프로젝트다(CNG가 만드는 `ios/`는 건드리지 않는다). 설치된 개발 빌드(`dev.aid.ticketradar`)를 번들 ID로 붙잡아 **실제 터치·길게 눌러 붙여넣기·숫자 키보드 입력**으로 조작합니다. 개발용 딥링크 바로가기는 쓰지 않고, 앱 코드에 테스트 분기도 없습니다. 추가 설치는 필요 없다(Xcode의 XCTest만 사용).

```sh
npx expo run:ios                 # 처음 한 번: 시뮬레이터에 개발 빌드 설치
sh scripts/ios-ui-flow.sh        # Sol 서버·Metro가 없으면 띄우고, 테스트 후 자신이 띄운 것만 종료
```

흐름: 공연 선택 → 판매글 붙여넣기 → '정보 추출하기'(AI 미설정 503 표시·재시도 버튼 없음) → 'AI 없이 직접 입력' → 회차·좌석·가격·매수·조건 6개 입력 → 대조(+74,000원) → '값 수정하고 다시 대조'에서 가격 200000 → 재대조(+24,000원) → '아니거나 모름'(공연 일치 미확인) → 가격 비교 보류. 캡처는 `evidence/screenshots/ios-ui-*.png`로 저장된다(xcresult 첨부에서 꺼냄). 서버 호출 제한(IP당 30회/분)이 있어 연속 실행 사이에 1분 정도 둔다.

### 사람이 직접 따라 하는 수동 검증 절차

도구 없이 확인하거나 실기기에서 확인할 때 쓴다.

1. `cd server && npm start` (AI 미설정 상태 그대로) → `cd mobile && EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001 npx expo start --dev-client` → 개발 빌드 앱에서 Metro 서버를 엽니다. 실기기는 127.0.0.1 대신 같은 Wi-Fi의 Mac 주소와 서버 바인딩 변경이 필요합니다.
2. 첫 화면 상단이 '서버 연결: …'이고 'AKMU CONCERT TOUR - 대구'(실제 자료 배지)가 보이는지 확인 → 공연을 누른다.
3. 판매글 칸을 길게 눌러 붙여넣기: `AKMU 대구 11월 21일 오후 5시 VIP 1매, 티켓 금액만 25만원입니다. 팬클럽 선예매로 샀고 예매자는 저지만 구매자 혼자 가면 됩니다.` → 글자 수 81 표시.
4. '정보 추출하기' → '오류 코드: AI_NOT_CONFIGURED', '다시 시도' 버튼 **없음**, 화면 이동 없음. 결과가 자동으로 나오거나 직접 입력으로 자동 전환되면 실패.
5. 'AI 없이 직접 입력' → '추출 방식: AI 추출 없음 · 사용자가 직접 입력'.
6. 회차 '11월 21일 (토) 17:00', 'VIP석', 가격 `250000`, 매수 `1`, '예, 선택한 공연의 판매글', '팬클럽 선예매', '1매 가격', '티켓 금액만', '할인 없는 기본가', 구매자=예매자 '아니요' → '이 값으로 공식 자료와 대조'.
7. 결과: '시연 데이터' 배지, 'AI 추출 없이 사용자가 직접 입력한 값으로 대조한 결과입니다.', 공식 기본가 176,000원·판매가 250,000원·차이 +74,000원(+42.05%), YES24 링크, 확인 '2026. 11. 01. (날짜 단위)', 판매글 '시연용 합성 문장'·공식 자료 '공식 공지 스냅샷'. 아래로 내려 '선예매 관람자 조건 확인 필요'(공식 안내와 다른 설명)가 있는지 확인.
8. '값 수정하고 다시 대조' → 가격을 `200000`으로 바꿔 대조 → 차이 +24,000원(+13.64%), 판매가 200,000원.
9. 다시 '값 수정하고 다시 대조' → '선택한 공연의 판매글인가'에서 '아니거나 모름' → 대조 → '가격 비교 보류'와 '판매글의 공연 일치 여부를 확인하세요.', 차액 숫자 없음.

## D2 즉시 Release 갱신 · 사용자 지시

화면/기능 변경 묶음 후 `npm run release:d2`를 실행합니다. D2 UUID를 확인하고 타입·lint·테스트 성공 시 Release 빌드→설치→실행→첫화면 캡처. 결과는 evidence/releases/<시각>/ 와 evidence/latest-release.json. 현재는 단독 실행 시연모드이며 실제 AI를 주장하지 않습니다. OTA/상주감시가 아니라 매 작업 후 로컬 재빌드다. 앱 종료/교체는 D2의 dev.aid.ticketradar에만 적용합니다.

## 브랜드 Splash·모션 (APP-012, 2026-11-03)

- **필기체 로고 Splash** `src/brand/BrandSplash.tsx`: 사용자 제작 로고(`assets/brand/ticket-script.png`)를 펜으로 쓰듯 드러낸다. 글자를 쓰는 순서의 중심선(`src/brand/scriptPaths.ts`, 로고 위에 겹쳐 렌더링해 덮임 확인)을 굵게 그려 나가는 SVG 마스크 방식. 본획(t→i→c→k→e→t) → t 가로획 2개 → 빨간 밑줄(빛 번짐) → 조준 표시 잠금(가벼운 진동) → '티켓레이더'와 한 줄 소개 → 위로 빠지며 첫 화면. 약 3초, **누르면 즉시 건너뜀**, iOS '동작 줄이기'·설정 조회 실패 시 정적 로고만 0.7초. 종료는 타이머로 하며 애니메이션 콜백에 의존하지 않는다. 첫 화면과 공연 조회는 오버레이 아래에서 이미 실행되고, 등장 효과만 연출이 걷힌 뒤 시작한다(`SplashGate`).
- **네이티브 시작 화면**: `app.json` expo-splash-screen 플러그인, 흰 배경 + 투명 8px 이미지(이미지가 없으면 플러그인이 배경색을 스토리보드에 넣지 않음). 시뮬레이터 녹화에서 시스템 시작 단계가 검게 보이는 현상은 남아 있다(아래 기록 참조).
- **모션 부품** `src/components/motion.tsx`: 화면 블록 순차 등장(`Screen`이 자동 적용), 제목 단어별 등장(`Title`·홈), 결과 금액 강조(값 그대로, 카운트업 없음). 버튼: 눌림 축소·탄성 복귀, 주요 버튼 진동, 처음 나타날 때 빛줄기 1회. 모두 Reanimated `ReduceMotion.System`.
- **새 의존성**: react-native-svg, react-native-reanimated, react-native-worklets, expo-splash-screen, expo-haptics(`npx expo install`). 네이티브 반영은 `npx expo prebuild --platform ios` + `pod install`(CNG). Jest 는 `jest/reanimated-*.js` 최소 모의를 쓴다(공식 mock 이 이 환경에서 react-native-web·DOM 을 요구해 실패).

## 화면 구조 재구현 (APP-015, 2026-11-03) — 조원 목업 구조 + 웹 테마

원본: `~/Downloads/ticket_rader_mock.pen`(Pen MCP로 읽기만). 흐름: **⓪ 홈 → ① 판매글 입력(공연 선택 시트) → ② 읽은 값 확인 → ③ 확인사항 결과 → ④ 제보 근거 정리(PDF)**, 부속: 404(`+not-found`), 앱 오류 경계(`_layout` ErrorBoundary), ⑤ 관리자(`/admin`).

- **① 입력**: 상단 공연 이름 ▾ → 공연 선택 시트(공연이 하나면 자동 선택). 입력 카드에 캡처 이미지 첨부(+·점선 칩) → **기기 안 OCR**(`modules/text-recognizer`, Apple Vision `VNRecognizeTextRequest` 정확 모드 ko-KR/en-US) → 읽은 글을 입력칸에 채움(사용자가 확인·수정, AI 추출로 표시하지 않음). PNG/JPG·5MB 검사, 읽는 중·오류·다른 이미지 올리기·크게 보기 시트·이미지 삭제. 이미지는 서버 전송·저장 없음. 하단 휴지통 + '이 판매글 확인하기' + 'AI 없이 직접 입력'.
- **② 읽은 값**: 항목별 카드(접기·되돌리기·편집, 큰 값, `판매글 근거: “…”` 칩). 숫자 항목은 편집 버튼으로 입력칸을 연다. '추가 항목 (수량 · 선입금)' 접기. 비교 조건 6개는 항상 펼침. 상단 '판매글 ▾' → 원문·근거 구절 시트. 하단 휴지통(읽은 값으로) + '공식 안내와 비교하기'.
- **③ 결과**: '확인이 필요한 부분 N가지'(서버 항목 중 matched 제외, 기준 문구 표시) → 가격 비교 → 항목 카드(상태 배지·큰 인용·공식 안내 블록·이유) → 출처·모드 정보. 하단 다시 대조 / 제보 근거 정리 / 다른 판매글.
- **④ 제보 근거 정리**: 응답 값만으로 문서 구성, 판매글 연락처 가림(`src/report/reportDoc.ts`), `expo-print` → `expo-sharing` PDF. 신고처 URL은 지어내지 않고 예매처 공지 링크로 안내.
- **⑤ 관리자**: 서버 관리자 API가 없어 로그인·저장을 흉내 내지 않고 '준비 전'을 알림(Terra에 계약안 요청, Communicate APP-015).
- 실제 탭 검증: `e2e-ios`의 `testDemoReleaseFlowD2`(시연 흐름), `testCaptureOcrD2`(사진 보관함 캡처 → OCR). OCR 테스트 전 `xcrun simctl addmedia <UDID> <판매글 캡처.png>`로 사진을 넣는다.


## 2026-11-03 플랫폼 전환 (APP-022~025)

- 홈은 티켓 중개 구매 플랫폼(탭: 홈·즐겨찾기·판매·내 거래·전체). 기존 판매글 확인(암표 방지)은 전체 탭 → '다른 곳 판매글 확인하기', 소개 스크롤은 '서비스 소개'.
- 규칙 엔진 `src/market/engine.ts` = `server/src/market-core.ts` 복사본(서버 테스트가 동일성 검사 — 서버 파일을 고치면 `cp ../server/src/market-core.ts src/market/engine.ts`).
- 로그인 유지: expo-secure-store(키체인). 기기 알림: expo-notifications(앱이 앞에 있을 때·복귀 시 새 정가 이하 알림 확인). 원격 푸시는 미구현.
- 결제는 시연(실제 돈 이동 없음). 시연 모드 계정은 앱 메모리(재실행 시 사라짐).
- D2 Release: `npm run release:d2`(시연) / `AID_RELEASE_API=http://127.0.0.1:3001 npm run release:d2`(실서버). 시뮬레이터 빌드는 로컬 임시 서명(키체인·알림 엔타이틀먼트 필요).
- UI 테스트: testMarketFlowD2(시연·실서버), testSessionRestoreD2·testAiLiveFlowD2(실서버), testDemoReleaseFlowD2·testLandingScrollD2·testCaptureOcrD2(시연).
