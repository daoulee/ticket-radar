# 협업 기록

### [AID-20261028-INIT-001] 리더 초기 확인과 문서 연결
- 날짜·시각·시간대: 2026-10-28 10:02:07 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / 환경 지침상 GPT-6 기반 Codex, 세부 모델 ID 확인 불가
- 수신 대상: 사용자 및 향후 담당자 Sol·Opus·Sonnet (수신 확인 없음)
- 작업 ID / 참조 기록: AID-INIT-001 / 이번 사용자 리더 운영 지시, RESEARCH E01~E07
- 유형: 확인
- 담당 파일·수정 범위: README.md, AGENTS.md, PLAN.md, SPEC.md, RESEARCH.md, memory.md, Communicate.md 신규 생성. 제품·기존 명세·포스터·공식 서식 수정 없음.
- 내용: 기존 공유자료를 문서 작업 대상으로 사용. 코드 저장소로 확정하지 않음. 기존 기획·명세를 중심으로 중복 본문을 줄이고 연결 문서를 추가. 역할은 제안이며 다른 AI 호출·메시지 전달·착수 완료를 주장하지 않음. 추천 첫 단계는 공연 1건 팬 점검 흐름, 범위 최종 승인 전. 기존 P0 제보함/AI 선택과 작성 신청서의 목표 차이를 기록.
- 실제 검증 근거: 기존 명세 전체 재독·파일 목록 확인. git rev-parse/status/branch/remote는 각각 exit 128로 저장소 아님. 공식 게시판 BBS_SEQ=128467 본문, 로컬 HWP 4개 본문과 신청서 PDF 텍스트 추출. 자료 출처와 원본 대조 한계는 RESEARCH에 기록. 생성 직후 문서 링크·원본 해시 검사는 별도 완료 항목으로 추가 예정.
- 남은 미확인 사항: 별도 코드·원안 목업/ZIP·접수 여부·최종 일정/평가/AI 세부 규칙·사용자 승인 범위·타 담당자의 실제 모델/도구. 제품 테스트/화면/배포/제출 증거 없음.
- 다음 행동: 문서·보존 검사 → 사용자 상태 보고 → 코드 위치/공식 운영 안내 확인 및 AID-CONTRACT-001 합의. PLAN의 미착수 제안 작업을 임의 실행 완료로 바꾸지 않음.

### [AID-20261028-INIT-002] 초기 문서 검사 완료
- 날짜·시각·시간대: 2026-10-28 10:02:28 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / 환경 지침상 GPT-6 기반 Codex, 세부 모델 ID 미확인
- 수신 대상: 사용자 및 향후 담당자 (수신 확인 없음)
- 작업 ID / 참조 기록: AID-INIT-001 / AID-20261028-INIT-001
- 유형: 완료
- 담당 파일·수정 범위: 공통 문서 7개 검사, Communicate.md에 검사 결과만 추가
- 내용: 초기 문서 연결·보존 작업 완료. 제품 구현 완료를 의미하지 않는다. 각 담당자 첫 작업은 제안 상태 유지.
- 실제 검증 근거: Python 표준 라이브러리 검사 exit 0. 기존 3개 파일 SHA-256 일치, 신규 7개 UTF-8 읽기 성공, 상대 링크 10개 대상 존재, 학번·휴대폰 패턴 미포함. README/SPEC/PLAN의 미확정·미실행 상태와 역할 표를 재독. 앱 테스트·빌드·화면·배포·제출은 검증하지 않음.
- 남은 미확인 사항: 초기 확인 항목과 동일. 공식 서식 사본 최신성·코드 경로·범위/일정/평가/AI 규칙 확인 필요.
- 다음 행동: 사용자에게 결과·추천 MVP·첫 작업 제안을 보고하고 코드 위치 및 최신 운영 안내를 확인한다.

### [AID-20261028-SETUP-001] AID 작업 루트와 기초 구조 생성
- 날짜·시각·시간대: 2026-10-28 10:05:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / 환경 지침상 GPT-6 기반 Codex, 세부 모델 ID 미확인
- 수신 대상: 사용자 및 향후 담당자 (타 담당자 수신 확인 없음)
- 작업 ID / 참조 기록: AID-SETUP-001 / AID-20261028-INIT-001~002, 사용자 디렉터리 세팅 지시
- 유형: 결정
- 담당 파일·수정 범위: /Users/daoule/Desktop/AID 전체 기초 구조·문서. 기존 공유 폴더는 README의 안내 추가와 Communicate 인계 기록 추가만 예정.
- 내용: 사용자가 제품 미구현을 확인하고 바탕화면 AID 생성·디렉터리/Markdown 세팅을 지시함. 이전 기록의 코드 위치 질문 해소. 공통 문서를 재사용하고 기존 명세·포스터 3개를 docs/reference에 복사. 프레임워크·패키지·Git 초기화·제품 구현은 미착수.
- 실제 검증 근거: 생성 전 AID 부재 확인, 기존 AGENTS/Communicate/memory/PLAN/SPEC/RESEARCH/README 재독. 생성 직후 기존 파일 해시 보존 확인. 새 구조·문서 링크·사본 동일성 검사 결과는 다음 완료 항목에 기록.
- 남은 미확인 사항: MVP 최종 범위·스택·공통 계약·공식 일정/평가/AI 세부 규칙.
- 다음 행동: 구조 검사 후 AID를 이후 작업의 기준으로 안내.

### [AID-20261028-SETUP-002] 디렉터리·문서 세팅 검증 완료
- 날짜·시각·시간대: 2026-10-28 10:05:17 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / 환경 지침상 GPT-6 기반 Codex, 세부 모델 ID 미확인
- 수신 대상: 사용자 및 향후 담당자 (타 담당자 수신 확인 없음)
- 작업 ID / 참조 기록: AID-SETUP-001 / AID-20261028-SETUP-001
- 유형: 완료
- 담당 파일·수정 범위: 새 작업 루트 구조·Markdown·기존 자료 사본 검사, 본 완료 기록 추가
- 내용: 디렉터리·기초 Markdown 세팅 완료. 제품 코드는 미구현 상태 유지.
- 실제 검증 근거: Python 검사 exit 0, Markdown 16개 UTF-8 읽기·상대 링크 15개 대상 존재 확인, 루트 필수 문서 7개 확인, 원본·사본 3개 SHA-256 일치, .git 없음 확인. 제품 테스트·빌드·UI 검증은 수행하지 않음.
- 남은 미확인 사항: 제품 범위·스택·공통 계약 및 공식 대회 세부 조건.
- 다음 행동: 사용자와 MVP/스택을 확정한 뒤 실제 구현 파일과 담당 범위를 정한다.

### [AID-20261028-WEB-001] 웹 담당 착수 보고와 담당 범위·API 필드 제안
- 날짜·시각·시간대: 2026-10-28 KST (UTC+09:00), 정확한 시각은 기록 시스템 미확인
- 작성자 / 실제 모델: Claude Code (웹 담당 "Opus 1" 역할로 지시받음) / claude-sonnet-5-5 (환경 보고 기준)
- 수신 대상: Astra (사용자 참조). Sol·Opus 2 수신 확인 없음, 연결·작업 중이라고 가정하지 않음.
- 작업 ID / 참조 기록: AID-WEB-001 / AID-20261028-SETUP-002, PLAN "AID 담당자별 첫 작업", SPEC T01~T07
- 유형: 착수·요청
- 담당 파일·수정 범위(제안): 이번 기록 외 파일 변경 없음. 코드 미작성. 웹 코드는 신규 `web/` 폴더(별도 package.json)를 제안. 테스트는 `web/` 내부. 백엔드·모바일 경로는 수정하지 않음.
- 확인한 실제 상태: AID 루트에 제품 코드·package.json·Git 없음(`git status` 실패). node v26.11.1, npm 11.20.0 사용 가능. `src/ui`·`src/domain`·`src/data`는 .gitkeep뿐. 스택은 PLAN/SPEC상 미확정.
- 기록 간 차이 보고:
  1. 역할: AGENTS.md/PLAN은 "Sonnet=UI, Opus=독립 검토"이나 이번 지시는 "웹=Opus 1, 모바일=Opus 2". 이번 지시를 따르되 AGENTS.md 역할표 정정이 필요.
  2. 경로: PLAN은 `src/ui/`를 Sonnet UI 후보로 예약. 웹이 `web/`를 쓰면 `src/ui/` 예약과 충돌하지 않지만 확정 필요.
  3. 스택: 기존 명세는 팬 화면을 Expo + React Native Web으로 제안. 그러면 웹과 모바일이 같은 코드를 쓰게 되어 이번 웹/모바일 분담과 맞지 않음.
- 웹이 필요로 하는 API 필드(제안, 확정 아님):
  - GET /events?q= → [{id, title, venue?, showtimes[{id, startsAt}], officialUrl, sourceCheckedAt, isDemo}]
  - GET /events/:id/official-context → {eventId, priceTiers[{seatGrade, showtimeId?, facePrice, sourceText, verifiedAt}], policies[{type, excerpt, sourceUrl, verifiedAt}], isDemo}
  - POST /checks 요청 → {eventId, listingText, confirmedFields?{showtimeId, seatGrade, price, quantity, deliveryMethod, prepaymentRequested}}
  - POST /checks 응답 → {extracted{필드별 {value|null, evidenceQuote, confidence?, status: extracted|unknown}}, findings[{type: price|policy|prepayment, status: matched|conflict|unverifiable|comparison_held, listingQuote, officialExcerpt, sourceUrl, checkedAt, reason}], priceComparison{diff, ratePercent}|{held:true, reason}, isDemo, dataMode}
  - 오류 형식 → {code, message, retryable}
  - 수정 후 재대조는 같은 POST /checks에 confirmedFields를 담아 호출하는 방식을 제안.
- 웹 화면 계획: 공연 선택 → 판매글 입력 → 추출값 확인·수정 → 대조 결과(원문 문구·공식 링크·확인 시각). 로딩/입력 오류/정보 부족/API 실패 상태, 데모 데이터 배지, 진위·사기·입장 확정 표현 금지.
- 실제 검증 근거: 파일 읽기·디렉터리 조회뿐. 테스트·빌드·화면 확인 없음.
- 남은 미확인: 웹 스택(Vite+React+TS 제안), 웹/모바일 코드 공유 여부, Sol의 계약 확정 시점, 시연용 공연 1건, 담당 폴더 승인.
- 다음 행동: 스택(웹 폴더/프레임워크)과 `web/` 경로 승인 대기. 승인 전 코드 작성·패키지 설치 없음. 승인 후 Sol 계약 전까지 위 필드 형태의 명시적 시연 fixture(isDemo=true)로 핵심 흐름을 먼저 구현하고 실제 연동 상태는 별도 표기.

### [AID-20261028-APP-001] 모바일 담당 착수 보고와 담당 범위·스택 결정 요청
- 날짜·시각·시간대: 2026-10-28 약 10:08 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (모바일 담당 "Opus 2" 역할로 지시받음) / claude-sonnet-5-5 (환경 보고 기준)
- 수신 대상: Astra (사용자 참조). Sol·Opus 1 수신 확인 없음, 연결·작업 중이라고 가정하지 않음.
- 작업 ID / 참조 기록: AID-APP-001 / AID-20261028-WEB-001, SETUP-002, PLAN, SPEC T01~T07
- 유형: 착수·요청
- 담당 파일·수정 범위(제안): 이번 기록 외 파일 변경 없음. 모바일 코드는 신규 `mobile/` 폴더(독립 프로젝트)를 제안. 테스트는 `mobile/` 내부. `web/`·백엔드·공통 문서(PLAN/SPEC/AGENTS)는 수정하지 않음. 계약 변경은 요청으로만 전달.
- 확인한 실제 상태: AID 루트에 제품 코드·Git 없음, `src/*`는 .gitkeep뿐. 이 Mac: Flutter 3.47.2(stable)·Xcode 27.1·iOS 시뮬레이터(iPhone 17 계열 등) 사용 가능, node v26.11.1. `flutter doctor`: Android 라이선스 미수락(Android SDK 36), `adb` 없음 → 현재 Android 빌드·실행 검증 불가. 실제 iPhone은 doctor가 무선 연결 오류를 표시(케이블·개발자 모드 확인 필요), 연결·실행은 미검증.
- 기존 기록의 스택 상태: 기존 명세 6절은 팬 화면을 Expo + React Native Web + TypeScript(PWA)로 **제안**(원안 목업 기반). 확정 아님. 설치된 Flutter는 이 문서의 후보가 아니며 임의 도입하지 않음.
- 기록 간 차이 보고:
  1. 스택: 명세는 Expo(RN) 한 코드로 웹·모바일 공유를 제안하나 이번 지시는 웹(Opus 1)·앱(Opus 2) 분담. WEB-001의 웹 Vite+React 제안과 합치면 Expo 선택 시 웹 코드 일부 공유 가능성 있음 → 공유 여부 결정 필요.
  2. 역할 표기: AGENTS.md는 Sonnet=UI·Opus=검토. 이번 지시(웹=Opus 1, 앱=Opus 2)와 다름(WEB-001과 동일 차이).
  3. 경로: `src/ui/` 예약과 `mobile/`은 충돌하지 않으나 승인 필요.
- 앱이 필요로 하는 API 필드: WEB-001 제안(GET /events, GET /events/:id/official-context, POST /checks 요청·응답, 오류 {code,message,retryable}, 수정 후 재대조는 confirmedFields를 담은 같은 POST)을 **동일하게 사용**하며 앱 전용 필드는 요청하지 않음. 추가 확인 요청: ① 필드값이 없을 때 null/누락 구분 ② findings.status·priceComparison 열거값 고정 ③ `dataMode`(demo/live) 값 ④ 모바일에서 접근 가능한 API 기본 URL(시뮬레이터 localhost, 실기기는 같은 LAN 주소 또는 HTTPS 필요) ⑤ CORS 불필요(네이티브) 확인.
- 앱 화면 계획: 공연 선택 → 판매글 붙여넣기 → 추출값 확인·수정(미확인 항목 강조) → 대조 결과(판매글 원문 인용·공식 출처 링크·확인 시각·보류 사유). 로딩/입력 오류/정보 부족/네트워크 실패(재시도) 상태, 데모 데이터 배지, 큰 글자(텍스트 스케일)·작은 화면 대응. 가격 계산·위험 판정은 앱에서 하지 않고 응답 표시만. 진위·사기·입장 가능 확정 표현 금지. 캡처 업로드·OCR·알림은 핵심 흐름 검증 후.
- iOS·Android에서 확인할 기능(계획): 텍스트 붙여넣기/키보드 가림, 외부 링크 열기, 큰 글자 설정, 작은 화면(SE급) 레이아웃, 오프라인/네트워크 실패. 실제 수행 전까지 미검증.
- 실제 검증 근거: 파일 읽기, `flutter doctor`, `simctl list`, 도구 버전 조회뿐. 테스트·빌드·화면 확인 없음.
- 남은 미확인: 모바일 스택 결정(Expo/RN vs Flutter), Android 검증 환경 마련 여부, 실기기 사용 가능 여부, Sol 계약 확정 시점, 시연 공연 1건, `mobile/` 승인.
- 다음 행동: 스택·`mobile/` 경로 승인 대기. 승인 전 프로젝트 생성·패키지 설치 없음. 승인 후 계약 전까지 WEB-001 필드 형태의 명시적 시연 fixture(isDemo=true)로 텍스트 붙여넣기 흐름을 먼저 구현하고 실제 API 연동 여부는 별도 표기.

### [AID-20261028-WEB-002] 웹 담당 의견: 스택·경로·계약 방식 (Astra 결정 요청)
- 날짜·시각·시간대: 2026-10-28 KST (UTC+09:00), 정확한 시각 미확인
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1) / claude-sonnet-5-5 (환경 보고 기준)
- 수신 대상: Astra. 사용자는 "사용자에게 묻지 말고 md에 남겨 Astra에게 보고"하라고 지시함. 수신 확인 없음.
- 작업 ID / 참조 기록: AID-WEB-001 / AID-20261028-WEB-001
- 유형: 의견·결정 요청
- 담당 파일·수정 범위: 이 기록만 추가. 코드·설치 없음.
- 의견:
  1. 웹은 `web/`에 Vite + React + TypeScript로 독립 개발 권장. 이유: 웹/모바일 담당이 분리돼 있고 Expo Web 공유 시 두 담당이 같은 파일을 건드려 "한 파일은 한 담당자" 규칙과 충돌. 모바일은 Opus 2가 별도 선택.
  2. 공통 계약은 TypeScript 타입 + Zod 스키마를 Sol이 `src/domain/contract`(경로는 Sol 제안)에 두고, 웹은 읽기 전용으로 가져다 쓰는 방식 권장. Sol 계약 전에는 WEB-001의 필드 형태로 `web/src/demo/` 에 isDemo=true fixture를 두고 계약 확정 시 교체.
  3. 규칙 판단(가격 비교·규정 충돌)은 웹에 구현하지 않고 서버 응답을 표시만 함. 단, API 미준비 시 시연 fixture는 이미 계산된 결과 형태로 두어 웹 전용 판단 규칙을 만들지 않음.
  4. 시연 공연 1건과 공식 URL·확인 시각은 사람 검증이 필요해 Astra/사용자 담당. 확정 전 fixture는 가상 공연명 + "시연용" 배지로 표시.
  5. AGENTS.md 역할표를 Opus 1=웹, Opus 2=모바일로 정정 요청.
- 진행 조건: Astra가 1~2번에 동의(또는 대안 제시)하는 기록을 남기면 즉시 `web/` 스캐폴딩과 시연 데이터 기반 핵심 흐름 구현에 착수. 기록이 없으면 AGENTS.md의 "스택은 사용자 결정" 규칙에 따라 코드를 작성하지 않음.
- 실제 검증 근거: 없음(의견). 테스트·빌드·화면 확인 없음.
- 미확인: Astra 응답, Sol 계약 일정, Opus 2 스택.

### [AID-20261028-APP-002] 모바일 담당 의견: 스택·경로 권고 (Astra 결정 요청)
- 날짜·시각·시간대: 2026-10-28 약 10:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (모바일 담당 "Opus 2") / claude-sonnet-5-5 (환경 보고 기준)
- 수신 대상: Astra (사용자 참조, 사용자 지시로 별도 질문 없이 기록으로 보고). 수신 확인 없음.
- 작업 ID / 참조 기록: AID-APP-002 / AID-20261028-APP-001, WEB-001
- 유형: 의견·결정 요청
- 담당 파일·수정 범위: 이번 기록 외 변경 없음. 코드·패키지 설치·프로젝트 생성 없음.
- 의견(권고, 확정 아님):
  1. 스택: **Expo + React Native + TypeScript** 권고. 이유: 기존 명세 6절 제안과 일치, 웹(Vite+React+TS 제안)과 요청/응답 타입·Zod 스키마를 공유할 수 있어 계약 불일치 위험이 줄어듦, iOS 시뮬레이터에서 바로 검증 가능. 한계: Android는 SDK 라이선스·`adb` 설정 전에는 검증 불가. Flutter는 설치돼 있으나 명세 이탈·웹과 계약 코드 공유 불가라 비권고.
  2. 경로: 앱은 `mobile/`(독립 package.json), 공유 타입이 필요하면 Sol 계약 확정 후 `shared/` 같은 별도 폴더를 Astra가 지정. `src/ui/` 예약 경로는 사용하지 않음.
  3. 계약 전 진행 방식: Astra 승인 즉시 WEB-001 필드 형태의 시연 fixture(`isDemo=true`, 화면에 "시연 데이터" 표시)로 텍스트 붙여넣기 흐름 구현. 앱 내 가격 계산·위험 판정 로직은 만들지 않고 응답 표시만. 실제 API 연동은 Sol 계약·서버 주소 제공 후 별도 전환·기록.
  4. 검증 범위 약속: 1차 보고는 iOS 시뮬레이터 + 단위/컴포넌트 테스트까지. Android·실기기는 환경 마련 전 "미검증"으로 기재. 빌드 성공만으로 실기기 동작 주장하지 않음.
- 요청: Astra는 ① 스택 ② `mobile/` 경로 ③ Android·실기기 검증 환경 마련 여부 ④ Sol 계약 확정 예정 시점을 이 기록 아래에 결정으로 남겨 달라. 결정이 없으면 코드 작성에 착수하지 않는다.
- 실제 검증 근거: 이전 기록(APP-001)의 확인 결과 외 추가 없음. 테스트·빌드·화면·실기기 검증 없음.
- 남은 미확인: Astra·Sol의 수신 여부, 사용자 최종 승인, 시연 공연 1건.
- 다음 행동: Astra 결정 기록 대기. 승인 기록이 확인되면 `mobile/` 생성과 시연 fixture 기반 구현 착수.

### [AID-20261028-ASTRA-003] WEB-002·APP-002 의견 검토와 작업 경계 결정
- 날짜·시각·시간대: 2026-10-28 10:25:18 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹 담당(Opus 1 역할)·앱 담당(Opus 2 역할). 이 파일에 기록했으며 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-CONTRACT-001 / AID-20261028-WEB-001~002, AID-20261028-APP-001~002, 사용자 지시(웹·앱 동시 구현, 웹 먼저)
- 유형: 결정·정정
- 담당 파일·수정 범위: AGENTS.md 역할/경로, PLAN.md 진행 방향, SPEC.md 계약 방향, README.md 현황, memory.md 인계, Communicate.md 본 기록. 제품 코드·기존 기획 사본 수정 없음.
- 내용: 웹은 `web/` Vite+React+TypeScript, 앱은 `mobile/` Expo+React Native+TypeScript로 분리한다. 웹 시연 흐름을 먼저 검증하고 앱을 병행한다. Sol은 두 화면이 사용할 공통 요청·응답 계약 및 서버의 가격·규정 판단을 소유한다. 정확한 Sol 코드 경로·패키지 구성은 Sol의 초안과 Astra 통합 검토에서 확정한다. 기존 `src/ui/`은 활성 화면 소유 경로가 아니다. 계약 전 웹·앱은 이미 계산된 합성 fixture로 독립 화면 작업을 시작할 수 있으며 `isDemo=true`와 시연 배지를 표시한다. 이 단계는 실제 API 연동 완료로 보고하지 않는다.
- 웹 담당 다음 작업: `web/` 스캐폴딩과 공연 선택→판매글 입력→추출값 수정→근거 결과의 반응형 시연. 웹 내부에 가격·규정 판정 로직을 중복 구현하지 않는다. 변경 파일·테스트·빌드·브라우저 화면 근거를 보고한다.
- 앱 담당 다음 작업: `mobile/` 스캐폴딩과 같은 흐름의 앱 시연. 1차는 iOS 시뮬레이터 검증을 목표로 한다. Android 라이선스/adb 및 실제 iPhone 연결은 환경 확인 후 별도 검증하며 확인 전 완료로 표시하지 않는다.
- Sol 다음 작업: WEB-001의 GET `/events`, GET `/events/:id/official-context`, POST `/checks`, 오류 형식을 바탕으로 버전 있는 계약 초안을 제시한다. `null`/생략, findings 상태, `dataMode`, confirmedFields 재대조, 모바일 API 기본 URL과 계약 소유 경로를 명시하고 T01~T07의 검증 기준을 연결한다. 계약 초안 제출은 앱 간 실제 연동 전 필수 의존성이다.
- 실제 검증 근거: AGENTS/Communicate/memory/PLAN/SPEC/RESEARCH와 파일 목록을 읽고 `web/`, `mobile/`, package.json, .git이 아직 없는 것을 확인했다. Vite 공식 가이드와 Expo 공식 모노레포/TypeScript 안내를 조회했다. 이번 턴 제품 테스트·빌드·화면·실기기·배포는 수행하지 않았다.
- 남은 미확인 사항: Sol의 실제 착수·모델·계약 일정, 데모 공연의 공식 근거, Android/실기기 환경, 실제 API 연동, 타 담당자의 본 기록 수신. 두 Claude Code 담당은 역할명 Opus 1/2와 달리 실제 모델을 `claude-sonnet-5-5`로 보고했다. Opus 사용은 확인되지 않았고 별도 세션 설정 확인이 필요하다.
- 다음 행동: 담당자가 이 결정을 읽고 착수·실제 모델·파일 범위를 기록한다. Astra는 Sol 계약 초안을 검토해 고정한 뒤 웹·앱의 동일 사례 결과를 직접 대조한다.

### [AID-20261028-ASTRA-004] 모델 변경 통보와 첫 구현 순서
- 날짜·시각·시간대: 2026-10-28 10:29:32 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹 담당·앱 담당. 문서 기록이며 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-CONTRACT-001, AID-WEB-001, AID-APP-001 / 사용자 모델 변경 통보와 구현 순서 질문
- 유형: 사용자 통보·실행 계획
- 담당 파일·수정 범위: PLAN.md 첫 구현 순서와 Communicate.md 본 기록. 제품 코드 변경 없음.
- 내용: 사용자는 웹·앱 담당 모델을 변경했다고 알렸다. 이전 `claude-sonnet-5-5` 기록은 과거 착수 시점의 실제 모델 보고로 유지한다. 변경 후 모델은 각 담당자가 다음 작업에서 직접 확인해 기록한다. 구현은 Sol 계약 v0와 합성 fixture → 웹/앱 독립 화면 → 실제 서버 로직·API 왕복 → 데모 공연 공식 근거·화면 검증 → 후속 기능/제출 준비 순으로 진행한다. 웹 브라우저 검증을 첫 기준점으로 하고 앱은 병행한다.
- 실제 검증 근거: 최신 AGENTS/Communicate/memory/PLAN/SPEC와 파일 목록을 읽었다. 제품 코드, `web/`, `mobile/`, Sol 계약 구현은 아직 확인되지 않았다. PLAN 변경 내용을 다시 찾았다. 테스트·빌드·화면·실기기 검증은 수행하지 않았다.
- 남은 미확인 사항: 변경 후 담당자 실제 모델·세션 착수, Sol 계약 경로/필드, 데모 공연 공식 자료, Android/실기기 환경, 최종 대회 일정.
- 다음 행동: Sol은 계약 v0와 소유 경로를 먼저 기록한다. 웹·앱 담당은 PLAN의 각 소유 경로에서 합성 fixture 기반 화면 작업을 시작하고 실제 모델·파일·검증 결과를 기록한다. Astra는 계약 및 첫 통합 결과를 검토한다.

### [AID-20261028-ASTRA-005] AGENTS 작업 규칙 정정
- 날짜·시각·시간대: 2026-10-28 10:30:01 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-CONTRACT-001 / AID-20261028-ASTRA-004
- 유형: 정정
- 담당 파일·수정 범위: AGENTS.md 협업·보호 규칙 두 문장, Communicate.md 본 기록. 제품 코드 수정 없음.
- 내용: ASTRA-004의 파일 범위에는 후속 AGENTS.md 변경이 빠져 있어 이를 정정한다. 최신 결정은 PLAN/Communicate를 따르며, 공통 계약 전에는 표시된 합성 fixture를 이용한 각 소유 경로의 독립 화면 작업만 병렬화한다. 실제 API 연동은 계약 합의 후 진행한다.
- 실제 검증 근거: AGENTS.md 해당 문구와 PLAN.md 첫 구현 순서가 같은 작업 경계를 가리키는지 재확인했다. 제품 테스트·빌드·화면 검증은 수행하지 않았다.
- 남은 미확인 사항: 타 담당자 수신·착수, 실제 모델, 계약·제품 구현 상태.
- 다음 행동: 각 담당자는 최신 AGENTS/Communicate를 재독하고 소유 범위 안에서 착수 기록을 남긴다.

### [AID-20261028-APP-003] 모바일 담당 착수: mobile/ Expo 스캐폴딩과 시연 fixture 흐름
- 날짜·시각·시간대: 2026-10-28 10:32:07 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (모델 변경 후 환경 보고 기준. APP-001~002는 claude-sonnet-5-5 시점 기록으로 유지)
- 수신 대상: Astra (사용자·Sol 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: AID-APP-001 / AID-20261028-ASTRA-003~005, PLAN "첫 구현 순서" 2단계
- 유형: 착수
- 담당 파일·수정 범위: 신규 `mobile/` 전체. 그 외에는 Communicate.md 기록 추가만. web/·Sol 경로·공통 문서 수정 없음.
- 내용: Expo + React Native + TypeScript로 `mobile/` 생성. Sol 계약 v0 전이므로 WEB-001 필드 형태의 **이미 계산된** 합성 fixture(isDemo=true)를 `mobile/src/demo/`에 두고 공연 선택→판매글 붙여넣기→추출값 확인·수정→근거 결과 흐름을 구현. 앱 안에 가격 계산·위험 판정 규칙을 만들지 않음. 데이터 접근은 API 어댑터 인터페이스 뒤에 두어 계약 확정 시 교체.
- 실제 검증 근거: 착수 기록. 결과는 완료 기록에 별도 작성.
- 남은 미확인: Sol 계약 v0, 데모 공연 공식 근거, Android/실기기 환경.
- 다음 행동: 스캐폴딩 → 화면 구현 → 테스트·타입검사 → iOS 시뮬레이터 확인 → 완료 기록.

### [AID-20261028-ASTRA-006] 통합 응답 검증 도구 착수
- 날짜·시각·시간대: 2026-10-28 10:32:44 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반 Codex, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹·앱 담당 (타 담당자 수신 확인 없음)
- 작업 ID / 참조 기록: AID-INTEGRATION-001 / ASTRA-003~005, 사용자 작업 진행 지시
- 유형: 착수
- 담당 파일·수정 범위: Astra가 `tests/integration/` 및 `evidence/logs/astra-integration-*`를 소유. SPEC 통합 검토 기준·README 실행 안내·memory·본 기록을 갱신. Sol의 계약/서버와 web/mobile 수정 없음.
- 내용: 최신 파일 목록에서 구현·계약이 아직 없음을 확인. Sol 산출물을 기다리는 동안 WEB-001의 응답 구조를 기준으로 독립 응답 검증기와 정상/거짓 데모 표시/보류/근거 누락 사례 검사를 준비. 이는 계약 초안 검토용이며 Sol이 확정할 타입·스키마를 대체하지 않는다. 공통 data/fixtures 대신 이 작업 소유 경로에 검증 샘플을 둔다.
- 실제 검증 근거: 적용 AGENTS·Communicate·memory·PLAN·SPEC·RESEARCH·README 재독, 파일 목록 확인. git status exit 128. 아직 제품 코드·패키지·실행 결과 없음.
- 남은 미확인 사항: Sol 계약 구조·서버 주소, 각 화면 실제 착수/모델, 공식 공연·대회 일정.
- 다음 행동: 검증기 구현·자체 테스트 → 실제 계약과 대조 → 서버 준비 시 실 API 왕복 검증. 자체 테스트를 제품 통과로 보고하지 않음.

### [AID-20261028-WEB-003] 웹 담당 구현 착수
- 날짜·시각·시간대: 2026-10-28 10:32 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (세션 환경 보고 기준, 모델 변경 후)
- 수신 대상: Astra (Sol·앱 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: AID-WEB-001 / AID-20261028-ASTRA-003~005
- 유형: 착수
- 담당 파일·수정 범위: `web/` 내부만 생성·수정. 루트 공통 문서·`mobile/`·Sol 경로는 수정하지 않음(이 기록 추가 제외).
- 내용: `web/` Vite+React+TS 스캐폴딩. Sol 계약 v0가 없으므로 WEB-001 필드 형태의 임시 타입을 `web/src/contract/`에 두고 계약 확정 시 교체. 합성 fixture(isDemo=true)는 이미 계산된 결과만 담고 웹 내부 가격·규정 판정 로직은 만들지 않음.
- 실제 검증 근거: 착수 기록. 결과는 완료 기록에 별도 작성.
- 남은 미확인: Sol 계약 v0, 데모 공연 공식 근거.
- 다음 행동: 스캐폴딩 → 화면 구현 → 단위 테스트·빌드 → Chrome/Safari 계열 브라우저 화면 확인 → 완료 기록.

### [AID-20261028-ASTRA-007] 통합 응답 검토 도구 자체 검증 완료
- 날짜·시각·시간대: 2026-10-28 10:34:59 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반 Codex, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹·앱 담당 (타 담당자 수신 확인 없음)
- 작업 ID / 참조 기록: AID-INTEGRATION-001 / ASTRA-006, WEB-003, APP-003
- 유형: 완료
- 담당 파일·수정 범위: tests/integration 4개 파일, evidence/logs/astra-integration-20261028.json, SPEC·PLAN·README·memory, 본 기록. web/mobile 및 Sol 코드 수정 없음.
- 내용: WEB-001 제안 응답의 데모 표시·unknown/null·근거·보류·유한수·가격 기대값을 검토하는 Python 표준 라이브러리 CLI 구현. 자기 테스트용 합성 응답만 사용. 계약 확정/서버 연동 완료가 아니다. APP-003·WEB-003을 실제 읽어 수신 확인하며 두 담당의 claude-opus-5-5 보고와 프로젝트 파일 생성 확인.
- 실제 검증 근거: unittest discover 12개 OK(exit 0); saved JSON CLI PASS(exit 0). 명령·시각·대상 파일 SHA-256 요약은 evidence/logs/astra-integration-20261028.json. 실제 HTTP 호출·제품 빌드·화면·실기기·배포·제출은 실행하지 않음.
- 남은 미확인 사항: Sol 계약/스키마·서버 주소, 웹·앱 구현 완료와 독립 QA, 공식 공연/대회 세부 조건.
- 다음 행동: Sol은 ASTRA-003/004에 따른 계약 v0의 소유 경로·필드/null·상태/dataMode·수정 후 재대조·오류·서버 주소를 기록한다. Astra는 이 검증기를 계약과 대조한 뒤 실제 서버 검증에 적용한다. 웹·앱은 원래 소유 범위의 화면 작업을 이어간다.

### [AID-20261028-WEB-004] 웹 핵심 흐름 1차 완료 보고 (시연 데이터, API 미연결)
- 날짜·시각·시간대: 2026-10-28 11:06 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (세션 환경 보고 기준)
- 수신 대상: Astra (Sol·앱 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: AID-WEB-001 / WEB-003, ASTRA-003~007, SPEC T01~T07
- 유형: 완료·계약 변경 요청
- 담당 파일·수정 범위: `web/` 내부만. 이 기록 추가 외 루트 문서·`mobile/`·`tests/integration/`(Astra 소유, 읽기·실행만) 수정 없음.
- 변경 파일: `web/` 신규 생성 — package.json·lock, vite.config.ts(Vitest 설정), playwright.config.ts, index.html, README.md(구조·구현 이유), .gitignore, src/contract/types.ts(임시 계약), src/api/{client,httpApi,demoApi,index}.ts, src/demo/fixtures.ts, src/components/{common,EventStep,OfficialPanel,ListingStep,ReviewStep,ResultStep}.tsx, src/ui/{format,fields}.ts, src/App.tsx, src/main.tsx, src/index.css, 테스트 src/App.test.tsx·src/api/httpApi.test.ts·src/demo/dump.test.ts, e2e/flow.spec.ts, 증거 evidence/screens/*·evidence/contract/*.json.
- 구현된 사용자 흐름: 공연 선택(검색·로딩·빈 결과·오류/재시도) → 공식 자료 패널(좌석별 가격·입장/양도 규정·근거 링크·확인 시각) → 판매글 입력(빈 입력·3000자 초과 안내, 시연 예시 3개) → 추출값 확인·수정(필드별 추출/후보/확인 불가 표시, 근거 문구, 직접 수정 표시) → 대조 결과(가격 비교 또는 보류 사유, 확인할 점마다 판매글 문구·공식 문구·근거 링크·확인 시각·이유, 고정 고지문). 수정 후 재대조 전에는 이전 결과를 "수정 전 값 기준"으로 흐리게 표시(T05). 공식 자료가 없는 공연은 확인 불가·가격 비교 보류. 판매글은 텍스트로만 렌더링(T07).
- 웹 판단 규칙 없음: 가격 차액·비율·규정 대조는 fixture에 미리 적은 값이며 웹은 계산하지 않는다. 시연 데이터에 없는 판매글·수정값 조합은 결과를 지어내지 않고 확인 불가/보류로 표시.
- 실행한 테스트·빌드 (2026-10-28 11:03~11:06 KST):
  - `npx tsc -b` 통과. `npm run build` 통과(JS 256.7kB/gzip 78.9kB).
  - `npx vitest run` 15개 통과(흐름·T01~T07 관련 사례·금지 표현 검사·HTTP 어댑터 오류 처리).
  - `npx oxlint` 경고 1건(App.tsx 첫 공연 목록 로드 effect의 setState, 동작 영향 없음 판단으로 유지).
  - `npx playwright test` 10개 통과: chrome-desktop(설치된 Google Chrome 1280px), chrome-mobile(Pixel 7), webkit-iphone(iPhone 14), webkit-ipad(iPad gen 7), firefox-desktop × [핵심 흐름, API 실패·재시도]. 가로 스크롤 없음·페이지 오류/대화상자 없음 확인.
- 직접 확인한 화면: Playwright 스크린샷을 열어 확인 — chrome-desktop 결과·수정 전 결과, chrome-mobile 추출값 확인, webkit-iphone 보류 결과, webkit-ipad API 실패. 실제 Safari 앱·실기기 화면은 확인하지 않음. WebKit 결과를 실제 iOS Safari 동작으로 주장하지 않는다.
- API 실제 연동: **없음**. `VITE_API_BASE_URL` 설정 시 HTTP 어댑터로 전환되며 단위 테스트(모의 fetch)만 수행. 실서버 왕복 미검증.
- Astra 검증기 대조: 웹 시연 응답 7건을 `web/evidence/contract/demo-check-*.json`으로 저장해 `tests/integration/check_api.py --response`로 실행 → 7건 FAIL. 원인 2가지뿐(임시 사본에서 두 항목만 바꾸면 7건 모두 통과): ① `findings.status`에 `needs_check` 사용(초안 밖) ② 근거 문구가 없을 때 `evidenceQuote: null`(검증기는 문자열 요구).
  - 이 과정에서 웹이 WEB-001 초안과 달랐던 2가지는 웹이 초안에 맞춰 수정함: 상태 `consistent`→`matched`, `priceComparison`을 `{held:true,reason}` | `{held:false, diff, ratePercent, ...}` 형태로 변경.
- Sol·Astra에 계약 결정 요청(웹은 임의 확정하지 않음):
  1. `findings.status`에 `needs_check`(공식 문구와 직접 충돌은 아니나 확인이 필요한 문구, 예: "입금 먼저", 현장 전달) 추가 여부. 없으면 해당 사례를 어떤 상태로 표현할지.
  2. 근거 문구 없음 표현: `null` vs `""`. 웹은 `null` 제안(앱 APP-001 ①과 같은 질문).
  3. 웹 제안 추가 필드: `notices: string[]`(화면 안내), `appliedFields`(대조에 사용한 확인값, 재대조 혼동 방지), `checkId`, `checkedAt`, finding `id`·`title`, `extracted.*.candidates`(모호한 후보), `priceComparison`의 `seatGrade/showtimeId/facePrice/listingPrice/sourceUrl/verifiedAt`.
  4. `deliveryMethod` 열거값(official_transfer, qr_capture, onsite_with_seller, paper_courier, other)과 `price`=1매 가격 정의.
  - 영향: 결정되면 웹은 `web/src/contract/types.ts`, fixture, 표시 문구만 바꾸면 된다. 앱도 같은 결정을 따라야 한다.
- 남은 문제: Sol 계약 v0·서버 주소 없음, 데모 공연의 실제 공식 근거 없음(가상 공연·example.com 링크), 실제 Safari·실기기·배포 미검증, 제보 화면 미착수(핵심 흐름 이후 단계).
- 다음 행동: Sol 계약 v0 확정 시 타입 교체·실서버 왕복 검증. 그 전에는 Astra 지시가 있으면 제보 화면(P0 후속) 착수. 실행: `cd web && npm install && npm run dev`.

### [AID-20261028-APP-004] 앱 핵심 흐름 1차 완료 보고 (시연 데이터, API 미연결)
- 날짜·시각·시간대: 2026-10-28 11:33 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (세션 환경 보고 기준)
- 수신 대상: Astra (Sol·웹 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: AID-APP-001 / APP-003, ASTRA-003~007, WEB-004, SPEC T01~T07
- 유형: 완료·계약 결정 대기 보고
- 담당 파일·수정 범위: `mobile/` 내부만. 이 기록 외 루트 문서·`web/`·`tests/integration/`(Astra 소유, 읽기·실행만) 수정 없음.
  - 정정: 시뮬레이터 캡처 4장을 처음에 루트 `evidence/screenshots/mobile/`에 저장했다가 소유 범위에 맞게 `mobile/evidence/screenshots/`로 옮기고 빈 폴더를 삭제함. 루트 evidence의 기존 파일은 건드리지 않음.
  - 정정: `create-expo-app`가 `mobile/.git`(템플릿 자동 커밋 1개, 원격 없음)을 자동 생성했음을 확인하고 삭제함. 현재 AID·web·mobile 모두 .git 없음.
- 변경 파일(신규): mobile/ package.json·lock, app.json(이름 티켓레이더, scheme ticketradar, bundle id dev.aid.ticketradar), tsconfig.json, eslint.config.js, .gitignore(+/ios /android), AGENTS.md·LICENSE(Expo 템플릿 기본 파일, 앱 폴더 지침으로 유지), README.md(구조·구현 이유·실행법), scripts/check-contract-copy.sh, src/app/{_layout,index,listing,review,result}.tsx, src/components/{common,EventList,OfficialSummary,ListingForm,ReviewForm,ResultView}.tsx, src/state/FlowContext.tsx, src/api/{client,demoApi,httpApi,index}.ts, src/ui/{display,theme}.ts, [웹 사본] src/contract/types.ts·src/demo/fixtures.ts·src/ui/{fields,format}.ts, __tests__/{demoApi,httpApi,display}.test.ts·flow.test.tsx, evidence/screenshots/ios-01~10.png, evidence/contract/*.json·validator-result.txt.
- 구조 판단: 웹과 같은 사례로 대조할 수 있도록 웹의 임시 계약·시연 fixture 4개 파일을 **사본**으로 둠(한 파일 한 담당 규칙 때문에 import하지 않음). 머리말에 출처를 적고 직접 수정하지 않음. `npm run check:contract`로 차이를 확인하고 `--sync`로 다시 복사. 11:30경 웹이 `consistent→matched`, `priceComparison {held}` 형태로 바꾼 것을 감지해 재동기화하고 앱 코드를 맞춤. 앱에는 가격·규정 판정 규칙 없음(응답 값 표시만, 시연 API는 미리 계산된 응답 조회만, 없는 조합은 보류).
- 구현된 사용자 흐름: 공연 선택(검색·로딩·빈 결과·오류/재시도) → 판매글 입력(공식 기준 요약·근거 링크·확인 시각, 빈 입력/3000자 초과 안내, 시연 예시 3개) → 추출값 확인·수정(필드별 추출/후보 여러 개/찾지 못함 표시, 판매글 근거 문구, 칩/숫자 입력, '모름'=미확인, 사용자 수정 표시, 잘못된 숫자 시 대조 차단) → 대조 결과(가격 비교 또는 보류 사유, 확인할 점마다 판매글 원문·공식 문구·출처 링크·확인 시각, 수정값 재대조 표시(T05), 원문 전체 보기, 고지문). 공식 자료 없는 공연은 확인 불가·가격 비교 보류. 모든 화면 상단에 시연 데이터 배지. 시연 모드 전용 '다음 대조 요청 실패' 도구로 네트워크 실패 화면 시연 가능. 판매글은 일반 Text로만 표시(T07). 큰 글자 배율 1.6 이상에서는 하단 고정 버튼을 본문 끝으로 이동.
- 실행한 테스트·빌드 (2026-10-28 11:30~11:32 KST 최종 실행):
  - `npx tsc --noEmit` exit 0, `npx expo lint` exit 0, `npx expo-doctor` 20/20 통과.
  - `npx jest` 4 suites / 32 tests 통과: 시연 API(T01·T02·T03·T05·T06, fixture 불변, 실패 1회), HTTP 어댑터(가짜 fetch: 오류 본문·형식 오류·네트워크 실패·5xx/4xx), 숫자 입력 해석, **실제 화면 파일 4개를 expo-router 테스트 라우터로 묶은 흐름 6개**(정상 결과·수정 후 재대조·잘못된 숫자 차단·빈 입력 미요청·네트워크 실패 후 재시도·공식 자료 없는 공연).
  - `npx expo run:ios` 개발 빌드: 1차는 RN 의존성 tarball 다운로드 실패로 xcodebuild 65, 재시도 시 Build Succeeded·iPhone 17 시뮬레이터(iOS 26.5) 설치·번들 성공. (Expo Go 방식은 'Fetching Expo Go'에서 6분 이상 진행 없어 중단.)
- iOS 시뮬레이터에서 직접 확인한 항목: 캡처를 열어 확인 — 공연 선택, 판매글 입력+공식 기준, 추출값 확인(시나리오 A), 결과(A: +76,000원/+49.4%·출처·확인 시각, B·C: 가격 비교 보류), 계약 재동기화 후 결과 A·C, 글자 크기 accessibility-XXXL에서 잘림 없음 및 하단 버튼 문제 발견→수정 후 재확인. **한계:** 이 Xcode에는 Simulator 화면 앱이 없고 탭 자동화 도구(idb 등)도 없어, 첫 화면 이후는 개발 빌드+시연 모드 전용 딥링크(`?demoScenario=A&demoStep=result`, 화면과 같은 createCheck 호출로 상태를 채움)로 이동해 캡처함. 시뮬레이터에서 손가락 탭·키보드 입력을 직접 확인한 것은 아니며 그 동작은 Jest 흐름 테스트로만 검증함.
- Android·실기기: **미검증**. Android SDK 라이선스 미수락·adb 없음. 실제 iPhone 미연결. 작은 화면(SE급) 시뮬레이터는 설치 목록에 없어 미확인.
- API 실제 연동: **없음**. `EXPO_PUBLIC_API_BASE_URL` 설정 시 HTTP 어댑터로 전환되도록만 구현(가짜 fetch 단위 테스트). 실서버 왕복 미검증. 실기기 연결 시 localhost 대신 LAN IP/HTTPS 필요.
- Astra 검증기 대조: 앱 시연 응답 11건을 `mobile/evidence/contract/`에 저장해 `tests/integration/check_api.py --response` 실행 → 11건 FAIL. 원인은 WEB-004 보고와 동일한 2가지(① findings.status `needs_check` 초안 밖 ② 근거 문구 없음 `evidenceQuote: null`). 웹과 같은 fixture이므로 같은 결과. 앱은 임의 변경하지 않고 WEB-004의 계약 결정 요청 1~4에 **동의·합류**함(앱 추가 요청 없음).
- 남은 문제: Sol 계약 v0·서버 주소, 위 계약 결정 2건, 실제 공연 공식 근거(현재 가상 공연·example.com), Android/실기기/작은 화면 검증, 시뮬레이터 탭 조작 직접 확인, 캡처 업로드·OCR·알림(핵심 흐름 이후), 개발 빌드 전용 딥링크는 계약 확정 후 유지 여부 재검토.
- 다음 행동: Sol 계약 v0 확정 시 사본을 Sol 계약으로 교체하고 `EXPO_PUBLIC_API_BASE_URL`로 실서버 왕복 확인. Android 환경(라이선스 수락·에뮬레이터) 또는 실기기 사용 가능 여부는 Astra/사용자 결정 필요. 실행: `cd mobile && npm install && npm test && npx expo run:ios`.

### [AID-20261028-ASTRA-008] 웹·앱 1차 독립 검토와 공통 계약 결정
- 날짜·시각·시간대: 2026-10-28 12:41:17 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹 담당·앱 담당. 문서 기록이며 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-INTEGRATION-001, AID-CONTRACT-001 / WEB-004, APP-004
- 유형: 검토·결정·수정 요청
- 담당 파일·수정 범위: Astra 소유 SPEC.md, tests/integration/check_api.py·test_review.py·README.md, evidence/logs/astra-review-20261028-1240.json, 본 기록. web/mobile 제품 코드 변경 없음.
- 내용: WEB-004·APP-004의 동일한 두 계약 쟁점을 해결했다. `needs_check`는 직접 충돌은 아니지만 판매글 문구에 추가 확인이 필요한 상태로 허용한다. `extracted.*.evidenceQuote`는 string|null이며 unknown에 원문 근거가 없으면 null, extracted/ambiguous에는 비어 있지 않은 원문 인용을 요구한다. `confirmedFields` 재대조, `appliedFields`, 1매 가격, 보류/계산 구분, demo/live 의미와 임시 타입의 추가 필드는 SPEC의 ‘Astra 계약 결정’ 절에 기록했다. Sol은 이를 계약 v0 타입·런타임 스키마·예시 JSON에 반영하거나 구체적 불일치를 Astra에 보고한다.
- 검토 결과: 저장된 웹 데스크톱·WebKit iPhone 결과 화면과 앱 iOS 시뮬레이터 일반/큰 글자 캡처를 열어 시연 표시·가격·근거·확인사항의 가시성을 확인했다. 웹 소스는 가격/규정 결과를 fixture에서 읽고, 앱은 같은 임시 사본과 표시 로직을 사용한다. 실제 AI 추출이나 API 판단으로 발표하면 안 된다.
- 직접 실행 근거: web `npm test` 15개 통과, `npm run build` 통과. mobile `npm run typecheck` 통과, `npm test -- --runInBand` 32개 통과, `npm run check:contract` 4개 사본 일치. Astra 검증기 테스트 16개 통과, 저장된 웹·앱 응답 JSON 18건 통과. 결과 요약은 `evidence/logs/astra-review-20261028-1240.json`에 기록했다. 첫 웹 테스트 시 잘못 전달한 `--runInBand` 옵션은 Vitest가 거부해 실제 `npm test`로 바로 재실행했다. 제품 결함으로 분류하지 않는다.
- 문제·담당·완료 기준: P0 Sol—계약/서버/실제 AI 추출·규칙 판단이 아직 없어 실 API 왕복 불가. 재현: 현재 두 화면은 demo 어댑터로 실행. 완료: Sol 타입·스키마·API와 T01~T07 관련 테스트, 웹·앱 동일 요청의 실제 HTTP 왕복. P1 웹·앱 담당—현재 HTTP 어댑터의 응답 검증은 최상위 필드만 확인함. 완료: Sol 런타임 스키마로 중첩 필드 검증하고 잘못된 응답을 성공 화면에 표시하지 않음. P1 사용자/Astra—현재 공식 출처는 가상 공연의 예시 링크임. 완료: 실제 공연의 공식 가격·규정 URL·확인 시각을 사람 검증 후 표시. P2 앱 담당—시뮬레이터 직접 탭·키보드/Android·실기기 미검증. 완료: 환경 마련 후 각 동작을 실제 수행해 기록.
- 남은 미확인 사항: Sol 착수·실제 모델·계약, 실제 AI 제공자/개인정보 전송 정책, 공식 공연 자료, 브라우저 실 API 화면, 앱 직접 터치·실기기·Android, 배포·대회 제출.
- 다음 행동: Sol 계약 v0 도착 시 SPEC 결정과 대조하고 서버 HTTP 응답에 Astra 검증기를 적용한다. 웹·앱 담당은 계약 확정 뒤 자체 계약 사본을 교체·중첩 검증을 추가하고 실제 API 왕복 결과를 보고한다.

### [AID-20261028-ASTRA-009] 공식 시연 공연 후보 조사
- 날짜·시각·시간대: 2026-10-28 12:42:29 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·Sol·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-DEMO-SOURCE-001 / ASTRA-008, RESEARCH E10
- 유형: 조사·후보 제안
- 담당 파일·수정 범위: RESEARCH.md E10과 본 기록. 제품·fixture 수정 없음.
- 내용: YES24의 2026 AKMU 대구 공연 공식 공지에서 회차·좌석별 공지 가격과 팬클럽 선예매 본인 확인 조건을 확인했다. 가격/규정 대조를 함께 보여줄 실제 공연 후보로 제안한다. 일반 예매·미성년 가족 명의 예외와 구분해야 하므로 제품 데이터로 아직 적용하지 않았다. 판매글 예시는 반드시 합성으로 표시한다.
- 실제 검증 근거: 공식 YES24 공지를 브라우징으로 열어 공연 일시·가격·선예매 본인 확인 문구를 확인했다. 링크와 범위는 RESEARCH E10에 기록했다.
- 남은 미확인 사항: 사용자 후보 선택, 최신 예매 페이지 변경·수수료·회차/좌석 조건, 제품 적용 및 실 API 연결.
- 다음 행동: 사용자 선택 후 Sol의 공식 데이터 입력 범위와 웹·앱 시연 fixture 전환을 조율한다. 공식 자료 검증 전 예시 링크를 실제 근거로 표시하지 않는다.

### [AID-20261029-ASTRA-010] Figma 모바일 목업 제작
- 날짜·시각·시간대: 2026-10-29 10:39:46 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-MOCKUP-001 / 사용자 목업 도구 선택 요청, 기존 웹·앱 시연 화면
- 유형: 시안 제작·검증
- 담당 파일·수정 범위: Figma 디자인 파일 `https://www.figma.com/design/yowOBv5AJHxweH2dFt0YUT`; 본 기록. 제품 코드·기존 포스터 수정 없음.
- 내용: Figma를 선택해 티켓레이더 ‘판매글 입력’과 ‘대조 결과’ 모바일 화면 2장을 제작. 기존 네이비·레이더 블루, 시연 데이터 고지, 가격 비교·공식 규정 충돌·추가 확인 결과를 반영했다. 제품 UI에 자동 동기화한 것이 아닌 검토용 목업이다.
- 실제 검증 근거: Figma 새 파일 생성, 컴포넌트 라이브러리 확인 후 버튼·입력 인스턴스 사용. 보드 940×932, 편집 가능한 TEXT 35·FRAME 17·INSTANCE 2·VECTOR 1, 전체 화면 이미지 노드 0. Noto Sans KR 아닌 글꼴 0. 보드 스크린샷을 열어 잘림·겹침 없이 두 화면을 확인했다.
- 남은 미확인 사항: 사용자 디자인 승인, 웹/앱 코드 반영, 실제 API/공식 공연 데이터, Figma 링크의 팀 공유 권한.
- 다음 행동: 사용자 피드백을 받아 색·문구·화면 밀도를 조정하고, 승인된 요소만 웹·앱 담당에게 변경 요청으로 전달한다.

### [AID-20261029-ASTRA-011] 전체 흐름 목업 보완
- 날짜·시각·시간대: 2026-10-29 10:49:16 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-MOCKUP-002 / 사용자 지적(기존 Figma 보드 한 장)
- 유형: 사용자 수정 요청 반영·목업 제작
- 담당 파일·수정 범위: `docs/mockups/ticket-radar-full-flow.html` 신규, README 목업 링크, 본 기록. Figma 기존 보드·제품 코드·포스터 수정 없음.
- 내용: 기존 Figma에는 입력·결과 화면만 한 보드에 있어 전체 제품 흐름이 보이지 않는다는 사용자 지적을 받았다. Figma Starter MCP 호출 한도에 걸렸고 Pen MCP는 연결이 닫혀 있어, 우선 로컬 HTML 목업에 모바일 4단계(공연 선택→판매글 입력→추출값 확인→대조 결과)와 웹 대조 화면을 구성했다. 버튼은 해당 단계 위치로 이동한다. 도구 업그레이드·결제는 하지 않았다.
- 실제 검증 근거: HTML 파서 읽기 성공, 파일 15,474바이트. 로컬 서버에서 Chrome으로 열어 접근성 트리에서 모바일 4단계·웹 영역과 단계 링크를 확인했고, 데스크톱 폭에서 두 영역의 실제 화면을 시각 확인했다. 공식 근거와 AI/API는 합성 시연 자료로 표시. 로컬 서버 시작에는 샌드박스 권한 승인이 필요해 승인된 명령으로 실행했다.
- 남은 미확인 사항: 좁은 실제 모바일 브라우저 렌더링, 사용자의 시안 승인, Figma/Pen에 전체 흐름 반영, 제품 코드 반영·실 API/AI 연동.
- 다음 행동: 사용자가 로컬 전체 흐름을 보고 구체적인 변경점을 알려주면 목업을 수정한다. Figma/Pen 호출이 다시 가능해질 때 편집형 원본에 동일한 흐름을 옮길 수 있다.

### [AID-20261029-ASTRA-012] Pen 편집형 목업 저장
- 날짜·시각·시간대: 2026-10-29 10:55:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-MOCKUP-003 / 사용자 Pen 구현 요청, ASTRA-011
- 유형: 목업 제작·검증
- 담당 파일·수정 범위: `docs/mockups/티켓레이더_전체흐름.pen` 신규, README 링크, 본 기록. 제품 코드·Figma 시안·포스터 수정 없음.
- 내용: Pen MCP의 `read_skill`·`get_app_state`는 앱 실행 전후 모두 `Transport closed`였다. 설치된 Pen 데스크톱 앱을 열고 공식 브라우저 가져오기 기능으로 로컬 HTML 목업을 캔버스에 재현했다. 기본 빈 프레임을 삭제하고 가져온 메인 프레임 이름을 ‘티켓레이더 · 모바일 4단계 + 웹 시안’으로 지정해 프로젝트 목업 폴더에 저장했다. 유료 업그레이드·외부 공유는 하지 않았다.
- 실제 검증 근거: Pen 창 제목과 URL이 `/Users/daoule/Desktop/AID/docs/mockups/티켓레이더_전체흐름.pen`으로 바뀌고 Edited 표시가 저장 후 사라진 것을 확인. 캔버스에서 모바일 4단계·웹 영역을 시각 확인했고 Layers 패널에서 각 `article` 화면과 별도 텍스트·카드 프레임을 확인했다. 전체 화면 이미지를 단일 레이어로 넣은 방식이 아니다.
- 남은 미확인 사항: Pen MCP 연결, 사용자 디자인 승인, Pen 공유 링크, 실제 제품 코드 반영·API/AI 연동. HTML의 링크 이동은 Pen 가져오기에서 인터랙션으로 유지되지 않을 수 있다.
- 다음 행동: 사용자가 Pen 파일을 열어 화면별 디자인을 검토하고, 확정한 변경점만 웹·앱 담당에게 전달한다.

### [AID-20261029-ASTRA-013] Pen MCP 연결 확인 및 화면 프레임 분리
- 날짜·시각·시간대: 2026-10-29 11:34:06 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·웹 담당·앱 담당. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-MOCKUP-004 / 사용자 MCP 연결 확인 요청, ASTRA-012
- 유형: 연결 확인·디자인 개선·검증
- 담당 파일·수정 범위: `docs/mockups/티켓레이더_전체흐름.pen` 내부 프레임 추가·수정, README 설명, 본 기록. 웹·앱 제품 코드·기존 Figma 시안 수정 없음.
- 내용: 앞선 `Transport closed` 상태와 달리 이번 Pen `get_app_state`, `read_skill`, `execute`가 정상 응답했다. Pen `pen-dev` 스킬의 schema/execute/mobile-app/web-app 안내를 읽고, 가져온 긴 원본 보드를 보존하면서 모바일 01~04 화면과 웹 05 결과를 각각 별도 최상위 프레임으로 복사·이름 지정했다. 웹 프레임의 하단 안내 일부가 약 0.4px 잘리는 문제를 부모·화면 높이 조정으로 수정했다. Pen 앱에서 저장했다.
- 실제 검증 근거: `get_app_state`가 열린 파일과 최상위 프레임 6개(원본+5화면)를 반환. `TakeScreenshot`으로 모바일 4개와 웹 결과를 확인했고, `Get` 방문자의 `problems` 검사에서 5개 독립 프레임 모두 잘림 0건. 저장 후 Pen 창의 `Edited` 표시가 사라졌다.
- 남은 미확인 사항: 사용자 디자인 승인, 실제 iPhone/Android UI와의 일치, 제품 코드 반영, Pen 외부 공유 링크. 독립 프레임은 정적 목업이며 HTML 단계 링크의 상호작용을 보존하지 않는다.
- 다음 행동: 사용자 의견을 받아 화면별 정보 우선순위·문구·밀도를 다듬고, 승인된 시안을 웹·앱 담당에게 전달한다.

### [AID-20261029-ASTRA-014] Pen 전체 화면 구성 확장
- 날짜·시각·시간대: 2026-10-29 11:54:45 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex Astra / GPT-6 기반, 세부 모델 ID 미노출
- 수신 대상: 사용자·웹 담당·앱 담당·Sol. 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: AID-MOCKUP-005 / 사용자 전체 화면 구성 요청, ASTRA-013, 기존 IA·MVP 범위
- 유형: 화면 설계·검증
- 담당 파일·수정 범위: `docs/mockups/티켓레이더_전체흐름.pen` 확장, `docs/mockups/티켓레이더_화면지도_미리보기.png`와 `SCREEN_MAP.md` 신규, README 링크, 본 기록. 제품 코드·기존 상세 명세·Figma 파일 수정 없음.
- 내용: Pen `pen-dev` 스킬의 schema/execute/mobile-app/web-app 지침을 적용했다. 기존 모바일 4개와 웹 결과 1개에 모바일 제보 자료 확인·공식 신고 안내 2개, 팬 웹 공연 선택·판매글 입력·추출값 확인 3개, 운영 웹 로그인·담당 공연·제보함·상세 검토 4개, 공통 상태 검색 없음·API 오류·가격 비교 보류·분석 중 4개를 추가했다. 범위 구분 화면 지도도 만들었다. 총 독립 화면 18개 + 지도 1개이며 가져오기 원본 보드는 보존했다. 후속 화면은 설계안으로 표시하고 실제 운영 연동을 주장하지 않는다.
- 실제 검증 근거: Pen `get_app_state`로 활성 파일과 신규 프레임 확인, 각 화면 `TakeScreenshot` 시각 확인. `Get` 방문자의 `problems`로 19개 신규 최상위 프레임의 잘림 0건, 최상위 프레임 겹침 0건을 확인했다. Pen 앱에서 저장 후 Edited 표시가 사라졌다. 화면 지도 PNG를 내보내고 로컬 이미지로 열어 확인했다.
- 남은 미확인 사항: 사용자 시안 승인, 화면 간 Pen 인터랙션 연결, 실제 웹·앱 코드 반영, 공식 공연 데이터·API·AI 실제 동작, 기기별 디자인 검증. 모든 새 화면은 정적 목업이다.
- 다음 행동: 사용자가 중요하게 보는 화면을 기준으로 정보 밀도와 문구를 다듬고, 승인된 화면만 각 개발 담당자에게 구현 요청으로 연결한다.

### [AID-20261029-ASTRA-015] 대회 핵심 흐름 최종 방향 반영
- 시각: 2026-10-29 12:17:59 KST
- 작성자/실제 모델: Astra 역할 / GPT-6 기반, 세부 ID 미노출
- 수신: 사용자·Sol·웹·앱 담당, 타 세션 수신 미확인
- 작업: CORE-002·WEB-005·APP-005 / 사용자 최종 우선순위
- 유형: 결정·인계·검증
- 범위: PLAN/SPEC 우선 결정, AGENTS 현황, RESEARCH, docs/CORE_DEMO_HANDOFF.md, docs/official/demo-event-akmu.json, 본 기록. 제품 코드 수정 없음.
- 결정: 실제 AI 새 문장 추출→확인/수정→공식 조건 대조를 웹 실제 API로 먼저 검증. 앱 후속 연결. 제보/OCR/수집/알림 보류. Sol은 shared/ 계약과 server/ 구현 담당으로 최우선 착수 요청. 제공자 교체형 추출 어댑터, AI 미설정 시 명시 오류, fixture로 조용한 대체 금지.
- 근거: 오늘 웹 테스트 15·빌드 통과, 앱 Jest 32 통과. demoApi의 문장 일치 fixture 조회를 소스에서 확인. 서버·실제 AI 구현과 Sol 착수 기록 없음. YES24 공식 공지 재확인. 사용자 신청서 PDF 2쪽 읽기/기획 페이지 렌더 확인, 일정·심사 배점 미기재.
- 미확인: 실제 AI/HTTP 왕복, 브라우저·기기 최신 실조작, 배포·제출, 최종 일정. AI 제공자·키 보유는 사용자 답변상 미정.
- 다음: Sol 인계물과 실제 모델/착수 기록 → Astra 계약 검토 → 웹 API 검증 → 앱. 3분 대본·실패 백업·검증 사례는 CORE_DEMO_HANDOFF에 기록.

### [AID-20261029-WEB-005A] 웹 담당 WEB-005 착수 (Sol 계약 전 준비 범위)
- 날짜·시각·시간대: 2026-10-29 12:25 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (세션 환경 보고 기준). 제품 AI 모델이 아니라 개발 에이전트 모델이다.
- 수신 대상: Astra (Sol·앱 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-005 / docs/CORE_DEMO_HANDOFF.md, ASTRA-008·015, SPEC "Astra 계약 결정"
- 유형: 착수
- 담당 파일·수정 범위: `web/` 내부만. `shared/`·`server/`(Sol), `tests/integration/`(Astra), `mobile/` 수정 없음.
- 확인한 상태: `shared/`·`server/` 없음, Sol 착수 기록 없음 → shared 계약 소비·실제 AI/HTTP 왕복은 지금 불가(의존성 미충족).
- 이번 범위(Sol 없이 가능한 것):
  1. HTTP 응답 **중첩 필드 런타임 검증**(SPEC 결정 1~6 기준, ASTRA-008 P1). 잘못된 응답은 성공 화면에 표시하지 않음. Sol 스키마 도착 시 교체.
  2. AI 오류(`AI_NOT_CONFIGURED`·시간 초과) 시 fixture로 대체하지 않고 오류·재시도 또는 **명시적 직접 입력**만 제공.
  3. 추출 방식(model/fixture/manual) 표시 자리. 필드명은 웹 제안이며 Sol 확정 시 교체.
  4. 웹 HTTP 경로를 실제 브라우저에서 확인하기 위한 `web/e2e/` 전용 **계약 모의 서버**. Sol 서버·실제 AI가 아니며 그렇게 보고하지 않음.
- 다음 행동: 구현 → 단위 테스트·빌드 → 브라우저(모의 서버 HTTP 모드) 확인 → 완료 기록.

### [AID-20261029-APP-006] 앱 APP-005 사전 준비 착수 (실 API 연결은 선행 조건 대기)
- 날짜·시각·시간대: 2026-10-29 12:26 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (세션 환경 보고 기준)
- 수신 대상: Astra (Sol·웹 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-005(준비분) / ASTRA-008 P1·P2, ASTRA-015, docs/CORE_DEMO_HANDOFF.md, SPEC 'Astra 계약 결정'
- 유형: 착수
- 담당 파일·수정 범위: `mobile/` 내부만. 예정: `src/api/validate.ts`(신규), `src/api/httpApi.ts`, `src/components/common.tsx`(오류 표시), `__tests__/validate.test.ts`(신규)·`httpApi.test.ts`, `README.md`. `web/`·루트 문서·`tests/integration/` 수정 없음(본 기록 추가 제외).
- 실제 상태 확인: `shared/`·`server/` 없음, Sol 착수 기록 없음, WEB-005 실제 왕복 기록 없음 → 인계 문서 순서상 APP-005 본작업(공통 계약 교체·실 API 연결)은 **시작 조건 미충족**. 웹 임시 계약 사본 4개는 12:2x 기준 원본과 일치(`npm run check:contract`).
- 이번 범위(독립 가능분): ① HTTP 응답을 최상위만이 아니라 SPEC 결정 1~6 기준 중첩 필드까지 검사해 잘못된 응답을 성공 화면에 표시하지 않음(ASTRA-008 P1). Sol 런타임 스키마가 오면 이 모듈을 교체한다. ② `AI_NOT_CONFIGURED`·AI 시간 초과 등 서버 오류를 fixture 성공으로 대체하지 않고 오류·재시도(재시도 가능 시만)로 표시하는지 확인·보강. ③ iOS 실제 탭/키보드 검증 도구 유무 재확인(설치는 하지 않음).
- 다음 행동: 구현 후 typecheck·lint·jest 결과와 남은 조건을 완료 기록으로 남긴다.

### [AID-20261029-SOL-001] CORE-002 공통 계약·API 구현 착수
- 날짜·시각·시간대: 2026-10-29T12:26:17+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 모델 ID 미노출
- 수신 대상: Astra·웹·앱 담당·사용자 (타 세션 수신 확인 없음)
- 작업 ID / 참조 기록: CORE-002 / ASTRA-015, docs/CORE_DEMO_HANDOFF.md, 사용자 본인 담당 진행 지시
- 유형: 착수
- 담당 파일·수정 범위: shared/ 공통 타입·Zod 런타임 스키마·예시 JSON; server/ 제공자 인터페이스·규칙·API·테스트·실행 안내; evidence/logs/sol-core-*; Communicate 추가. web/mobile 및 Astra 소유 테스트·루트 공통 문서는 수정하지 않음.
- 내용: API 3개와 수정 재대조를 구현. 후보 원문 구간 검증, 비교 전 공연/회차/좌석/단가/수수료/할인 확인, 선예매 규정 범위 보존. 미설정 AI_NOT_CONFIGURED, 오류를 fixture로 대체하지 않음. 기본 AI 호출 없음. Zod와 서버 개발용 TS/Node 타입만 로컬 의존성으로 설치, 글로벌 환경 변경 없음. 선택형 Ollama 어댑터는 공식 문서에 따라 준비하나 제품 제공자 선정·실제 모델 호출은 하지 않음.
- 실제 검증 근거: AGENTS/Communicate/memory/PLAN/SPEC/RESEARCH/인계·공식 JSON·웹 임시 계약·HTTP 어댑터 재독. shared/server 부재, git status exit 128. Zod/Ollama 공식 문서 확인.
- 남은 미확인 사항: 제품 AI 제공자·모델·설정, 실제 모델 호출/정확도, 브라우저/앱 연결·공식 데이터 예외 최종 검수.
- 다음 행동: 구현 및 단위·HTTP 테스트, 예시 응답/실행 근거 저장, Astra에 계약 차이·서버 기본 주소 인계.

### [AID-20261029-WEB-005B] WEB-005 준비 범위 완료 보고 (Sol 계약 소비·실 API 왕복은 대기)
- 날짜·시각·시간대: 2026-10-29 12:30 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 모델 아님)
- 수신 대상: Astra (Sol·앱 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-005 / WEB-005A, ASTRA-008 P1·015, docs/CORE_DEMO_HANDOFF.md, SPEC "Astra 계약 결정", SOL-001(읽기만)
- 유형: 완료(부분)·인계
- 담당 파일·수정 범위: `web/`만. 신규 src/contract/validate.ts·validate.test.ts, e2e/mock-api.mjs·http.spec.ts. 수정 src/api/{client,httpApi,demoApi}.ts, src/contract/types.ts, src/components/{common,ReviewStep}.tsx, src/App.tsx, src/demo/fixtures.ts, src/index.css, src/App.test.tsx, src/api/httpApi.test.ts, playwright.config.ts, README.md. `shared/`·`server/`(Sol)·`tests/integration/`(Astra)·`mobile/` 수정 없음.
- 구현:
  1. HTTP 응답 **중첩 검증**(SPEC 결정 1~6): 6개 추출 필드 모두 존재·value/status 일치·extracted/ambiguous 원문 인용 필수·**인용이 요청 판매글의 실제 구간인지**(추출·결과 모두), 결과 상태 열거값·conflict/matched/needs_check 인용 필수·공식 판단에 URL/확인 시각 필수, 보류/계산 구분·기준가 양수, demo⇒isDemo, appliedFields 키, 공연 목록·공식 자료 형식. 실패 시 `INVALID_RESPONSE`와 검증 문제 목록을 표시하고 결과 화면으로 가지 않음.
  2. 추출 실패(`AI_NOT_CONFIGURED`·시간 초과·잘못된 응답)는 fixture 결과로 대체하지 않음. 오류·재시도(재시도 가능 시)와 사용자가 누르는 "AI 추출 없이 직접 입력"만 제공 → 빈 값에서 입력 후 서버에 confirmedFields로 대조.
  3. 3단계에 추출 방식 표시: AI 모델(제공자·모델) / 시연 fixture 조회·AI 호출 없음 / 직접 입력 / 정보 없음.
  4. 어댑터 연결 방식 이름을 `demo|http`로 바꿔 결과의 `dataMode`(demo/live)와 분리(SPEC 결정 5). HTTP 연결 시 상단은 "HTTP API · 시연 여부는 결과별 표시".
  5. 시연 fixture의 결과 인용 4건이 원문 구간이 아니었음("사용자 입력 154,000원" 등) → 실제 원문 구간으로 정정하고 사용자 입력값은 이유 문장에 표기.
- 검증 (2026-10-29 12:27~12:30 KST):
  - `npx tsc -b` 통과, `npm run build` 통과, `npx oxlint` 경고 1건(기존과 동일, 첫 목록 로드 effect).
  - `npx vitest run` 4 files / 34 tests 통과 (신규: 시연 응답 전부 검증 통과, 잘못된 응답 15종 거부, AI 미설정→직접 입력, 추출 방식 표시, HTTP 중첩 오류 상세).
  - `npx playwright test` 16개 통과: 기존 시연 흐름 5개 브라우저 구성 × 2 + **HTTP 모드**(Chrome 설치본, WebKit iPhone 14) × 3 — ① 새 문장 입력→HTTP 추출(원문 인용)→좌석 수정→서버 대조→가격 재수정→재대조, 요청 3건과 마지막 confirmedFields(price 200000) 확인, 적용값이 수정값으로 표시 ② AI_NOT_CONFIGURED→결과 없음→직접 입력→대조 ③ 원문에 없는 인용 응답→INVALID_RESPONSE, 결과 화면 미표시. 브라우저 cross-origin(5181→5180) fetch·CORS 경로 포함.
  - HTTP 상대는 `web/e2e/mock-api.mjs` **계약 모의 서버**이며 Sol 서버·실제 AI가 아니다(판단 없이 확인값을 appliedFields로 돌려줌).
  - 직접 열어 확인한 화면: http-chrome 추출값 확인(h1)·AI 미설정(h3), http-webkit-iphone 잘못된 응답(h4). 실제 Safari 앱·실기기 미확인.
  - Astra 검증기 `tests/integration/check_api.py --response`로 웹 시연 응답 7건(`web/evidence/contract/`) 재실행 → 7건 PASS(exit 0).
- 미충족(의존성): Sol `shared/` 계약 소비, 실제 서버·실제 AI 왕복, 공식 공연 데이터 화면 반영 — SOL-001 진행 중, 인계 기록 없음.
- Sol 초안 사전 확인(읽기만, `shared/index.ts` v0.1.0 작업 중): 웹 교체 시 반영할 차이 — `extraction.mode`→`method`+`actualModelCall`, `provenance` 추가, ListingFields에 `listingEventId·bookingType·priceBasis·feeBasis·discountStatus` 추가, 요청 `extractionMode:'manual'`·`previousCheckId`, OfficialContext `sourceType·sourceVersion`, 정책 `scope`. 웹의 직접 입력은 Sol 계약의 `extractionMode:'manual'`로 보내도록 바꿀 예정. 인계 전이라 웹은 아직 바꾸지 않음.
- 다음 행동: Sol 인계(계약 경로·버전·서버 주소·CORS 출처) 기록 확인 즉시 ① `web/src/contract/types.ts`·`validate.ts`를 shared 스키마로 교체 ② 추가 필드 입력 UI ③ `VITE_API_BASE_URL`로 실서버 왕복을 Chrome·WebKit에서 실행하고 영상·스크린샷·명령 결과를 기록.

### [AID-20261029-APP-007] 앱 APP-005 사전 준비 완료 (중첩 응답 검사·AI 오류 표시·추출 방식 표시)
- 날짜·시각·시간대: 2026-10-29 12:32 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (세션 환경 보고 기준). 개발 에이전트 모델이며 제품 AI 모델이 아니다.
- 수신 대상: Astra (Sol·웹 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-005(준비분) / APP-006(착수), ASTRA-008 P1, ASTRA-015, WEB-005A, SOL-001, CORE_DEMO_HANDOFF, SPEC 'Astra 계약 결정'
- 유형: 완료(준비 범위)·의존성 대기
- 담당 파일·수정 범위: `mobile/` 내부만. 신규 `src/api/validate.ts`, `__tests__/validate.test.ts`, `__tests__/httpFlow.test.tsx`, `evidence/logs/app-006-checks.txt`. 수정 `src/api/httpApi.ts`, `src/api/client.ts`(ApiError.details), `src/api/demoApi.ts`(extraction=fixture), `src/ui/display.ts`(extractionModeText), `src/app/review.tsx`(추출 방식 줄), `__tests__/httpApi.test.ts`·`flow.test.tsx`, `README.md`. 웹 사본 `src/contract/types.ts`·`src/demo/fixtures.ts`는 스크립트로 재동기화만(직접 수정 없음). `web/`·`shared/`·`server/`·`tests/integration/`·루트 문서는 수정 없음(본 기록 추가 제외). 착수 기록의 `components/common.tsx` 수정은 불필요해 하지 않음.
- 구현 내용:
  1. **중첩 응답 검사**(ASTRA-008 P1): HTTP 성공 응답을 표시 전에 검사 — 필드 형식·열거값(status·type·deliveryMethod·extraction.mode), 요청한 eventId와 일치, extracted/ambiguous의 `evidenceQuote`가 비어 있지 않고 **보낸 판매글의 실제 구간**, unknown이면 value null, finding의 `listingQuote`도 원문 구간, `needs_check`는 원문 인용 필수, 확인값을 보냈으면 `appliedFields`가 **보낸 값과 동일**(이전 값으로 되돌아간 응답 거부), 확인 전에는 `priceComparison.held=true`·`appliedFields=null`, `dataMode=demo`⇔`isDemo=true`. 어긋나면 `INVALID_RESPONSE`(재시도 불가) 오류 화면, 세부 위치는 `ApiError.details`. 판정 규칙이 아닌 계약 검사이며 Sol 런타임 스키마 도착 시 교체한다.
  2. **AI 오류 표시**: 실제 API 모드에서 서버 오류 본문(`AI_NOT_CONFIGURED` 등)을 그대로 표시하고 `retryable`일 때만 '다시 시도'. 시연 데이터로 대체하는 경로 없음(모드는 시작 시 `EXPO_PUBLIC_API_BASE_URL` 유무로 하나만 선택). 실제 API 모드에서는 시연 예시 버튼 숨김(기존 동작, 테스트로 확인).
  3. **추출 방식 표시**: 웹이 12:2x에 계약 사본에 추가한 선택 필드 `extraction {mode, provider, model}`을 재동기화로 받아, 추출값 확인 화면에 웹 `ExtractionLine`과 같은 문구로 표시('AI 모델 추출 · 제공자 모델 · 추출값은 후보입니다' / '시연 fixture 조회 · AI 호출 없음' / 'AI 추출 없음 · 사용자가 직접 입력' / 응답에 없으면 '추출 방식 정보 없음'). 시연 API는 웹과 같이 `mode: 'fixture'`를 돌려준다. 같은 재동기화로 웹이 고친 fixture의 판매글 인용(실제 원문 구간)도 반영됨.
- 실행한 테스트·빌드 (12:29 KST, 결과 `mobile/evidence/logs/app-006-checks.txt`): `npx jest` 6 suites / **49 tests 통과**(기존 32 → 49). `npm run typecheck` exit 0, `npm run lint` exit 0, `npm run check:contract` 4개 일치. 신규 테스트: 모든 시연 응답(3사례 추출·대조·미준비 조합·공식 자료 없음·예시 아닌 글)이 검사 통과 / 원문에 없는 인용·빈 인용·unknown인데 값 있음·수정값 미적용·확인 전 계산·needs_check 인용 없음·다른 공연·demo 표시 불일치·잘못된 extraction.mode 거부 / 화면: 가짜 서버로 AI_NOT_CONFIGURED(재시도 버튼 없음·입력 화면 유지·요청 1회), AI_TIMEOUT 후 재시도 성공, 원문에 없는 인용 응답 차단, 추출 방식 '정보 없음'·model 표시.
  - `npx expo-doctor`: 19/20. 실패 1건은 어제 이후 나온 Expo SDK 58 **패치 버전** 차이(expo 58.0.20→21, expo-router 27→28 등 5개). 이번 변경과 무관하며, 업그레이드 시 iOS 재빌드가 필요해 이번에는 올리지 않음.
- iOS·Android·실기기: 이번에는 **빌드·시뮬레이터 실행 안 함**(화면 1줄 추가는 Jest로만 확인). 탭 자동화 도구 재확인: idb·maestro·applesimutils 모두 없음, 부팅된 시뮬레이터 없음. 설치하지 않음 → iOS 실제 탭/키보드 검증은 여전히 미수행. Android·실기기 미검증.
- API 실제 연동: **없음**. 모든 HTTP 테스트는 가짜 fetch. SOL-001(12:26 착수)로 `shared/`(index.ts, Zod)·`server/`가 생기는 중임을 확인했으나 미완료로 보고 소비하지 않음.
- 웹과의 관계: WEB-005A와 같은 SPEC 기준으로 같은 범위를 독립 구현함(앱은 웹 파일을 import하지 않음). 두 검사기는 Sol 스키마로 교체될 임시물이며, 차이가 생기면 Sol 스키마가 기준.
- Sol·Astra 전달 사항(계약 영향):
  1. 앱은 Sol의 `shared/` Zod 스키마를 그대로 쓰고 싶다. React Native(Metro)는 `mobile/` 밖 파일을 기본으로 번들하지 않으므로 ⓐ 앱이 `metro.config.js`의 watchFolders로 `../shared`를 참조하거나 ⓑ 기존처럼 스크립트 사본을 둔다. `shared/`가 Node 전용 API 없이 순수 TS+Zod이면 ⓐ가 가능하다. 앱 쪽 Zod 의존성 추가가 필요하며 Sol의 Zod 버전을 알려 주면 맞춘다.
  2. `extraction`(웹 제안) 필드와 AI 오류 코드명(`AI_NOT_CONFIGURED`, 시간 초과 코드)을 Sol 계약에서 확정해 주면 앱 표시를 맞춘다. 현재 앱은 코드명과 무관하게 서버 `message`·`retryable`을 따른다.
  3. 실기기 연결용 서버 주소는 localhost가 아닌 LAN IP 또는 HTTPS가 필요하다(서버가 0.0.0.0 바인딩 필요).
- 남은 문제: Sol 계약·서버 완료 및 WEB-005 실제 왕복 통과(인계 순서상 APP-005 본작업의 시작 조건), 공통 계약 사본 교체, 실제 API 왕복, iOS 실제 탭/키보드 검증 도구, Android·실기기, Expo 패치 업데이트 시점(시연 전 재빌드와 함께 할지 Astra 판단), 실제 공연(AKMU) 데이터 반영은 Sol/웹 fixture 확정 후.
- 다음 행동: SOL 완료 기록과 WEB-005 실제 왕복 기록이 생기면 APP-005 본작업 착수(공통 계약 교체 → `EXPO_PUBLIC_API_BASE_URL`로 iOS 개발 빌드 실서버 왕복 → 새 문장 입력·수정·재대조 확인 → 증거 저장). 그 전에는 추가 착수 없이 대기.

### [AID-20261029-SOL-002] CORE-002 계약·서버 기반 구현과 HTTP 검증 인계
- 날짜·시각·시간대: 2026-10-29T15:59:19+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 모델 ID 미노출. 제품 AI 제공자·모델과 구분.
- 수신 대상: Astra·웹 담당·앱 담당·사용자. WEB/APP의 사전 준비 기록을 실제 읽었음; 본 완료 기록의 타 세션 수신 확인은 아직 없음.
- 작업 ID / 참조 기록: CORE-002 / SOL-001, ASTRA-015, CORE_DEMO_HANDOFF, SPEC 계약 결정, 웹·앱 사전 준비 기록
- 유형: 완료(계약·서버 기반 범위)·검증·연동 요청
- 담당 파일·수정 범위: shared/ 10개 파일(스키마/타입·패키지/lock·README·예시 JSON 6개), server/ 17개 파일(패키지/lock·tsconfig·env 예시·src 7개·테스트 3개·스크립트 2개·README), evidence/logs/sol-core-*·본 기록. web/mobile·Astra 검증기·루트 PLAN/SPEC/memory는 수정하지 않음.
- 내용:
  1. 계약 v0.1.0 단일 소유 위치 shared/index.ts. 런타임 Zod 4.6.7, Node API 없는 순수 TS+Zod. CheckRequestInput(원시 요청)/CheckRequest(파싱 후)/CheckResponse와 EventListSchema·OfficialContextSchema·CheckResponseSchema·ApiErrorBodySchema를 export. 공유 패키지 안내 shared/README.md. Astra 검토 대상이며 전체 CORE-002의 실제 AI 완료로 표시하지 않음.
  2. 기존 6개 추출/확인 필드에 listingEventId·bookingType·priceBasis·feeBasis·discountStatus·buyerIsBooker 추가. 확인 요청에서 추가 필드 미입력은 null→비교 보류. 화면이 선택 공연/단가/수수료/할인 일치를 자동 확인으로 채우지 않도록 요청. unknown/null·ambiguous 후보·needs_check·명시 적용값·선예매 scope를 보존.
  3. API: GET /events?q=, GET /events/:id/official-context, POST /checks. 성공 래퍼 없음. 1차 model 추출은 confirmedFields 없이 보류. 수정 시 동일 원문/합성 여부와 previousCheckId+confirmedFields 전체 스냅샷으로 재대조. 원래 extracted를 유지하고 appliedFields는 새 확인값. 재사용은 15분·최대 100개 메모리, 재시작/만료/원문 변경 시 409.
  4. 추출 인터페이스와 선택형 로컬 Ollama 어댑터 준비. 기본 none, 미설정 AI_NOT_CONFIGURED(503), AI_TIMEOUT(504), AI_PROVIDER_ERROR/AI_INVALID_RESPONSE/AI_UNGROUNDED_RESPONSE(502). 오류를 fixture 성공으로 바꾸지 않음. 명시적 extractionMode=manual은 confirmedFields를 요구하며 후보 unknown·method=manual, AI 호출 없음으로 표시. 유료/제품 모델 호출·모델 다운로드 없음.
  5. extraction는 기존 화면의 mode가 아니라 method/model/provider/actualModelCall/reused. actualModelCall은 이번 요청 기준이며 재사용 때 false. provenance는 syntheticListing·officialSourceType·sourceVersion을 구분. 합성 입력/fixture가 있으면 dataMode=demo·isDemo=true. 실제 HTTP 연결과 데이터 모드를 혼동하지 않음.
  6. 공식 AKMU 공지 스냅샷을 서버에 연결. 수수료·할인 제외 티켓 1매 기본가 조건에서만 비교하고 기준 불일치/미확인은 숫자 없이 보류. 선예매 유형 미확인은 확인 필요, 일반예매에는 선예매 규정 적용 안 함. 원본 SHA-256과 날짜 단위 확인일(2026-10-29)을 보존하며 정확한 시각을 만들지 않음. Sol이 공식 출처를 새로 검증한 것은 아님.
- 실제 검증 근거:
  - server npm run typecheck exit 0; npm test 33개 통과(핵심/스키마/제공자 모의 24개+실 로컬 HTTP 9개). 로그 evidence/logs/sol-core-tests-20261029.txt·sol-core-typecheck-20261029.txt. 테스트의 AI는 fixture/모의 fetch, 실제 AI 성능 증거가 아님.
  - 별도 실행 서버 http://127.0.0.1:3001에 Python 실제 HTTP: 공연 200·공식 정보 200·미설정 모델 요청 503·명시 수동 대조 200, 단가 250000/기준 176000/차액 74000. saved responses와 SHA-256 요약 evidence/logs/sol-core-20261029.json 및 sol-core-http-*.json. smoke는 /health aiConfigured=false 사전 검사 후 진행.
  - npm run examples exit 0, Astra 검증기에 shared/examples/manual-response.json을 읽기 전용으로 넣어 PASS. 링크·예시/근거 JSON 검사 통과.
  - 초기 테스트 1건은 잘못된 테스트 입력을 helper가 먼저 파싱한 문제: raw 잘못된 입력을 직접 구성해 수정, 기대값 변경 없음. 최종 로그 저장 과정의 로컬 소켓 EPERM은 샌드박스 제약이며 동일 명령 권한 승인 후 재실행 통과. 실패 로그는 sol-core-tests-sandbox-failure-20261029.txt 보존. Python 별도 HTTP EPERM도 승인 후 동일 검증으로 재실행.
- 남은 미확인 사항: 실제 모델 선정/호출/추출 정확도·언어 표현 범위, Astra 독립 계약 검토, shared의 Vite/Metro 소비 및 웹/앱 실제 왕복, 실제 기기·배포·대회 제출. 근거 검사는 보수적 제한 검증이며 의미적 완전성/주입 완전 방어를 주장하지 않음.
- 다음 행동:
  - Astra: shared/README와 계약 추가 조건 검토, CORE_DEMO_HANDOFF/memory 최신 상태 반영, 독립 사례로 API 확인.
  - 웹 담당: file:../shared 또는 소스 참조로 계약 소비, Zod 중첩 검사, 추가 조건 입력·extraction.method/provenance 표시, previousCheckId 재대조 연결. 현재 개발 API http://127.0.0.1:3001, 허용 CORS http://localhost:5173·http://127.0.0.1:5173. 실제 AI 전에는 오류와 명시적 수동 흐름만 검증 가능. 모델 설정 후 서버 재시작 필요.
  - 앱 담당: 웹 왕복 통과 후 동일 계약 소비. shared는 Node 의존성 없음; Metro watchFolders/로컬 의존성은 앱 담당 소유에서 검증. 실제 기기는 확인된 LAN/HTTPS 주소와 별도 바인딩 필요(기본 루프백).
  - 사용자/Astra: 제품 제공자·모델·실행 위치/비용을 정한 후 해당 어댑터로 실제 새 문장 추출 검증. 키 값은 채팅/기록에 넣지 않음.

### [AID-20261101-SOL-003] 최신 기록 확인·계약 수정 대응 경계와 AI 미정 유지
- 날짜·시각·시간대: 2026-11-01T22:51:43+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 모델 ID 미노출. 대화 제목의 6.1SOL은 사용자 지정 명칭이며 실제 모델 버전 확인 근거로 사용하지 않음.
- 수신 대상: Astra·웹·앱 담당·사용자 (타 세션 수신 확인 없음)
- 작업 ID / 참조 기록: CORE-002 계약 검토 대응 / SOL-002, ASTRA-008·015, 사용자 2026-11-01 지시
- 유형: 확인·응답
- 담당 파일·수정 범위: Communicate.md 추가 기록만. shared/server/web/mobile·AI 환경설정·기존 증거 파일 변경 없음.
- 내용: 최신 기록은 SOL-002이며 그 이후 Astra의 계약 검토 결과·새 수정 요청은 아직 없음. 기존 ASTRA-008/SPEC 결정은 SOL-002 구현에 이미 반영된 상태로 확인. 리뷰가 없는데 승인·수정 요구를 추정하지 않음. 향후 구체적 Astra 검토 항목을 읽으면 Sol 소유 shared/server 안에서 재현→수정→관련 회귀 검증→추가 기록으로 대응하고 웹/앱 소유 파일은 수정하지 않음. AI 제공자·모델 미정 유지, 실제 모델/유료 API 호출·fixture 대체·자동 수동 전환·서버 재시작 없음.
- 실제 검증 근거: AGENTS·최신 Communicate·memory·CORE_DEMO_HANDOFF·PLAN/SPEC/RESEARCH 관련 절·실제 shared/server 코드를 재독. git status exit 128(미초기화). Node 직접 검사 exit 0: providerFromEnv({})와 providerFromEnv({EXTRACTION_PROVIDER:'none'})는 null, new CheckService(null)의 정상 추출 요청은 AI_NOT_CONFIGURED/503 거부. HTTP·제공자·fixture 호출 없이 실행. 전체 33개 테스트는 이번에 재실행하지 않았고 이전 성공 기록과 구분함.
- 남은 미확인 사항: Astra의 v0.1.0 독립 검토, 웹·앱 실제 계약 소비/연동, 제품 AI 선정·호출. AGENTS/memory/CORE_DEMO_HANDOFF에는 여전히 shared/server 없음이라는 과거 현황이 남아 실제 파일·SOL-002와 다름; 루트 문서 소유자인 Astra가 갱신할 사항으로 보고.
- 다음 행동: Astra는 SOL-002·shared/README 기준으로 검토 결과와 요구 수정 범위를 기록. Sol은 그 기록을 실제 확인한 뒤 해당 변경과 검증을 수행. 추가 기록이 자동 전달되거나 지속 감시되는 것으로 주장하지 않음.

### [AID-20261101-WEB-005C] WEB-005 본작업 착수: shared 계약 교체·실서버 연결
- 날짜·시각·시간대: 2026-11-01 22:52 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra·Sol (앱 담당 참조). SOL-002를 실제로 읽어 수신 확인함. 본 기록의 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-005 / SOL-002, shared/README.md, server/README.md, CORE_DEMO_HANDOFF, WEB-005B
- 유형: 착수
- 담당 파일·수정 범위: `web/`만. `shared/`·`server/`는 읽기·의존성 연결(`file:../shared`)·로컬 실행만 하고 수정하지 않음. `mobile/`·`tests/integration/` 수정 없음.
- 계획: ① web 임시 계약 → `@ticket-radar/shared` v0.1.0 타입·Zod 스키마 교체 ② 추가 조건 6개 입력 UI(자동 채움 없음) ③ previousCheckId 재대조·명시적 manual·409 재추출 처리 ④ extraction.method/actualModelCall/reused·provenance·날짜 단위 확인일 표시 ⑤ 실서버(127.0.0.1:3001, CORS 5173)로 6개 흐름을 실제 브라우저에서 검증. 시연 fixture 모드는 새 계약 형식으로 유지하되 fixture로 표시.
- 다음 행동: 구현 → 테스트·빌드 → 실서버 브라우저 검증 → 완료 기록.

### [AID-20261101-APP-008] 앱 APP-005 계약 적용 준비 착수 (shared v0.1.0 소비, 실 API 연동은 대기)
- 날짜·시각·시간대: 2026-11-01 22:58 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (세션 환경 보고 기준). 개발 에이전트 모델이며 제품 AI 모델이 아니다.
- 수신 대상: Astra (Sol·웹 담당 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-005 / SOL-002, shared/README.md(v0.1.0), CORE_DEMO_HANDOFF, APP-007
- 유형: 착수
- 담당 파일·수정 범위: `mobile/` 내부만. 예정: package.json·lock(`@ticket-radar/shared`: `file:../shared` 로컬 의존성), `metro.config.js`(신규, watchFolders), `src/contract/*`(웹 사본 → shared 기반 앱 소유 파일로 교체), `src/demo/*`(shared 형식 합성 fixture), `src/api/*`, `src/state/FlowContext.tsx`, `src/ui/*`, `src/components/*`, `src/app/*`, `__tests__/*`, `scripts/`, `README.md`, `evidence/`. `shared/`·`server/`·`web/`·`tests/integration/`·루트 문서 수정 없음(본 기록 추가 제외).
- 확인한 상태: SOL-002 완료 기록 있음(shared v0.1.0, server 127.0.0.1:3001). **WEB-005 실서버 왕복 완료 기록 없음**(WEB-005A 착수만) → 사용자 지시와 인계 순서에 따라 이번에는 실제 API 연동을 하지 않고 계약 적용·테스트까지만 하고 대기 상태를 남긴다. Communicate의 최근 기록은 SOL-002(10-29 15:59)까지이며 이후 웹/Astra 기록 없음.
- 범위: shared 계약 소비(Metro·Jest·tsc), 응답 검사를 shared Zod 스키마로 교체(+요청 일치 검사 유지), 12개 확인 필드·`previousCheckId` 재대조·명시적 수동 입력·`extraction`(method/actualModelCall/reused)·`provenance` 표시, 409 `CHECK_EXPIRED_OR_MISMATCH` 안내, 시연 fixture를 shared 형식으로 교체(항상 fixture로 표시, AI 결과로 표시하지 않음). 검증은 타입 검사/단위 테스트/Metro 번들/iOS 빌드·시뮬레이터/실기기를 구분해 기록.

### [AID-20261101-APP-008a] 정정: APP-008 착수 기록의 '이후 기록 없음' 문구
- 날짜·시각·시간대: 2026-11-01 23:00 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra (웹·Sol 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-005 / APP-008, SOL-003, WEB-005C
- 유형: 정정
- 담당 파일·수정 범위: 본 기록만.
- 내용: APP-008에 "최근 기록은 SOL-002까지이며 이후 웹/Astra 기록 없음"이라고 적었으나, 기록 시점에 이미 SOL-003(22:51, 확인·응답)과 WEB-005C(22:52, 웹 shared 교체·실서버 연결 **착수**)가 있었다. 기록 직전 재확인이 늦었다. 결론은 같다: WEB-005 **완료(실서버 왕복 검증) 기록은 아직 없으므로** 앱은 실제 API 연동을 대기하고 계약 적용 준비만 진행한다. 웹과 같은 shared v0.1.0 기준으로 진행하며 웹 파일은 읽기만 한다.

### [AID-20261101-WEB-005D] WEB-005 완료 보고: shared 계약 교체·Sol 실서버 브라우저 왕복 검증 (AI 미설정 범위)
- 날짜·시각·시간대: 2026-11-01 23:04 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra·Sol·앱 담당. 타 세션 수신 확인 없음. APP-008/008a를 읽어 앱이 같은 shared v0.1.0으로 옮기는 중임을 확인.
- 작업 ID / 참조 기록: WEB-005 / WEB-005C, SOL-002·003, shared/README.md, CORE_DEMO_HANDOFF
- 유형: 완료·인계·요청
- 담당 파일·수정 범위: `web/`만. `shared/`·`server/`는 수정 없음(의존성 연결·로컬 실행만). `mobile/`·`tests/integration/`·루트 문서 수정 없음(본 기록 제외).
- 수정 파일:
  - 의존성·설정: web/package.json·lock(`@ticket-radar/shared`: `file:../shared`), vite.config.ts(`server.fs.allow` ../shared), playwright.config.ts(시연 5179 / Sol 서버 `npm start` / 실서버 모드 5173).
  - 계약: src/contract/types.ts(shared 재노출+하위 타입 별칭만), src/contract/validate.ts(shared Zod 스키마 + 인용 원문 구간·적용값=보낸 확인값·추출 단계 무계산·eventId 일치 검사).
  - API: src/api/client.ts(CheckRequestInput), src/api/httpApi.ts(스키마 검증·ApiErrorBody 파싱), src/api/demoApi.ts(shared 형식·UUID·provenance·extraction.method=fixture/manual).
  - 화면: src/App.tsx(syntheticListing, previousCheckId 재대조, 명시적 manual 요청, 모드별 하단 문구), components/ReviewStep.tsx(12개 필드: 가격 비교 조건 6개 추가, 자동 채움 없음, ExtractionLine에 actualModelCall/reused 반영), ResultStep.tsx(적용값 12개·추출 방식·provenance 표시, 공식 링크 문구를 officialSourceType 기준으로), OfficialPanel.tsx(sourceType·sourceVersion·기본가 조건·규정 scope·날짜 단위 확인일), ListingStep.tsx(합성 판매글 체크박스, 기본 체크), EventStep.tsx, common.tsx(AI_TIMEOUT·AI_*·CHECK_EXPIRED_OR_MISMATCH·RATE_LIMITED 안내, isDemo=false 배지 "공식 자료 기반"), ui/format.ts(새 열거 라벨, 날짜만 있는 확인일에 시각을 만들지 않음, ISO 회차 label 표시 변환), ui/fields.ts, index.css.
  - 시연 데이터: src/demo/fixtures.ts(shared 형식, 조건 미확인 시 보류 결과 추가, 비율을 스키마 허용 오차 안으로 49.35·13.64, B 가격 후보 2개, C 가격 unknown 인용 null).
  - 테스트: src/contract/validate.test.ts·src/App.test.tsx·src/api/httpApi.test.ts 갱신, e2e/server.spec.ts 신규, e2e/flow.spec.ts 갱신. **삭제**: e2e/mock-api.mjs·e2e/http.spec.ts(구 임시 계약용 모의 서버)와 그 스크린샷.
  - 증거: web/evidence/screens/server-chrome·server-webkit-iphone/s1~s6.png, web/evidence/videos/server-*-real-server-flow.webm, web/evidence/contract/demo-check-*.json(새 형식). README 갱신.
- 실행 결과 (2026-11-01 22:57~23:03 KST):
  - 단위·컴포넌트 테스트: `npx vitest run` 4 files / **35 tests 통과**. Sol `shared/examples`(events·official-context·manual-request/response)가 웹 검증을 통과하고, 웹 시연 응답 전부가 `CheckResponseSchema`를 통과. 잘못된 응답 13종 거부(원문에 없는 인용, 적용값≠보낸 값, 계산 오류, 합성인데 live, 출처 없는 model 주장, fixture의 모델 호출 주장, 계약 버전, 다른 공연 등). 재대조 요청이 previousCheckId + 12개 전체 스냅샷인지 확인.
  - 타입 검사 `npx tsc -b` 통과. 빌드 `npm run build` 통과(JS 363kB / gzip 109kB, Zod 포함으로 증가). `npx oxlint` 경고 1건(기존과 동일).
  - 실제 브라우저(Playwright) `npx playwright test` **12개 통과**: 실서버 2(설치된 Google Chrome 1280px, WebKit iPhone 14) + 시연 모드 10(5개 구성 × 2).
  - **실서버 검증 내용**(Sol 서버 `npm start` 127.0.0.1:3001, `/health` aiConfigured=false, 웹 127.0.0.1:5173 → CORS 실제 통과):
    1. 공연·공식 자료 조회: AKMU 대구 공지 기본가 4등급, 출처 유형 공식 공지 스냅샷, 규정 "실관람자가 모두 동일인이어야 합니다."(팬클럽 선예매에만 적용), YES24 링크, 확인일 "2026. 10. 29. (날짜 단위)".
    2. AI 미설정: 추출 요청 `{eventId, listingText, syntheticListing:true}` → 503 AI_NOT_CONFIGURED 표시, 재시도 버튼 없음(retryable=false), 결과 화면으로 가지 않음.
    3. 명시적 직접 입력: 사용자가 버튼을 눌러야만 진입, 요청 `extractionMode:'manual'`, 결과에 "AI 추출 없음 · 사용자가 직접 입력"과 "시연용 합성 판매글" 표시.
    4. 수정 → 재대조: 가격 250,000→200,000 수정 시 이전 결과를 "수정 전 값 기준"으로 표시, 재대조 후 +24,000원·적용값 200,000원, 마지막 요청 confirmedFields 확인.
    5. 보류: 조건 누락("판매글의 공연 일치 여부를 확인하세요."), 회차 누락("회차가 없거나 선택한 공연의 회차와 일치하지 않습니다."), 다른 공연 선택 → 모두 숫자 비교 없음. (curl로 공식 자료에 없는 좌석 "S석"·묶음 총액도 서버가 보류함을 별도 확인)
    6. 근거 표시: 조건 확인 후 +74,000원, 확인할 점마다 판매글 문구·공식 문구·YES24 링크·확인일. 선예매 관람자 조건은 "공식 안내와 다른 설명"으로 표시.
  - 직접 열어 확인한 화면: server-chrome s2(AI 미설정)·s4(비교·근거), server-webkit-iphone s6(회차 보류). 가로 스크롤 없음·페이지 오류 없음은 테스트로 확인. 녹화 2건 저장.
  - 실서버 검증 중 발견·수정한 웹 버그: 합성 판매글이면 결과 전체가 isDemo=true인데 웹이 이를 근거로 **실제 공지 링크까지 "시연용 예시 링크"로 표시**하던 문제 → 공식 자료 출처 유형 기준으로 수정. 실서버 모드 하단 문구가 "공연·가격·규정은 가상"으로 나오던 문제 → 모드별 문구로 수정.
  - Astra 검증기 `tests/integration/check_api.py --response`: 새 형식 웹 시연 응답 8건 모두 PASS(exit 0).
- 실제 AI: **검증하지 않음**. 서버 AI 미설정이며 fixture·직접 입력 결과를 AI 결과로 표시하지 않음. model 추출·previousCheckId 재사용 응답(reused=true)·409 CHECK_EXPIRED_OR_MISMATCH 화면은 실서버에서 재현할 수 없어 단위 테스트(요청 형태)까지만 확인.
- Sol·Astra 요청(계약은 임의 변경하지 않음):
  1. `showtimes[].label`이 ISO 시각 문자열("2026-11-21T17:00:00+09:00")이다. 웹은 ISO 형태면 `startsAt`을 "11월 21일 (토) 17:00"으로 바꿔 보여준다. 사람이 읽는 label을 서버에서 줄지 결정 요청.
  2. 직접 입력 응답의 결과 `listingQuote`가 판매글 전체 문장이다. 시연 화면에서 근거 문구가 길어진다. 직접 입력 시 인용을 null로 둘지 결정 요청(현재 웹은 그대로 표시).
  3. 서버 호출 제한(IP당 30회/분) 때문에 실서버 브라우저 테스트는 2개 구성만 순서대로 돌린다. 시연 리허설 중 반복 조작 시 RATE_LIMITED 가능성을 알림.
- 앱 담당 참고: 웹의 `src/contract/types.ts`·`src/demo/fixtures.ts`·`src/ui/{fields,format}.ts`가 shared 기반으로 바뀌어, 앱의 기존 `check:contract` 사본 동기화를 실행하면 `@ticket-radar/shared` import가 따라간다. APP-008 계획대로 shared 직접 소비가 맞다.
- 남은 문제: 실제 AI 제공자·모델 미정(실제 AI 추출 검증 불가), 실제 Safari 앱·실기기·배포 미검증, 공식 확인일은 날짜 단위(정확한 시각 없음), 위 요청 1~2 미결.
- 다음 행동: 앱 담당은 APP-005 실 API 연동을 시작할 수 있다(웹 실서버 왕복 통과). 웹은 AI 제공자가 설정되면 같은 server.spec에 model 추출·재사용 재대조 사례를 추가해 다시 검증한다. 실행: `cd server && npm start` → `cd web && VITE_API_BASE_URL=http://127.0.0.1:3001 npx vite --host 127.0.0.1 --port 5173`.


### [AID-20261101-ASTRA-016] Sol 독립 검토·수정 요청
- 시각: 2026-11-01T23:05:21.661434+09:00
- 작성자/실제 모델: Astra / 환경상 GPT-6 기반, 세부 ID 미노출. 수신 대상 Sol·웹·앱, 타 세션 수신 미확인.
- 작업: CORE-002 검토 / SOL-002·003, WEB-005D. 제품 구현은 각 담당 소유로 유지.
- 범위: docs/SOL_REVIEW_20261101.md, tests/integration/astra-sol-review.ts, evidence/logs/astra-sol-review-20261101.json, AGENTS 현황·CORE_DEMO_HANDOFF 갱신. shared/server/web/mobile 수정 없음.
- 직접 검증: 서버 npm test 33/33, npm run typecheck 통과. 독립 합성 재현 스크립트 실행. 실제 AI 호출 없음. Git exit 128.
- 판정: 서버 기반 확인, 최종 승인 보류. Sol 수정 요청 R1(P1): 17만6천원에서 170000/6000은 승인하고 176000은 거부하는 근거 검증. R2(P1): 코드 생성 가격 설명을 officialExcerpt로 제공. R3(P2): 회차별 가격 계산과 공식 인용의 tier 선택 불일치. R4(P2): 판단 원문 인용 null을 공통 스키마가 허용. 상세 재현·완료 기준은 검토 문서 참조.
- 조율: 웹·앱 계약 적용은 진행 가능, 수정 후 회귀 검증 필수. WEB-005D의 실제 서버 브라우저 완료 보고를 확인했으므로 앱은 해당 인계를 읽고 연동 진행 가능(이번 Astra 턴에서 웹 브라우저 재검증하지 않음). 회차 label 화면 현지화 허용. 수동 입력 전체 원문 인용 유지+접어 보기 허용; 사용자 확인값과 구분. null 예외는 계약 제안 후 결정.
- 미확인: 실제 AI, 전달 방식 자체의 공식 규칙 대조 완성, 최신 공식 원문 재조사·정확한 확인 시각, 기기·배포·제출.
- 다음: Sol R1~R4 수정·회귀 테스트 기록 → Astra 재검증. 기록은 자동 전달·수신 증거가 아님.

### [AID-20261101-SOL-004] ASTRA-016 R1~R4 수정 착수
- 날짜·시각·시간대: 2026-11-01T23:09:28+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 ID 미노출
- 수신 대상: Astra·웹·앱 담당·사용자 (ASTRA-016과 검토 문서 실제 읽음; 본 기록 타 세션 수신 확인 없음)
- 작업 ID / 참조 기록: CORE-002 검토 수정 / ASTRA-016, docs/SOL_REVIEW_20261101.md, 사용자 R1~R4 수정 지시
- 유형: 착수
- 담당 파일·수정 범위: server/src/extraction.ts·catalog.ts·rules.ts, shared/index.ts, server/test/review-regressions.test.ts, server/data 가격 인용 근거, shared/server README·예시(변경 필요 시), evidence/logs/sol-review-*, 본 기록. docs/official·Astra 독립 테스트·web/mobile·루트 공통 문서는 수정하지 않음.
- 내용: R1 복합 금액을 부분 토큰이 아닌 전체 금액으로 검증; R2 실제 공식 가격 인용과 자체 비교 설명 분리; R3 계산과 같은 회차 priceTier의 원문/URL/확인일 연결; R4 conflict/matched/needs_check의 원문 인용 필수화. 재현 회귀 테스트를 먼저 추가하고 기존 기대값을 낮추지 않음. AI 제공자 미정·실제 모델 호출/fixture 대체 금지 유지.
- 실제 검증 근거: 최신 AGENTS/Communicate/memory·검토 문서·SPEC 및 실제 코드·Astra 독립 재현 소스 재독. git status exit 128. R2 관련 YES24 공식 공지를 웹 도구로 재열람해 가격 원문 확인; 원문 인용 증거는 Sol 소유 보조파일로 보존하고 docs/official 갱신은 Astra에게 요청 예정.
- 남은 미확인 사항: 수정 후 회귀 결과·Astra 재검토·웹/앱 영향. 실제 AI/기기/배포/제출은 범위 밖.
- 다음 행동: R1~R4 재현 테스트 실패 기록 → 수정 → 전체 서버 테스트·타입 검사·독립 재현 재실행 → 결과와 계약 영향 인계.


### [AID-20261101-ASTRA-017] WEB-005 실서버 독립 재검증
- 시각: 2026-11-01T23:13:23.497218+09:00
- 작성자/실제 모델: Astra / GPT-6 기반, 세부 ID 미노출. 수신: 웹·앱·Sol, 타 세션 수신 미확인.
- 범위: docs/WEB_REVIEW_20261101.md, E2E 생성 증거·본 기록. 제품 코드 수정 없음.
- 직접 결과: web 테스트 35/35, tsc+Vite 빌드 통과. Chrome·모바일 WebKit 실서버 E2E 2/2 통과, 결과 화면 PNG 시각 확인. 최초 로컬 포트 EPERM 후 승인된 동일 명령 재실행 통과.
- 판정: AI 미설정 수동 대조 흐름 검증 통과. 앱 실서버 연동 진행 가능. Sol R1~R4 및 실제 AI 검증 전 제품 전체 최종 승인 아님.
- 웹 요청 W1(P2): DemoBadge title이 공식 가격·규정까지 가상이라고 설명하는 오류 수정. Sol R2 이후 E2E 공식 인용 기대값 갱신·회귀 확인. 상세는 검토 문서.
- 미검증: 실제 AI·model 재사용/409 실서버 브라우저, 실제 Safari 앱·실기기·배포·제출. Sol 수정 착수는 확인했으나 완료를 주장하지 않음.

### [AID-20261101-SOL-005] ASTRA-016 R1~R4 수정·회귀 검증 완료 및 재검토 요청
- 날짜·시각·시간대: 2026-11-01T23:15:06+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 ID 미노출
- 수신 대상: Astra·웹·앱 담당·사용자 (ASTRA-016 실제 수신·확인; 본 완료 항목의 타 세션 수신 확인 없음)
- 작업 ID / 참조 기록: CORE-002 검토 수정 / SOL-004, ASTRA-016, docs/SOL_REVIEW_20261101.md
- 유형: 완료(요청 수정)·검증·공식 자료 갱신 요청
- 담당 파일·수정 범위: server/src/extraction.ts·catalog.ts·rules.ts, shared/index.ts, server/test/review-regressions.test.ts 신규, server/data/akmu-price-evidence.json 신규, shared/server README, shared/examples 재생성, evidence/logs/sol-review-20261101-*와 본 기록. docs/official·Astra 검토 문서/독립 스크립트·web/mobile·AI 환경설정 수정 없음.
- 내용:
  - R1: 금액 전체 표현을 먼저 소비하고 단위 내림차순·숫자 형식·안전한 정수를 검사. 17만6천원/17만 6천 원/17만6000원은 176000만 승인, 170000·6000 부분값 거부. 단일 17만원, 서로 다른 두 가격, 반복/역순/미지원 단위·부호 포함 표현도 회귀 검사. 지원하지 못하는 표현은 부분 토큰으로 통과시키지 않고 거부.
  - R2: YES24 공지 가격 문장을 직접 재확인해 server/data 보조 근거에 보존. priceTier.sourceText와 officialExcerpt는 이 원문만 제공하고 서비스 비교 설명은 기존 정규화 필드·reason·notices에 분리. 공식 가격 재확인 날짜는 보조 근거 verifiedDate; 기존 공연/정책 확인일을 전부 최신으로 바꾸지 않음. sourceVersion은 기존 공식 스냅샷과 보조 근거를 결합한 SHA-256으로 변경.
  - R3: 가격 계산과 finding 생성이 동일한 유일 회차/좌석 tier 선택 함수를 사용. 해당 tier의 문구·URL·확인일을 함께 전달. 외부에서 넘어온 비교 객체와 tier가 달라지면 잘못된 근거 대신 실패. 1회차 100000원/2회차 200000원과 서로 다른 인용·URL·날짜로 검증.
  - R4: 공통 FindingSchema에서 conflict/matched/needs_check는 listingQuote null·빈 문자열·공백을 거부. 세 상태×세 유형 검사 및 정상 수동 응답의 인용을 전부 null로 바꾼 재현을 회귀 검사. 수동 전체 원문 인용과 appliedFields의 수정값 구분은 유지.
- 실제 검증 근거:
  - 수정 전 새 회귀 7개: 1 통과/6 실패로 결함 재현(evidence/logs/sol-review-20261101-before.txt). 같은 기대값 유지 후 최종 npm test 40/40 통과(기존 33+회귀 7; 로컬 HTTP 9개 포함). npm run typecheck exit 0. 최종 로그는 sol-review-20261101-tests.txt·typecheck.txt.
  - Astra 소유 node tests/integration/astra-sol-review.ts를 수정 없이 실행(exit 0). 170000=false, 6000=false, 176000=true, 인용 누락 거부, 2회차 계산/인용 일치, 가격 공식 원문 반환을 결과 JSON으로 확인(evidence/logs/sol-review-20261101-independent.json). 이는 Sol이 Astra 스크립트를 재실행한 것이며 Astra 본인의 새 승인이라고 주장하지 않음.
  - npm run examples exit 0: 명시 수동·합성 예시와 미설정 오류 예시 재생성, 실제 모델 호출 없음. 근거·해시·각 R 결과 요약 sol-review-20261101-summary.json.
  - R2 공식 자료 확인: https://m.ticket.yes24.com/Notice/18447?order=1&type=1 의 가격 원문을 웹 도구로 재열람. 재확인 범위는 가격 문장으로 한정.
- 계약·연동 영향: wire 형식과 contractVersion 0.1.0 유지, R4 검증만 강화. 웹·앱은 판단 원문 인용을 null로 지우지 말고 필요 시 전체 인용 접어 보기 사용. 원래 sourceText의 생성 설명이 실제 원문으로 바뀌고 가격 확인일/sourceVersion이 바뀜. 운영 중 로컬 서버는 이번에 재시작하지 않았으므로 후속 실제 HTTP 검증 전에 담당자가 최신 코드로 재시작 필요.
- 공식 자료 소유자에게 요청: Astra는 server/data/akmu-price-evidence.json의 원문·출처·검증 범위를 검토해 docs/official/demo-event-akmu.json 또는 공식 근거 파일에 정식 통합해 달라. Sol은 해당 소유 파일을 수정하지 않았고 보조 근거로 원문 오표시는 제거함. 통합 후 단일 근거 위치/소스 버전 정리는 별도 조율.
- 남은 미확인 사항: Astra 수정 후 최종 독립 승인, 웹·앱 최신 코드/화면 재검증, 실제 AI 정확도·전달/수령 방식 전체 규정 대조·기기·배포·대회 제출.
- 다음 행동: Astra가 R1~R4를 독립 재검증하고 공식 자료 갱신·계약 결과 기록. Sol은 후속 구체적 수정에 대응. AI 제공자/모델 미정 유지, 실제 모델/유료 API 호출·운영 fixture 대체·자동 수동 전환·서버 환경 변경/재시작 없음. 테스트의 주입 fixture/모의 fetch는 격리 테스트용으로만 사용.

### [AID-20261101-APP-009] APP-005 완료 보고: shared v0.1.0 적용·Metro 연결·Sol 실서버 왕복(AI 미설정 범위)
- 날짜·시각·시간대: 2026-11-01 23:20 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Sol·웹 참조). 타 세션 수신 확인 없음. WEB-005D·ASTRA-016·017·SOL-004·005를 실제로 읽음.
- 작업 ID / 참조 기록: APP-005 / APP-008·008a, WEB-005D(실서버 왕복 완료 → 연동 시작 조건 충족 확인), ASTRA-016(회차 label 현지화 허용·수동 입력 전체 인용 유지), SOL-005, shared/README.md
- 유형: 완료·검증·인계
- 담당 파일·수정 범위: `mobile/`만. `shared/`·`server/`·`web/`·`tests/integration/`·루트 문서 수정 없음(본 기록 제외). shared/server는 읽기·로컬 `npm start` 실행만. 내 작업 구간(22:58~23:08) 전후 shared/server 해시 동일(`mobile/evidence/logs/app-008-shared-snapshot-{before,after}.txt`); 이후 23:15 변경은 SOL-005(Sol) 수정이다.
- 변경 파일:
  - 연결: `tsconfig.json`(paths `@ticket-radar/shared`→`../shared/index.ts`), `metro.config.js` 신규(watchFolders `../shared` + 패키지 이름→소스 파일 resolveRequest, zod는 shared/node_modules에서 해석), `package.json`(Jest moduleNameMapper, `check:contract`=공통 계약 테스트, `test:live` 신규, live 테스트 기본 실행 제외). **npm `file:` 설치를 쓰지 않아 shared/ 폴더에 쓰기가 없다.**
  - 계약·데이터: `src/contract/types.ts`(웹 사본 → shared 재노출+하위 타입 이름), `src/demo/fixtures.ts`(공통 계약 형식 합성 fixture, 조건 미확인 보류 결과 추가, 비율 49.35·13.64, B 좌석 후보 2개·가격 기준 total, C 가격 unknown 인용 null), `src/ui/{fields,format,display}.ts`(12개 필드·새 열거 라벨·날짜 단위 확인일·ISO 회차 label 현지화·추출 방식/출처 문구). `scripts/check-contract-copy.sh` 삭제(웹 사본 비교 불필요).
  - API: `src/api/client.ts`(CheckRequestInput), `httpApi.ts`(요청 CheckRequestSchema 사전 검사 → INVALID_REQUEST로 미전송, 오류 본문 ApiErrorBodySchema), `validate.ts`(shared Zod + 요청 일치 검사: eventId·인용 원문 구간·appliedFields=보낸 12개 전체·확인 전 무계산·manual 요청에 manual 응답), `demoApi.ts`(UUID checkId, previousCheckId 확인·409 흉내, 명시적 manual, 응답마다 CheckResponseSchema.parse, method=fixture/manual·actualModelCall=false).
  - 상태·화면: `state/FlowContext.tsx`(syntheticListing:true, 재대조 previousCheckId+전체 스냅샷, `startManualEntry`, 개발 전용 `runDevLiveCheck`), `app/listing.tsx`('AI 없이 직접 입력' 버튼—자동 전환 없음), `app/review.tsx`(직접 입력 빈 폼, 409 '판매글 다시 분석하기'), `app/index.tsx`(개발 전용 실서버 바로가기 `?devLive=`), `components/ReviewForm.tsx`(비교 전제 조건 6개 섹션, 자동 채움 없음, '다른 공연' 값을 지어내지 않음), `ResultView.tsx`(추출 방식·provenance, 직접 입력 표시, 적용값 '(수정)' 표시, 가격 비교를 서버 안내 문구 위로), `OfficialSummary.tsx`(출처 유형·기본가 조건·규정 적용 범위), `common.tsx`(배지=isDemo 의미 '시연 데이터/실제 자료', 서버 연결 배너는 데이터 출처를 주장하지 않음), `ListingForm.tsx`(원문 길이 기준 3000자).
  - 테스트: `__tests__/sharedLink.test.ts` 신규, `validate`·`demoApi`·`httpApi`·`flow`·`httpFlow`·`display` 갱신, `__tests__/live/server.live.test.ts` 신규. README 갱신.
- 검증 결과 (구분):
  1. **타입 검사**: `npx tsc --noEmit` exit 0 (23:15, SOL-005 변경 후 23:17 재실행 exit 0). **lint**: `npx expo lint` exit 0.
  2. **단위·화면 테스트(Jest)**: 7 suites / **65 tests 통과**(23:17 재실행). 포함: Sol 예시 JSON 파싱, 모든 시연 응답 스키마 통과, 잘못된 응답 거부(스키마 위반·가격 산술·fixture를 실제/모델 호출로 표시·원문에 없는 인용·수정값 미적용·확인 전 적용값·manual 불일치·다른 공연), 실제 화면 4개 흐름(정상·조건 미확인 보류·T05 수정 재대조·잘못된 숫자·빈 입력·네트워크 실패/재시도·직접 입력·previousCheckId+12개 전송·409·공식 자료 없음), HTTP 모드 화면(Sol 예시 기반 가짜 서버: AI 미설정은 재시도·자동 전환 없음, **화면 선택만으로 Sol manual-request와 동일한 요청 생성** 후 +74,000원 표시, AI_TIMEOUT 재시도·model 표시, 계약 위반 차단).
  3. **Metro 번들**: `npx expo export --platform ios` 성공(Hermes `entry-*.hbc` 3.3MB). 번들에 shared 스키마 오류 문구·ZodError 포함 확인 → Metro가 `../shared`와 zod를 해석함. **네이티브 빌드는 이번에 다시 하지 않음**(네이티브 의존성 변경 없음, 10-28 개발 빌드 재사용). `expo-doctor` 19/20(실패 1건은 Expo 패치 버전 차이, APP-007과 동일·미변경).
  4. **실서버 API 왕복**: Sol 서버 `npm start`(127.0.0.1:3001, aiConfigured=false, 계약 0.1.0)에 앱의 실제 `httpApi`+`validate` 코드로 `npm run test:live` **8/8 통과** — 공연·공식 자료, 모델 추출 503 AI_NOT_CONFIGURED(retryable=false), 명시적 직접 입력 비교(176,000/250,000/+74,000, method=manual, isDemo=true·provenance 합성 판매글+공식), 수정 재대조(200,000 → +24,000, appliedFields 일치), 보류(수수료 미확인·회차 미확인), 예매 유형 미확인 → 선예매 규정 needs_check, 존재하지 않는 previousCheckId → 409, 지시문 포함 글. SOL-005 반영 후 서버를 재시작해 23:17에 재실행해도 8/8(결과 `mobile/evidence/contract/app-008-live-roundtrip.json`). Jest RN 환경이 전역 fetch를 바꿔 두어 live 테스트에만 node:http 기반 최소 fetch를 넣음(앱 코드는 동일).
  5. **iOS 시뮬레이터(iPhone 17, iOS 26.5, 개발 빌드+Metro, `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001`)**: 화면 4장 캡처를 직접 열어 확인 — `ios-live-01-events`(앱 실행 시 실서버 공연 목록, Hermes에서 Zod·URL 검사 통과, '실제 자료' 배지·날짜 단위 확인일), `02-ai-not-configured`(서버 문구·코드, 재시도 버튼 없음, 직접 입력 버튼 표시), `03-manual-result`(직접 입력 표시·합성 판매글·공식 공지 스냅샷·sha256:37f2…·11월 21일 (토) 17:00 VIP·+74,000원(+42.05%)·YES24 링크·확인 2026. 11. 01.(날짜 단위)), `04-held`(수수료·할인 조건 불명확 보류 사유). **한계: 02~04는 개발 전용 바로가기로 화면 버튼과 같은 실제 요청을 보낸 상태이며, 시뮬레이터에서 손가락 탭·키보드 입력을 실제로 조작한 것이 아니다**(Simulator 화면 앱·idb·maestro 없음, 설치하지 않음). 탭·입력 동작은 Jest 화면 테스트로만 검증. 시연 모드 화면은 이번에 시뮬레이터로 다시 찍지 않음(Jest만).
  6. **실기기·Android**: 미검증(실제 iPhone 미연결, Android SDK 라이선스·adb 없음). 실기기는 서버 기본 바인딩이 127.0.0.1이라 LAN/HTTPS 주소와 별도 바인딩이 필요.
- 실제 AI: **검증하지 않음**. 서버 AI 미설정. fixture·직접 입력 결과를 AI 결과로 표시하지 않음(화면·검사기 양쪽에서 확인). model 추출·reused 재대조 화면은 가짜 서버 테스트까지만.
- 작업 중 발견·수정: ① Metro를 `CI=1`로 실행하면 파일 감시가 꺼져 수정 후 화면이 갱신되지 않음 → 재시작으로 해결(README에 주의 기록). ② 서버 안내 문구 4개가 결과 첫 화면에서 가격 비교를 가림 → 가격 비교 다음으로 순서 변경(문구는 모두 표시). ③ 앱 배지 `실제 API` 문구가 isDemo 의미와 맞지 않음 → '실제 자료'로, 서버 연결 배너는 데이터 출처를 주장하지 않게 수정.
- Sol·Astra 전달: ① 앱은 shared를 npm 설치 없이 별칭으로 소비한다. shared에 Node 전용 API가 들어가면 Metro 번들이 깨지므로 순수 TS+Zod 유지 요청. ② SOL-005로 sourceText·sourceVersion·가격 확인일이 바뀌어도 앱 변경 없이 표시됨을 실서버로 확인. ③ 실서버 테스트와 리허설이 IP당 30회/분 제한을 공유하므로 시연 직전 반복 실행 주의.
- 남은 문제: 실제 AI 제공자·모델(실제 추출 검증), 시뮬레이터 실제 탭/키보드 조작 도구, 실기기·Android, Expo 패치 업데이트 시점(재빌드 동반), 개발 전용 바로가기(`demoScenario`·`devLive`)는 `__DEV__`에서만 동작—발표 빌드 전 유지 여부 Astra 판단.
- 다음 행동: Astra 독립 재검증 대기. AI 제공자가 설정되면 같은 `test:live`에 model 추출·reused 재대조·실제 409 사례를 추가해 재검증한다. 실행: `cd server && npm start` → `cd mobile && EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001 npx expo start --dev-client`(시뮬레이터) / `LIVE_API_BASE_URL=http://127.0.0.1:3001 npm run test:live`.

### [AID-20261101-WEB-006A] WEB-005 마무리 착수 (W1·SOL-005 반영 재검증)
- 날짜·시각·시간대: 2026-11-01 23:23 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Sol·앱 참조). ASTRA-016·017, docs/WEB_REVIEW_20261101.md, SOL-004·005, APP-009를 실제로 읽음. 본 기록 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-005 후속 / WEB-005D, ASTRA-017 W1·요청 2, SOL-005 R2
- 유형: 착수
- 담당 파일·수정 범위: `web/`만(예정: src/components/common.tsx·ResultStep.tsx, e2e/server.spec.ts, 증거). shared/server는 실행만. 새 기능 추가 없음.
- 다음 행동: W1 수정 → 최신 서버 재시작 후 공식 원문 확인 → E2E 기대값 갱신 → 테스트·빌드·Chrome/모바일 WebKit 실서버 재검증 → 완료 기록.

### [AID-20261101-APP-010] 앱 실제 사용자 조작 검증 착수 (시뮬레이터 탭·키보드, 개발용 바로가기 미사용)
- 날짜·시각·시간대: 2026-11-01 23:27 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Sol·웹 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-005 후속(실조작 검증) / APP-009, SOL-005, 사용자 지시(바로가기 없이 직접 탭·키보드로 공연 선택→입력→AI 미설정→명시적 수동 입력→비교→수정→재대조→조건 누락 보류)
- 유형: 착수
- 담당 파일·수정 범위: `mobile/` 내부만. 예정: `mobile/e2e-ios/`(신규, 앱과 분리된 XCUITest UI 테스트 프로젝트 — CNG 생성물 `ios/`는 수정하지 않음), `mobile/scripts/`(실행 스크립트), `mobile/evidence/`, `mobile/README.md`. 앱 기능 추가·실제 AI 연결 없음. `shared/`·`server/`(SOL-005 상태 유지, 로컬 `npm start` 실행만)·`web/`·루트 문서 수정 없음(본 기록 제외).
- 조작 도구 확인 결과: Xcode 27.2. Simulator.app 없음(Xcode Developer/Applications 폴더 없음), idb·idb_companion·maestro·applesimutils 없음, `simctl`에 탭·입력 명령 없음. **XCTest.framework 있음** → 설치 없이 XCUITest로 설치된 앱(dev.aid.ticketradar)에 실제 터치·키 입력 이벤트를 보내는 방식을 시도한다. brew·pip3는 있으나 도구 설치는 하지 않는다. XCUITest 구동이 불가능하면 완료로 처리하지 않고 사용자용 수동 검증 절차를 남긴다.

### [AID-20261101-WEB-006B] WEB-005 마무리 완료: W1 배지 도움말·SOL-005 공식 원문 기준 재검증
- 날짜·시각·시간대: 2026-11-01 23:25 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Sol·앱 참조). 타 세션 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-005 후속 / WEB-006A, WEB-005D, ASTRA-017(W1·요청 2), docs/WEB_REVIEW_20261101.md, SOL-005
- 유형: 완료(검토 요청 반영)
- 담당 파일·수정 범위: `web/`만. shared/server는 수정 없음(서버 `npm start` 실행·종료만). mobile/·루트 문서·Astra 파일 수정 없음(본 기록 제외).
- 변경 파일:
  1. W1: `src/components/common.tsx` — DemoBadge에 `title` 인자 추가. 기본 도움말을 "합성 판매글이나 시연용 자료가 하나 이상 포함된 결과"로 바꾸고, 순수 합성 표시용 `FULLY_SYNTHETIC_TITLE`(기존 문구) 분리. `src/components/ResultStep.tsx` — provenance 기준 도움말(공식 자료 합성 → 기존 문구 유지 / 공식 공지 + 합성 판매글 → "시연용 합성 판매글로 대조한 결과입니다. 공식 가격·규정은 공지 스냅샷입니다."). `src/App.tsx`(시연 모드 헤더)·`EventStep.tsx`(합성 공연)·`OfficialPanel.tsx`(합성 공식 자료일 때만)에 기존 문구 유지.
  2. 공식 가격 원문 표시: `src/components/OfficialPanel.tsx` — 이미 받던 계약 필드 `priceTiers[].sourceText`를 가격표 아래 인용으로 표시(기존에는 미표시). 새 API·필드 없음.
  3. E2E: `e2e/server.spec.ts` — 생성 문구 기대값("공식 공지 기본가: VIP 176000원")을 SOL-005 이후 실제 YES24 원문 "·티켓 가격: 스탠딩&VIP석 176,000원 / R석 165,000원 / 시야제한 154,000원"으로 교체. 가격 근거 확인일 2026-11-01과 규정·공연 확인일 2026-10-29를 구분해 검사(패널 가격표·규정, 결과 가격 비교 카드, 가격·규정 결과 항목). 공식 링크 href, W1 배지 도움말 검사 추가.
  4. 단위 테스트 신규 `src/components/ResultStep.test.tsx` — Sol `shared/examples/manual-response.json`(공식+합성 판매글) 배지가 공식 자료를 가상이라 하지 않음, 순수 시연 결과는 기존 문구 유지.
  5. 증거 갱신: web/evidence/screens/server-chrome·server-webkit-iphone/s1~s6.png, web/evidence/videos/server-*-real-server-flow.webm(23:24).
- 검증 결과 (2026-11-01 23:19~23:24 KST):
  - 최신 서버: Sol 서버를 SOL-005 코드로 새로 `npm start` → `/health` aiConfigured=false·contractVersion 0.1.0, official-context sourceVersion `sha256:37f23141…`, 가격 sourceText=YES24 원문, 가격 verifiedAt 2026-11-01, 규정 2026-10-29. `POST /checks`(Sol manual-request) 결과 가격 officialExcerpt가 같은 원문·2026-11-01·YES24 URL임을 직접 확인.
  - 타입 검사 `npx tsc -b` 통과. 단위·화면 테스트 `npx vitest run` 5 files / **37 tests 통과**(기존 35 + W1 2). 빌드 `npm run build` 통과. `npx oxlint` 경고 1건(기존 동일).
  - 실제 브라우저 `npx playwright test` **12개 통과**: 실서버 server-chrome(설치된 Google Chrome)·server-webkit-iphone(WebKit iPhone 14) 각 1개(6개 흐름 + 공식 원문·확인일·출처·W1), 시연 모드 5개 구성 × 2개 회귀.
  - 직접 열어 확인: server-webkit-iphone s4(가격 원문 인용·확인 2026. 11. 01.·규정 2026. 10. 29.·YES24 링크, 패널 가격 원문).
- 실제 AI: **검증하지 않음·완료 아님**. 서버 AI 미설정 상태의 명시적 직접 입력 경로만 검증. model 새 문장 추출·previousCheckId 재사용 재대조·409 복구의 실서버 브라우저 검증은 ASTRA-017 요청 3대로 남음.
- 남은 한계: 실제 Safari 앱·실기기·배포·제출 미검증. 공식 확인일은 날짜 단위. 가격 원문은 Sol 보조 근거(server/data)에서 오며 docs/official 정식 통합은 Astra 결정 대기(SOL-005). 서버 30회/분 제한을 테스트·리허설이 공유. W1 검토 문서의 승인 여부는 Astra 재검토 필요.
- 다음 행동: Astra W1·E2E 재검토. AI 제공자 설정 후 server.spec에 model 추출·재사용·409 사례 추가.

### [AID-20261101-SOL-006] SOL-005 최신 서버 실행·계약/근거 변경 인계와 추가 기능 보류
- 날짜·시각·시간대: 2026-11-01T23:27:07+09:00 Asia/Seoul
- 작성자 / 실제 모델: Sol 역할 / 환경 지침상 GPT-6 기반 Codex, 세부 런타임 ID 미노출
- 수신 대상: Astra·웹·앱 담당·사용자 (SOL-005 확인 사용자 지시 수신. APP-009/010·WEB-006A/B 실제 읽음; 본 인계의 타 세션 수신 확인 없음)
- 작업 ID / 참조 기록: CORE-002 인계 / SOL-005, ASTRA-016·017, 사용자 추가 기능 보류·실행 방법 인계 지시
- 유형: 인계·확인
- 담당 파일·수정 범위: server/README.md 최신 인계 절, shared/README.md 연결, 본 기록만. 제품 코드·환경 파일·의존성·공식 원본·다른 담당자 파일 변경 없음.
- 내용: 추가 기능과 제품 AI 선정/호출은 보류. R1~R4는 Astra의 수정 후 독립 재검증을 기다림. 최신 기록에는 ASTRA-017 웹 재검증까지 있으며 SOL-005 수정 후 새 Astra R1~R4 판정은 아직 없음. 웹·앱이 실행할 일회성 AI none 프로세스 명령, /health aiConfigured=false 선확인, 최신 official-context sourceVersion/원문/가격 확인일, 명시 수동·수정·보류·원문 표시 검증 절차를 기존 README에 모음. 명령은 인계용 예시이며 이번 작업에서는 실행하지 않음.
- 계약·근거 인계: contractVersion 0.1.0 유지; conflict/matched/needs_check 원문 필수, 수정값과 인용 분리, 공식 가격 원문과 서비스 비교 설명 분리, 동일 회차 tier의 가격/문구/URL/날짜 일치. sourceVersion은 기존 공식 스냅샷+가격 보조 근거 결합. 현 기대값 sha256:37f23141d317d7b6106cfc406cd8e732e6bf544d6e85e31d097987493dc0d3eb. docs/official 정식 통합은 Astra 소유로 기존 요청 유지.
- 실행 경계: 기존 서버 담당자와 조율 후 해당 터미널에서 최신 코드 시작; 임의 프로세스 종료/포트 변경 없음. 기본 루프백 3001·웹 CORS 5173, 앱 시뮬레이터 로컬 주소 안내. 실제 기기 때문에 외부 바인딩/공개 설정을 이번에 추가하지 않음. AI 미설정 확인 전 추출 POST 금지, 실패 시 fixture/수동 성공 자동 대체 금지.
- 실제 검증 근거: 현재 AGENTS/Communicate/CORE_DEMO_HANDOFF/memory와 PLAN/SPEC/RESEARCH 관련 절, server/shared README·main·package·env 예시·가격 근거 재독. README 상대 링크·현재 파일에서 재계산한 sourceVersion 일치. 이전 SOL-005 요약의 제품 코드/회귀/가격 근거 6개 SHA-256 일치. 문서 변경만이므로 기존 40개 테스트를 이번에 재실행했다고 주장하지 않음. 서버·모델·HTTP·의존성 설치·환경 변경/재시작 없음.
- 담당 보고 확인: APP-009는 8개 실서버 왕복/65개 Jest/Metro, WEB-006B는 37개 단위/12개 브라우저와 최신 공식 원문 검증을 보고. Sol의 독립 재실행 결과가 아니며 Astra 승인으로 확대하지 않음. APP-010 실제 탭/키보드 검증은 착수로만 기록.
- 남은 미확인 사항: Astra R1~R4 최종 독립 판정·정식 공식 근거 통합, 앱 실제 사용자 조작 완료, 실제 모델·기기·배포·제출.
- 다음 행동: 웹·앱은 server/README의 최신 인계와 각자 소유 테스트로 결과 기록. Astra가 구체적 문제를 기록하면 Sol은 shared/server에서 해당 재현·회귀 수정으로 대응하고 추가 기능은 보류. 별도 세션 자동 전달·지속 감시·수신을 주장하지 않음.

### [AID-20261101-APP-011] 앱 실제 사용자 조작 검증 결과: iOS 시뮬레이터 XCUITest 탭·키보드로 핵심 흐름 통과 (AI 미설정·SOL-005 서버)
- 날짜·시각·시간대: 2026-11-01 23:35 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Sol·웹 참조). 타 세션 수신 확인 없음. SOL-006·WEB-006B를 실제로 읽음.
- 작업 ID / 참조 기록: APP-005 후속 / APP-010(착수), APP-009, SOL-005·006
- 유형: 완료(시뮬레이터 실조작 범위)·검증·발견 사항
- 담당 파일·수정 범위: `mobile/`만. 신규 `mobile/e2e-ios/`(TicketRadarUITests.xcodeproj·공유 스킴·`TicketRadarUITests/ManualFlowUITests.swift`), `mobile/scripts/ios-ui-flow.sh`, `mobile/evidence/screenshots/ios-ui-01~10.png`, `mobile/evidence/logs/app-010-xcresult-summary.txt`, `mobile/README.md`(실조작 검증·수동 절차 절). **앱 소스(src/) 변경 없음, 새 기능·실제 AI 연결 없음.** CNG `ios/`·`shared/`·`server/`·`web/`·루트 문서 수정 없음(본 기록 제외). server는 스크립트가 `npm start`로 띄우고 종료만 함.
- 조작 도구: Simulator.app·idb·maestro 없음, simctl 탭 명령 없음, 추가 설치 없음. Xcode 27.2의 **XCTest(XCUITest)** 로 앱과 분리된 UI 테스트 번들을 만들어, 설치된 개발 빌드 `dev.aid.ticketradar`를 번들 ID로 붙잡아 실제 터치·길게 누르기·키보드 이벤트를 보냄. **개발용 딥링크 바로가기(demoScenario·devLive) 미사용**, 앱에 테스트 전용 분기 없음. 판매글은 시뮬레이터 클립보드(simctl pbcopy)에 둔 뒤 입력칸을 길게 눌러 iOS 편집 메뉴의 '붙여넣기'로 입력, 숫자는 숫자 키패드 typeText.
- 결과 (2026-11-01 23:29~23:32 KST, iPhone 17 시뮬레이터 iOS 26.5, Sol 서버 127.0.0.1:3001 aiConfigured=false·SOL-005 코드, Metro `EXPO_PUBLIC_API_BASE_URL` 지정): `xcodebuild test` **1/1 통과(169초)**, xcresult 요약 `mobile/evidence/logs/app-010-xcresult-summary.txt`. 단계별 단언과 캡처(직접 열어 확인):
  1. 공연 선택: 'AKMU CONCERT TOUR' 탭 (01)
  2. 판매글 입력: 길게 눌러 붙여넣기, 입력칸 값 확인·81/3,000자 (02)
  3. AI 미설정: '정보 추출하기' 탭 → '오류 코드: AI_NOT_CONFIGURED', '다시 시도' 버튼 없음, 화면 유지 (03)
  4. 명시적 수동 입력: 'AI 없이 직접 입력' 탭 → '추출 방식: AI 추출 없음 · 사용자가 직접 입력' (04)
  5. 값 입력·가격 비교: 회차 칩 '11월 21일 (토) 17:00'·'VIP석'·가격 250000·매수 1·조건 6개 칩 → 대조 → **+74,000원(+42.05%)**, 직접 입력 표시, 시연 데이터 배지, YES24 링크·확인 2026. 11. 01.(날짜 단위)·sha256:37f23141d317… (05·06)
  6. 값 수정 → 재대조: '값 수정하고 다시 대조' → 가격칸을 지우고 200000 입력 → **+24,000원(+13.64%)**, 판매가 200,000원 (07·08)
  7. 조건 누락 보류: '아니거나 모름'(공연 일치 미확인) → **'가격 비교 보류'·'판매글의 공연 일치 여부를 확인하세요.'**, 차액 없음 (09·10)
- 실행 중 발견·수정(테스트 코드만): ① 화면 제목과 입력칸 접근성 이름이 모두 '판매글 입력'이라 처음엔 제목을 탭함 → 입력칸 종류(TextView/TextField)로 한정. ② 입력칸이 하단 고정 버튼에 가려져 있어 스크롤 후 탭. ③ 시뮬레이터 안 테스트 프로세스는 Mac 폴더에 직접 쓰지 못함 → 캡처를 xcresult 첨부로 남기고 스크립트가 꺼냄. ④ 첫 시도 시 스크립트가 띄운 서버 자식 프로세스가 남음 → 포트 기준 정리로 수정, 최종 실행 후 3001·8081 리스너 0 확인. 실패한 2회 실행은 위 ①·② 원인이며 앱 결함 아님. 통과 실행에는 화면 녹화가 남지 않음(Xcode 기본: 실패 시에만 녹화).
- 앱 UX 발견(수정하지 않음, 기능 변경 보류 지시): ⓐ 숫자 키패드에 완료 키가 없고 화면 바깥을 눌러도 닫히지 않아 아래 내용·대조 버튼 주변을 가림(05 캡처). 제안: ScrollView `keyboardDismissMode`/입력 보조 완료 버튼. ⓑ 직접 입력 모드에서도 각 항목에 '판매글에서 찾지 못함 · 확인 필요'·'사용자 수정' 표시가 붙어, AI 추출을 하지 않은 경로에서 오해 소지. 제안: manual일 때 추출 상태 표시 대신 '직접 입력' 표시. 둘 다 Astra 판단 후 진행.
- 구분해서 보고:
  - 타입 검사 `npx tsc --noEmit` exit 0, lint exit 0, Jest 65/65 (23:33, 앱 소스 무변경 확인용 재실행).
  - **네이티브 앱 빌드: 이번에 하지 않음**(10-28 `npx expo run:ios` 개발 빌드 재사용, 네이티브 의존성 변경 없음). UI 테스트 번들(`TicketRadarUITests-Runner`)만 `xcodebuild build-for-testing`으로 빌드(TEST BUILD SUCCEEDED).
  - **시뮬레이터 실제 조작: 통과**(위 1~7, XCUITest가 보낸 터치·키 이벤트. 사람 손 조작은 아님).
  - **실기기: 미검증**(실제 iPhone 미연결; 서버 기본 루프백이라 LAN 주소·바인딩 변경 필요). **Android: 미검증**(SDK 라이선스·adb 없음). **배포·제출: 하지 않음.**
  - 실제 AI: 검증 안 함(AI 미설정). 직접 입력 결과를 AI 결과로 표시하지 않음을 화면에서 확인.
- 재현: `cd mobile && sh scripts/ios-ui-flow.sh` (개발 빌드 설치 필요, 서버 호출 제한 때문에 연속 실행 간 1분). 사람이 따라 하는 수동 절차는 `mobile/README.md` '사람이 직접 따라 하는 수동 검증 절차'(실기기 확인에도 사용).
- 다음 행동: Astra 독립 확인 대기, UX 발견 ⓐ·ⓑ 처리 여부 결정 요청. AI 제공자가 설정되면 같은 XCUITest에 모델 추출 경로를 추가.


### [AID-20261101-ASTRA-018] CLI 팀 실행기 구성·실제 연결 검증
- 시각: 2026-11-01T23:40:01.681311+09:00
- 요청: 사용자가 개별 전달을 줄이는 자동 조율 구성 승인. Astra 최종 지휘·검수, 원본 Sol 대화는 사용자가 지정.
- 범위: scripts/aid_team.py, automation/team.json·sessions.json·README·tasks/runs·verification.json, tests/automation/test_runner.py, README 링크. 제품 코드 변경 없음.
- 모델 근거: 원본 Sol 대화 제목 AID 해커톤 준비해야해의 저장 모델 gpt-6.1-sol 확인. 자동 전용 Codex 세션도 메타데이터 gpt-6.1-sol 확인. 웹·앱 요청 opus, 실행 응답 modelUsage claude-opus-5-5 확인. 기존 대화 세션을 재개/수정하지 않고 별도 자동 세션 생성.
- 구현: 순차 큐·프로세스 잠금·검토된 선행 작업 의존성·작업별 180초/최대 2시도/한 실행 3건, 세션 ID 저장·후속 재개, 결과 파일·실패 기록. 작업자 성공은 review_pending이며 Astra 검토 후 verified.
- 검증: 실행기 단위 테스트 6/6, 세 역할 실제 READY 응답 3건과 App/Sol 동일 세션 후속 READY 2건 확인. 첫 샌드박스 Claude 인증 실패 후 승인된 실행에서 정상 연결. 증거 automation/verification.json 및 runs/. 제품 구현 성능 증거가 아님.
- 경계: 현재 작업자는 읽기 전용/패치 제안. Astra가 담당 경로·충돌 확인 후 수정안 반영·테스트한다. 자동 패치 적용·상주 데몬·기존 외부 세션 제어는 구현하지 않음. 원본 세션은 이 실행기의 잠금에 참여하지 않는다. 비용 금액 상한을 설정했다고 주장하지 않음.
- 다음: 사용자 작업을 Astra가 큐에 등록→실행→결과 검토→필요 시 피드백 재실행. 사용자가 매번 작업지시문을 복사할 필요 없음. OpenAI Docs 스킬과 공식 비대화형 실행 문서, 설치 CLI help를 사용.


### [AID-20261101-ASTRA-019] 터미널 팀 모니터 추가
- 시각: 2026-11-01T23:45:28.738851+09:00
- 범위: scripts/aid_monitor.py, AID 팀 모니터.command, tests/automation/test_monitor.py, automation/README. 제품 코드 변경 없음.
- 동작: 읽기 전용 2초 갱신, 역할별 상태/시간/요청 모델/응답 모델/최근 응답/실패, 실행기 잠금 비사용. 기존 수동 세션 제외, 완료 기록과 제품 전체 완료 구분. 터미널 제어 문자 제거·부분 JSON 내성.
- 검증: 실행기+모니터 테스트 12/12, 실제 작업 기록 --once 출력 확인(evidence/logs/astra-team-monitor-20261101.txt). Terminal 열기 명령 성공. CUA 네이티브 파이프 시작 실패로 GUI 화면 직접 확인은 못 함.
- 제한: stdout 기록 범위만 표시, 타이핑 스트리밍 아님. 상태 파일의 running과 실제 프로세스 생존 구분. Ctrl+C는 모니터만 종료.


### [AID-20261101-ASTRA-020] 자동 팀 실작업·수정 통합 검증
- 시각: 2026-11-01T23:59:09.901191+09:00
- 작성자: Astra; 실제 작업자 Sol gpt-6.1-sol 요청, Opus Web/App 실행기 세션. 상세 요청/응답은 automation/runs 저장.
- 범위: Sol 제안 server/src/extraction.ts·review-regressions.test.ts, 웹 제안 App.tsx·Astra 회귀 App.test.tsx, 앱 제안 ReviewForm/common/review·flow.test.tsx 통합. docs/official/README 및 docs/TEAM_INTEGRATION_20261101.md.
- 결과: 서버 42 tests/typecheck, 웹 38 tests/build 및 실서버 Chrome/WebKit 2건, 앱 65 tests/typecheck/lint, 앱 HTTP 어댑터 실제 서버 8건 통과. 최초 live 8 skipped 후 URL 명시 재실행. 이번 실행을 위해 시작한 서버는 종료했다.
- 발견/조치: 늦은 웹 응답이 새 판매글 화면을 덮는 문제 실패 재현 후 Opus안 반영. Sol 잘린 금액 인용 허용 추가 결함 재현→자동 피드백→span 패치 반영. 앱 manual 오해 문구와 스크롤 키보드 닫기 조정. 제품 소유자의 제안을 Astra가 검수·통합했으며 직접 수정 주체를 혼동하지 않음.
- 남음: 새 키보드 동작 시뮬레이터 재검증, 실제 AI·실기기·Android·배포·제출. 전체 완료로 표시하지 않음.


### [AID-20261102-ASTRA-021] iPhone 18 Pro D2 Release 설치·실행
- 시각: 2026-11-02T00:17:41.036913+09:00
- 사용자 요청 대상: Device Hub iPhone 18 Pro (D2). devicectl/simctl로 simulated·iOS 27.0·UDID 90702C37-ABCF-4D77-B4DF-65E1AE024B0A 확인. 실물 iPhone 설치 아님.
- 빌드: 기존 ios/app.xcworkspace app scheme Release iphonesimulator, CODE_SIGNING_ALLOWED=NO, EXPO_PUBLIC_API_BASE_URL 빈 값·EXPO_NO_DOTENV=1. 별도 DerivedData /private/tmp/aid-d2-release. BUILD SUCCEEDED. 내장 main.jsbundle 3.1MB 확인. 제품 소스 수정 없음.
- 설치: simctl install exit 0, dev.aid.ticketradar launch exit 0 PID 9269. get_app_container 성공.
- 화면: mobile/evidence/screenshots/d2-release-20261102.png 직접 열어 티켓레이더 공연 선택과 실제 API 미연결·합성 시연 데이터 배너 확인. 개발 서버 없이 내장 번들로 첫 화면 실행.
- 로그: mobile/evidence/logs/d2-release-build-20261102.log. 실서버/실제 AI 연결·전체 터치 흐름·실물 기기·스토어 제출은 검증/수행하지 않음.


### [AID-20261102-ASTRA-022] 레퍼런스 기반 UI/UX·Splash 지침과 자동 배정
- 작성자: Astra / 실제 모델 세부 ID 미노출. 사용자 UI/UX 전체 기획·지시 요청 반영.
- 범위: docs/design/DESIGN_SPEC.md(D01~D12, S00~S07), REFERENCE_GUIDE.md(앱/사이트·공식 코드), IMPLEMENTATION_TASKS.md(D0~D4), tokens.json·contrast-check.json, AGENTS 필수 준수 절, README/PLAN 링크, 실행기 UI 작업 선행 읽기 프롬프트.
- 조사: Linear Mobile 공식 소개+Inbox 이미지, Flighty 공식 소개+지연 요약 이미지 시각 확인. Wise docs 404→필수 기준 제외. Apple HIG Launching/Accessibility 공식 Markdown, Expo58 SplashScreen, React Native Animated/AccessibilityInfo, MDN reduced motion 확인. 타사 코드/자산 복제 아님.
- 결정: 밝은 중립 바탕·네이비 본문·민트 강조. 브랜드 모션 ≤700ms, 첫 화면/요청 지연 없음, reduce motion 기본정적. 네이티브 launch와 JS 장식 구분. 입력 순서/12개 조건/API·근거·시연 표시 유지. 색만 바꾸고 전체 완료 처리 금지.
- 실제 배정: 자동 작업 IDs app 20261102-093132-8f243b(D1 패치), sol 20261102-093132-a04bf0(D0 의미 검토), web 20261102-093132-ecf176(D1 패치). 실행 중이며 완료/수신은 각 runs 결과로 별도 확인. D0 검토를 통합 전 반영한다.
- 검증: 토큰 텍스트 8쌍 4.5:1 이상 수치 확인(렌더 UI 전체 접근성 검사 아님), 실행기/모니터 12개 테스트 통과. D2 설치본은 아직 기존 디자인.


### [AID-20261102-ASTRA-023] 디자인 지침 수신·D0/D1 통합 검증 및 후속 큐
- 시각: 2026-11-02T09:50:52.313244+09:00
- 작성자: Astra. 세 담당자 자동 세션 응답으로 지침 수신 확인(기존 원본 CLI 세션 수신 아님).
- D0: Sol 표시 의미 검토 완료. model 재사용·matched 의미를 D05에 반영.
- D1: Opus Web/App 토큰·레이더 브랜드 모션 패치를 Astra가 검수/적용. 앱 React ref 린트 충돌은 stable state로 보정. 웹 규정 경고/실행오류 토큰 분리·칩터치48 보정. 새 의존성 없음.
- 직접 검증: 앱69 tests/type/lint, Release 빌드·D2 설치/실행·첫화면/5.065초 녹화 프레임 검토. 웹38 tests/build, 병렬 E2E 6/8(2개 JSON 파싱 오류) 후 순차 동일검증8/8. 원인 확정하지 않음. 360/390/768/1280·reduced motion·dark OS에서 light 유지·핵심 시연/실서버 흐름 검증.
- 미완료: D2 전체 화면 구조·정보 밀도, D3 native splash(시작 녹화에서 검정→회색 전환 관찰), native Reduce Motion/VoiceOver·큰글자 직접검증. 디자인 전체 완료 아님. 실제 AI/실기기/배포/제출 없음.
- 후속 큐: web 20261102-095028-74e5e7(D2 S01/S02), app 20261102-095028-f868ab(D2 S01), app 20261102-095028-23c071(D3 native launch 조사). 등록만 했으며 아직 실행하지 않음.
- 인계: docs/design/STATUS.md 및 DESIGN_SPEC/REFERENCE_GUIDE/IMPLEMENTATION_TASKS. 기존 사용자 대화에 프롬프트 수동 전달 불필요.


### [AID-20261102-ASTRA-024] 제품 구현 보류·Pen 메인 시안과 컬러칩
- 시각: 2026-11-02T10:02:21.087511+09:00
- 사용자: 기존 메인 거절, 시안 먼저 검토해 구현 낭비 축소. 정사각형 컬러칩 추가 요청.
- 범위: Pen 기존 파일에 신규 메인 UyCdQ, 컬러칩 TezqO. 기존 화면 보존. 두 초기 렌더 캐시 작업 프레임은 숨김 처리. 제품 소스/배포 수정 없음. 대기3작업은 awaiting_design_review로 보류.
- pen-dev 스킬(schema/execute/mobile-app) 실제 읽음. 메인/팔레트 최종 screenshot 확인·클리핑0. 컬러칩은 100x100 정사각형+이름/HEX. Linear/Flighty 공식 이미지 추출 근사색4개와 자체 제안색8개를 분리. 근사값은 공식 브랜드 토큰 아님.
- PNG 저장: docs/mockups/메인-v2-시안.png, 컬러칩-팔레트.png. Pen의 Save/Save As에서 저장 버튼 비활성화·Edited 유지로 새 편집원본 저장 완료는 확인 못 함. 앱의 편집 상태는 유지, PNG는 확실히 저장.
- 다음: 사용자 시안 확인 후 수정/구현 결정. 다른 에이전트 재실행 없음.


### [AID-20261102-ASTRA-025] 사용자 보류 철회·새 메인 실제 Release 갱신
- 사용자 지시: 전체 앱 실제 구현·릴리즈, 이후 화면/기능 변경 묶음마다 D2 Release 재설치. AGENTS에 기록. OTA/상주감시는 아님.
- 자동 배정: App APP-FULL-001(20261102-100626-2082af), Sol 상태검토(20261102-100626-1359e7), 후속 내부UI APP-FULL-002(20261102-101008-549838 실행 중).
- 반영: Opus 메인 index·events 분리, compact EventList·layout·redirect·라우터테스트. Astra가 합의시안 제목/혜택/보조CTA를 조정. Sol resetFlow·checkSeq 제안을 반영하고 지연 응답 회귀3개 추가.
- 검증: 앱76 tests/typecheck/lint 통과. D2 Release 빌드·설치·실행 성공, evidence/releases/20261102-101124/home.png를 열어 새 메인 확인. 첫 화면은 공연목록이 아님.
- 반복 릴리즈 도구: mobile/scripts/release_d2.py, npm run release:d2. 현재시점 helper에 타입/lint/tests 게이트 추가. 첫 실행은 별도명령으로 사전검증했고 helper수정후 실행은 후속변경에 적용.
- 다음: 내부UI 패치 통합→재검증→두 번째 Release→D2 XCUITest 실제터치 흐름 검사. 실제 AI 미설정/시연모드 유지.


### [AID-20261102-ASTRA-026] 전체 핵심 앱 화면 통합·D2 즉시 Release 완료
- 시각: 2026-11-02T10:20:26.852610+09:00
- 수행 구분: Opus App은 홈/events/내부화면 패치 제안, Sol은 상태초기화/늦은응답 방어 제안. Astra가 코드검토·제안적용·시안 문구/배치 및 시연출처 라벨 보정·회귀테스트·빌드/설치/화면 검수를 수행. 작업자 직접 파일편집으로 주장하지 않음.
- 전체 흐름: 새 메인→공연선택→판매글→확인/수정→결과. 개발실패도구는 __DEV__에서만 접힌메뉴, Release에 노출 안 됨. 공식자료 접기/중립 폼 그룹/가격 또는 보류 우선/작은 notice 목록으로 정돈.
- 검증: 현재76 tests/typecheck/lint 통과. D2 Release를 10:11(메인),10:14(내부화면),10:19(시연출처 라벨최종) 갱신. 현재 evidence/releases/20261102-101920/release.json·home.png. main.jsbundle 내장·시연모드.
- 실제터치: 10:14 앱으로 XCUITest 메인→공연→예시입력→확인조건→결과1/1 통과, /private/tmp/aid-full-release-ui-20261102-1018.xcresult. 5단계 캡처 evidence/releases/20261102-101404/ui. 최초 XCTest 직접 launch는 검정화면으로 실패; simctl 정상시작 후 activate 방식은25초 내통과. 원인완전확정/일반시작문제로 확대하지 않음. 최종라벨보정 후에는76개/빌드/설치/첫화면 확인, 터치전체 재실행 아님.
- 지속지침: 변경묶음마다 npm run release:d2로 타입/lint/tests→빌드→설치→실행→캡처. 별도 앱스토어배포/OTA/상주파일감시는 아님.
- 남음: 실제 AI 및 공개 API, iPhone실기기/Android, native splash 추가정돈, 보조기술·큰글자 전체검증, 대회제출. 최신전체화면 상태와 제품 전체완료를 구분.


### [AID-20261102-ASTRA-027] Sol 담당 → Terra 6.1 전환
- 사용자 정정 반영: Terra가 기존 서버/shared 담당을 승계. Astra·Opus Web/App 유지. automation/team.json 실행모델 gpt-6.1-terra, 모니터 표시 Terra 6.1. 내부키 sol은 이력 호환, add terra 별칭 지원.
- 과거 Sol 작업은 유지. 모델 변경으로 기존 Sol 자동세션 재사용 없이 신규 Terra 세션 생성. 실제 TERRA_READY 응답과 세션 메타데이터 gpt-6.1-terra 확인. 실행기/모니터12 tests 통과.
- 연결시험만 수행했으며 제품작업 상주실행이나 제품AI 추출 연결로 주장하지 않음. 앱 소스변경 없음.


### [AID-20261102-ASTRA-028] 바탕화면 MD 설명서·친구 Pen 기준 라이트 적용
- 시각: 2026-11-02T15:14:52.630513+09:00
- 사용자 요청: 하네스/스킬/프롬프트 기법 Markdown, Downloads/ticket_rader_mock.pen 기준 적용, 로고는 사용자가 제작하므로 프롬프트만 제공.
- 산출물: Desktop/AID_하네스와_프롬프트_가이드/01_하네스_작동원리.md 및 02_활용_스킬과_프롬프트_기법.md. 코드 대조·UTF8/코드펜스/로컬링크 검증. 스킬 실제사용과 도구사용·미확인을 구분.
- Pen: MCP로 원본28개보드/변수/홈·입력·검토·결과 구조 읽음. Suno 참고 다크/라이트, light blue2563EB/ink0B1220. glsl3개 누락 확인. 원본파일 수정 없음. 로고 초안 프롬프트는 새팔레트로 정정.
- App 담당 작업20261102-150810-efe5d3: 라이트 토큰·pill/표면·홈 steps/공연요약 patch 반환. Astra 적용·footer 간결화·scope안내 유지. 실제API/fixture자료 조회, OCR/관리자/실제AI 읽음 표시 임의추가 없음.
- 검증: 76 tests/typecheck/lint 통과, D2 Release 빌드·설치·실행·home.png 시각확인. evidence/releases/20261102-151229. 새로운 전체native터치/다크모드/원본shader효과/최종로고는 미검증 또는 미반영.
- 현재로고는임시. 친구파일도안의 모든부속/관리자화면을 구현완료로 표시하지 않는다.


### [AID-20261102-ASTRA-029] 제공 셰이더 수신·정적 앱 효과 반영·D2 갱신
- 시각: 2026-11-02T15:26:40.244285+09:00
- 원본: Downloads/suno-cta.glsl·screen-glow.glsl·dashed-pill.glsl. docs/design/shaders로 바이트동일 사본보존. Pen 원본 상대참조 해결, 홈/CTA 정상 screenshot 확인.
- 방식: 시간uniform없는 CTA/glow를 scripts/render_shader_assets.mjs에서 원본GLSL+light uniform으로3x PNG 렌더. 점선은 nativeborder로동일목적재현. GPU 런타임/추가패키지 없음. CTA흰글자정적전체픽셀 최소대비1.59→navy47% overlay후4.61 계산. 실제모든기기/보조기술검증아님.
- 담당: Opus App 작업20261102-152107-e825f1 패치, Astra 통합·RN0.88 absoluteFillObject 제거(초기타입실패→수정)·눌림전체opacity대신경계표시·칩경계색보정.
- 검증: 76 tests/type/lint 통과. D2 Release 빌드·설치·실행·home.png 열어배경/CTA질감확인. evidence/releases/20261102-152429. 새로운전체터치/다크모드/메모리계측은미수행.
- 문서: docs/design/SHADER_INTEGRATION.md, 원본/렌더해시 및 uniform은 mobile/assets/shaders/manifest.json. 최신로고는사용자제작대기.


### [AID-20261102-ASTRA-030] Cloudflare 웹 최초 공개 배포
- 시각: 2026-11-02T22:17:33.856257+09:00
- 사용자 명시 지시: 사이트 주소 선정 및 Cloudflare 우선 배포. 기존 OAuth 계정 사용, ticketradar 기존 Worker 없음(code10007) 확인 후 신규 생성. 도메인 구매·유료플랜 변경·Git 생성 없음.
- 주소: https://ticketradar.daoule-6b5.workers.dev (Cloudflare Workers Static Assets). 버전 fbf44127-c3b8-485b-817e-0851e8420e22. wrangler4.143.0 기존 캐시사용.
- 범위: web/wrangler.jsonc·.gitignore·package.json 배포명령·README·scripts/verify-deployed.mjs·evidence/deployment. 제품 UI/기능 코드 변경 없음, 앱 재빌드 불필요. 배포대상 web/dist 정적파일만.
- 모드: VITE_API_BASE_URL 빈 값으로 빌드한 fixture-demo. 실제API/AI 미연결. 현재 웹은 기존 네이비/민트, 친구 Pen 최신 앱 디자인 이식은 별도.
- 직접 검증: 웹38 tests/build 및 Wrangler dry-run 통과. 공개HTTPS 데스크톱1280/모바일390 HTTP200, 시연안내·예시입력·확인조건·대조결과+76000·시연출처링크 확인. 수평넘침0, pageerror0, /checks·/events 외부요청0. 모바일 첫화면 캡처 직접열어확인.
- 증거: web/evidence/deployment/deployment.json·live-smoke.json·desktop/mobile home/result PNG. 후속재배포 npm run deploy:demo, 공개검증 npm run verify:deployed -- <URL>.
- 남음: 최신웹디자인·실제AI·API서버·유료운영필요여부·대회최종제출. 공개배포완료를 제품완성으로 확대하지 않음.


### [AID-20261102-DESIGN-TOSSREF-001] 토스 공개 CSS에서 디자인 규칙만 추출·티켓레이더 각색안
- 시각: 2026-11-02T22:24:31+0900 (KST)
- 작성자 / 실제 모델: Claude Code 일반 세션 / claude-opus-5-5
- 수신 대상: Astra (웹 담당 Opus 1 참조). 수신 확인 없음.
- 유형: 제안
- 파일·범위: docs/design/TOSS_DESIGN_RULES.md 신규. web/·mobile/·tokens.json 등 기존 파일 수정 없음.
- 내용: 사용자 지시("디자인 규칙만 가져와 각색")로 toss.im 공개 HTML+CSS 11개 값 빈도만 집계. 코드·폰트·이미지 복사 없음. 색은 Pen 팔레트 유지, 토스식 규칙(포인트1색+남색기운 회색, -0.02em 자간, 알약 버튼, 2겹 그림자, inset1.5px+2px 포커스 링, 높이 32/40/48/56, 0.1~0.2s 모션, blur20 헤더)만 --tr-* 토큰 초안으로 정리.
- 검증: CSS 262KB 정규식 집계 수치 근거. 크롬 확장 미연결로 렌더 화면 미확인. 토큰은 실제 웹에 미적용·미빌드.
- 결정 요청: (1) 웹 폰트 Pretendard vs Pen의 Noto Sans KR (2) safe 초록 #047857 신규 추가 여부 (3) CTA 54→56.
- 다음 행동: Astra 검토 후 웹 담당이 토큰 적용 여부 결정.

### [AID-20261102-WEB-007A] 웹 전체 디자인 변경 착수 (Pen 팔레트 + 토스 규칙)
- 날짜·시각·시간대: 2026-11-02 22:30 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델)
- 수신 대상: Astra (앱·Terra 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN / 사용자 지시("TOSS 디자인 md 반영해 웹 디자인 수정부터"), DESIGN-TOSSREF-001, docs/design/TOSS_DESIGN_RULES.md·FRIEND_MOCK_20261102.md·WEB_FULL_20261102.md·DESIGN_SPEC D01~D12
- 유형: 착수
- 담당 파일·수정 범위: `web/`만(index.css 중심, 첫 화면 히어로 마크업, 일부 컴포넌트 클래스). API·계약·검증·폼 상태·출처 표시 의미 변경 없음. 배포는 하지 않음(공개 사이트 재배포는 사용자/Astra 지시 시).
- 적용 결정(WEB_FULL 방침 준수): Pen 라이트 팔레트(#FFFFFF·카드 #1E3A8A0D·포인트 #2563EB·본문 #0B1220/#5A6478), 토스 규칙은 타이포 위계·-0.02em 자간·알약 버튼·inset 1.5px+2px 포커스 링·0.1~0.2s 전환·유리 헤더만 채택. **미채택**: 정상=초록 판정(D02/D05/D07), 숫자 카운트업(D11), Pretendard·Noto Serif 웹폰트 다운로드(D12, 설치된 경우에만 사용). CTA 54px·최소 터치 48px 유지.
- 다음 행동: 구현 → 테스트·빌드 → 360/390/768/1280 실제 브라우저(시연·실서버) 확인 → 완료 기록.

### [AID-20261102-WEB-007B] 웹 전체 디자인 변경 1차 완료 (Pen 팔레트 + 토스 규칙, 새 메인)
- 날짜·시각·시간대: 2026-11-02 22:37 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 (개발 에이전트 모델)
- 수신 대상: Astra (앱·Terra 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN / WEB-007A, 사용자 지시, TOSS_DESIGN_RULES·FRIEND_MOCK·WEB_FULL·DESIGN_SPEC·IMPLEMENTATION_TASKS(D2 Web S01~S07)·REFERENCE_GUIDE(REF-L/F, CODE-D/E)
- 유형: 완료(1차)
- 변경 파일(`web/`만):
  - `src/index.css` 전면 재작성: Pen 라이트 팔레트(흰 배경+옅은 파랑 광원, 카드 #1E3A8A0D, 안쪽 #1E3A8A14, 칩 #E6ECF5, 본문 #0B1220/#5A6478, 포인트 #2563EB), 토스 규칙(-0.02em 자간, 타이포 단계 40/28·22·17·16·14·12, 알약 버튼, inset 1.5px+2px 포커스 링, 0.1~0.4s 전환, hover는 `@media (hover:hover)`만, 유리 헤더 blur 20px, 가격 tabular-nums, 컨테이너 1120·브레이크포인트 1024/640). 테두리 대신 면·옅은 링.
  - `src/components/HomeStep.tsx` 신규: 새 메인(제목 2줄 → 설명 → "이렇게 확인해요" 3단계 → "확인 가능한 공연"(실제 목록 첫 공연·회차·장소·확인일, 외 N개) → CTA "판매글 확인 시작하기" → 보증하지 않음 안내). 앱 D2 메인과 같은 구성. 공연 선택은 다음 단계.
  - `src/App.tsx`: 단계 `home` 추가(시작 화면, 진행 단계 표시 숨김), 헤더를 화면 전체 폭 유리 바+작은 브랜드+작은 모드 배지("시연 모드 · 합성 데이터" / "서버 연결 · 결과별 시연 표시", 연결 주소는 title).
  - `src/components/ListingStep.tsx`: 시연 예시 버튼을 `<details>`로 접음(S01·S07).
  - `src/components/ResultStep.tsx`: 순서를 핵심 금액/보류 이유 → 확인할 점 → 대조에 쓴 확인값 → 서버 안내 → 추출 방식·출처 → 고지 → 수정 행동으로 재배치(S04, REF-F). 표시 값·조건 로직 변경 없음.
  - 테스트: `src/App.test.tsx`(홈 시작 단계 반영, 홈 검증 1개 추가), `e2e/flow.spec.ts`(홈 시작·접힌 예시 펼치기·홈 스크린샷), `e2e/server.spec.ts`(헤더 배지 문구·title), `e2e/design.spec.ts`(Astra D1 테스트를 새 메인·흰 배경 #FFFFFF 기준으로 갱신, 모션 축소·가로 넘침·폼 독립성 검사는 유지).
- 검증 (22:25~22:37 KST):
  - `npx tsc -b` 통과, `npx vitest run` 5 files / **39 tests 통과**, `npm run build` 통과, `npx oxlint` 경고 1건(기존 동일).
  - `npx playwright test` **17개 통과**: design(5개 구성, 360/390/768/1280 폭·모션 축소·OS 다크에서도 밝은 테마), 시연 흐름·실패 재시도(5개 구성), 실서버(Terra/Sol 서버 `npm start`, AI 미설정) Chrome·WebKit iPhone 14.
  - 대비 계산(WCAG): 본문·보조·상태 글자 모든 쌍 4.74~18.7:1. 4.5 미만은 비활성 단계 글자(#8A94A6, 2.81:1, 비활성 예외)뿐. Pen 상태색 일부는 대비 확보를 위해 같은 계열에서 진하게 사용(주의 #92400E, 확인 필요 #9A3412, 오류 #B91C1C).
  - 직접 열어 확인한 화면: chrome-desktop 홈(0-home), design 768 홈, webkit-iphone 홈·확인 화면, server-chrome·server-webkit-iphone 결과(s4). 전체 페이지 스크린샷에서 고정 헤더가 중간에 찍히는 것은 촬영 방식의 현상(실화면 상단 고정).
- D01~D12 준수표:
  - D01 토큰: ⚠ tokens.json(v1 네이비·민트)이 아닌 FRIEND_MOCK Pen 값 사용 — 사용자 지시(친구 Pen 우선)·WEB_FULL 근거. tokens.json 갱신은 Astra 소유로 미수정. 화면별 임의 그라디언트 없음(배경 광원 1개만).
  - D02 색 의미: ✅ 포인트 파랑+중립 회색, 규정 불일치·확인 필요=주황 계열, 오류만 빨강. 초록 사용 없음.
  - D05 표시 의미: ✅ fixture/manual/model·reused 문구, matched≠안전(파랑 정보색), 공식+합성 판매글 배지(W1) 유지.
  - D06 원문/수정값/공식 문구 구분: ✅ 변경 없음(인용·공식 인용 스타일만 변경).
  - D07 보류: ✅ 보류 시 숫자 없이 사유, 안전 체크 아이콘 없음.
  - D10 폼/API 흐름: ✅ 응답 검증·조건 입력·늦은 응답 무효화 그대로, 시연·실서버 모두 브라우저 통과.
  - D11 모션: ✅ 장식만, 카운트업·가짜 진행률 없음, 브랜드 1회(축소 시 정적).
  - D12 의존성·폰트: ✅ 새 패키지·웹폰트 다운로드 없음. Pretendard는 설치된 경우에만(이 Mac 미설치 → Apple SD Gothic Neo). Noto Serif 제목 미사용.
  - S01~S07: S01 작은 배지·행 목록·시연 도구 접기 ✅, S02 ✅, S03 그룹 유지·미확인 노란 반복 제거 ✅, S04 순서 재배치 ✅, S05 원문 접기 ⏳(수동 입력 전체 원문 인용 접기는 미적용), S06 ✅(기존), S07 ✅.
  - D03·D04·D08·D09(앱·splash·큰 글자 등): 웹 해당분만 — 200% 확대·키보드 전체 순회는 이번에 별도 실측하지 않음.
- 미수행·한계: 공개 사이트(ticketradar.daoule-6b5.workers.dev) **재배포 안 함**(배포는 사용자/Astra 지시 시). 앱(mobile/) 변경 없음 → D2 Release 재빌드 대상 아님. 실제 Safari 앱·실기기 미검증. 실제 AI 미검증(완료 아님). 토스 문서의 결정 요청 3건은 WEB_FULL 방침대로 처리(Pretendard 미다운로드, safe 초록 미채택, CTA 54 유지).
- 다음 행동: Astra 디자인 검수(D4) → 승인 시 `npm run deploy:demo`로 재배포. S05 긴 원문 접기는 후속.

### [AID-20261102-WEB-007C] 웹 디자인 변경 공개 재배포 (사용자 상시 지시)
- 날짜·시각·시간대: 2026-11-02 22:40 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN 배포 / WEB-007B, ASTRA-030
- 유형: 사용자 지시·배포
- 사용자 지시: "항상 사이트 수정끝나면 재배포 해줘" → 앞으로 웹 수정 묶음은 테스트·빌드·브라우저 검증 통과 후 웹 담당이 `npm run deploy:demo`로 재배포하고 공개 검증까지 기록한다(WEB-007B의 "배포는 지시 시" 문구를 이 지시로 대체).
- 배포: `npm run deploy:demo`(테스트 39 통과 → VITE_API_BASE_URL 빈 값 빌드 → wrangler 4.143.0) → https://ticketradar.daoule-6b5.workers.dev, Version ID f17268a5-6439-4de0-9854-d86f62450ee4. 공개 모드는 fixture-demo(실제 API·AI 미연결) 그대로.
- 변경 파일: `web/scripts/verify-deployed.mjs`(Astra 작성, web 소유 경로) — 새 메인 기준으로 갱신: 작은 모드 배지·title, 홈의 실제 목록 공연 요약 확인 추가, 시작 버튼명 "판매글 확인 시작하기", 접힌 시연 예시 펼치기. 기존 검사(HTTP 200, 가로 넘침 0, pageerror 0, /checks·/events 외부요청 0, +76,000원·시연 링크) 유지.
- 검증: `npm run verify:deployed -- <URL>` 1차는 이전 문구 기대 때문에 실패 → 스크립트 갱신 후 desktop1280·wide1440·tablet768·mobile390·small360 **5개 모두 통과**(fixtureFlow passed, overflow 0, errors 0). 공개 mobile 홈 캡처 직접 열어 새 디자인 확인. 증거 web/evidence/deployment/*.png, live-smoke.json.
- 한계: 실제 AI·API 서버 미연결 공개본. 실제 Safari 앱·실기기 미검증.

### [AID-20261102-WEB-008A] 소개 랜딩(스크롤 몰입) + 전체 효과 적용 착수 — 사용자 결정
- 날짜·시각·시간대: 2026-11-02 22:43 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX / WEB-007B·C, TOSS_DESIGN_RULES 7절, DESIGN_SPEC D11·모션 규칙
- 유형: 사용자 결정·착수
- 사용자 결정(원문 요지): "CSS·JS·React 효과를 최대한 전부 넣고, 메인 화면은 서비스 소개 화면으로, 소개를 다 읽으면 '서비스 체험하러 가기'. 실제 스크롤하며 점점 빠져드는 몰입감과 궁금증 유발." → DESIGN_SPEC의 '효과 최소·패럴랙스 금지·이동 최대 8px' 제한을 이 사용자 결정으로 웹 소개 화면에 한해 완화한다(AGENTS: 지침 변경은 사용자 결정).
- 유지하는 원칙: 숫자 카운트업·가짜 진행률·가짜 실시간 감시/외부 매물 수집처럼 보이는 레이더 스캔 금지, 효과가 입력·요청·화면 진입을 막지 않음, prefers-reduced-motion에서 모든 효과 정지, 소개 화면의 판매글·공식 문구·결과는 '가상 공연 예시'로 표시, 실제 AI 작동 주장 금지, 새 라이브러리·웹폰트 없음.
- 범위: `web/`만. 완료 후 테스트·빌드·브라우저 검증 → 재배포(사용자 상시 지시).

### [AID-20261102-WEB-008B] 소개 랜딩(스크롤 몰입) + 전체 효과 완료·재배포
- 날짜·시각·시간대: 2026-11-02 22:52 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra (앱 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX / WEB-008A(사용자 결정), WEB-007B·C
- 유형: 완료·배포
- 변경 파일(`web/`만): 신규 `src/components/Landing.tsx`(7개 섹션 스크롤 스토리), `src/ui/useScrollEffects.ts`(reveal·scrub·읽은 정도·헤더 스크롤 상태, 모션 축소/미지원 시 정지·전부 표시), `e2e/landing.spec.ts`. 수정 `src/App.tsx`(메인=랜딩, 헤더 "바로 체험하기"/"서비스 소개", 단계 변경 시 맨 위로, `main key={step}` 진입 효과, 진행 단계 `--step`, 모드 배지 모바일 짧은 문구+aria-label, 푸터를 앱 밖으로), `src/components/EventStep.tsx`(스켈레톤 로딩), `src/index.css`(랜딩·모션 계층·유리 헤더 스크롤 전환·미끄러지는 단계 표시·흐르는 CTA·스켈레톤·details 전환·hover 들림·keep-all 줄바꿈), `src/App.test.tsx`, `e2e/{flow,server,design}.spec.ts`, `scripts/verify-deployed.mjs`, README. 삭제 `src/components/HomeStep.tsx`(WEB-007 홈, 랜딩 끝 섹션으로 대체).
- 검증 (로컬): `tsc -b` 통과, vitest **39 통과**, build 통과, oxlint 경고 1(기존). Playwright **27개 통과** — landing(5개 구성 × 2: 실제 스크롤 시 --p 0.02→0.95+ 진행, 강조·질문 불투명도 1, 헤더 is-scrolled, 가로 넘침 0, CTA 후 scrollY 0 / 모션 축소에서 .fx 없음·전부 보임·CTA 애니메이션 none·sticky 해제), design·flow(5개 구성), 실서버(Chrome·WebKit iPhone, AI 미설정).
- 검증 중 발견·수정: ① 판매글 구간 마지막 질문이 스크롤 끝에서도 opacity 0.98(등장 시점 늦음) → 시작점 0.86→0.76. ② 모바일 헤더 2줄 → 배지 짧은 문구·nowrap. ③ 데스크톱 히어로 단어 중간 줄바꿈 → keep-all. ④ 모바일 푸터 여백 없음 → 패딩.
- 직접 본 화면: 데스크톱 히어로·판매글 중간·공식 대조·결과 미리보기, iPhone 단계·판매글 끝·최종 CTA, 공개 모바일 스크롤 60% 지점.
- 배포: `npm run deploy:demo` → https://ticketradar.daoule-6b5.workers.dev Version ID ff7fdf96-08d5-485a-82eb-5d2a6d311c3d. `verify:deployed` 5개 폭 통과(overflow 0, errors 0, 외부 API 요청 0). 공개 주소 모바일에서 .fx 활성·스크롤 진행 0.600·헤더 is-scrolled 확인(evidence/deployment/mobile-landing-scroll.png).
- 디자인 지침 관계: DESIGN_SPEC 모션 제한(효과 최소·패럴랙스 금지·이동 8px)은 WEB-008A 사용자 결정으로 소개 화면에 한해 완화. 유지: 카운트업·가짜 진행률·가짜 실시간 감시/스캔 없음, 입력·요청을 막는 효과 없음, 모션 축소 전부 정지, 예시는 가상 공연 표시, 실제 AI 주장 없음, 새 의존성·웹폰트 없음. 무한 반복 장식(배경 광원·CTA 흐름·카드 떠다님·스크롤 안내)은 모션 축소에서 꺼짐. tokens.json 미수정(Astra 소유).
- 한계: 실제 Safari 앱·실기기·스크린리더 실측 미수행. 공개본은 fixture-demo(실제 API·AI 미연결). Astra D4 디자인 검수 대기.

### [AID-20261102-WEB-009] 화면 점검(글자 크기·정렬)·CTA 빛줄기 반복·티켓 일러스트·재배포
- 날짜·시각·시간대: 2026-11-02 23:15 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX 후속 / WEB-008B, 사용자 지시("검증해봐, 폰트 크기 문제", "CTA 물결 3초마다 반복", "센터링이 아래로", "투명 배경 티켓 SVG 비스듬히")
- 유형: 점검·수정·배포
- 점검 방법: 신규 `web/scripts/audit-ui.mjs`(`npm run audit:ui -- <URL>`) — Chrome 360/390/768/1280/1440·WebKit 390/1280에서 소개·체험 4단계 화면의 실제 글자 크기 분포, 12px 미만(SVG는 viewBox 배율 반영), 넘침·화면 밖 요소, 제목 줄 수 수집 + 전체 화면 저장(`web/evidence/audit/`). 세로 중앙은 별도 측정(보이는 영역=헤더 아래~화면 끝 중심과 내용 묶음 중심 차이).
- 발견 → 수정:
  1. 글자 크기 17단계 혼재 → 12/14/16/18/20/24/28/32/36/40/48/56 단계로 통일(체험 화면은 화면당 5~6단계).
  2. 768px 태블릿에서 데스크톱 크기(히어로 64px) 적용 → 1024px 이하 태블릿 크기 추가(히어로 48, 섹션 28).
  3. 12px 미만: 출처 버전 code 11.9px → 12px. 티켓 SVG 글자 화면상 6.7~11px → 16단위로 올려 360px에서도 12px 이상.
  4. 헤더 버튼 색 전환 중 파란 바탕+검은 글자(대비 저하) 순간 노출 → 버튼별 key로 새로 그림. 모션 축소 시 전환·애니메이션 전역 정지 추가.
  5. 히어로 세로 중심이 21px(데스크톱·태블릿)/11px(모바일) 아래 → 원인: 높이 계산이 실제 헤더(72+16px)와 불일치 + `.landing section` 의 padding 단축 속성이 히어로 세로 여백을 0으로 덮어씀(선택자 우선순위). padding-inline으로 바꾸고 높이 `100svh-88px`(모바일 72px) → 측정 −6px(시선상 약간 위)/−1px. 스크롤 고정 구간은 −4~2px로 정상.
- 사용자 요청 반영: CTA(`btn-flow`) 빛줄기를 3초 주기 무한 반복(1.2초 이동+1.8초 쉼, 모션 축소 시 없음, e2e로 `::after` sheen 3s infinite 확인). 히어로에 직접 그린 투명 배경 티켓 SVG(`src/components/TicketArt.tsx`) −9° 기울임·천천히 떠다님·빛 반사 3초 주기, aria-hidden, "가상 티켓" 표시를 예시 카드에 가리지 않는 위치에 배치.
- 참고: 사용자가 첨부한 스크린샷은 티켓레이더가 아닌 다른 작업 창(Cline·Codex)이어서 정렬 판단은 직접 측정으로 함.
- 검증: tsc 통과, vitest 39, Playwright 27 통과(landing에 sheen 반복·티켓 aria-hidden·가상 표시 검사 추가). 로컬·공개 audit 모두 12px 미만 0·넘침 0. 직접 본 화면: 768 랜딩 전체, 390 확인 화면, 1280 공연 선택(헤더 버튼 정상 회색)·결과, 히어로+티켓 1280/390, 티켓 확대 390.
- 배포: `npm run deploy:demo` → Version ID e9b5dbbc-dde8-407a-8d62-18b9f6800ebd, `verify:deployed` 5개 폭 통과, 공개 audit 문제 0.
- 한계: 실제 Safari 앱·실기기 미검증. 공개본 fixture-demo. 티켓 일러스트는 장식이며 실제 티켓 이미지·상표 아님.

### [AID-20261102-WEB-010] toss.im 스크롤 연출 관찰 → 클린룸 재구현·재배포
- 날짜·시각·시간대: 2026-11-02 23:27 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX 후속 / WEB-009, 사용자 요청("토스 페이지 REA", "코드 복사 후 재창작")
- 유형: 조사·구현·배포
- 범위 결정: 사용자가 토스 코드 복사 후 재창작을 제안 → 복사본은 수정해도 2차적 저작물이고 웹이 이미 공개 배포 중이라 **코드·이미지·문구·폰트는 복사하지 않음**. 대신 학습용 분석(공개 페이지 렌더링 관찰 + 공개 스크립트를 프로젝트 밖 임시 폴더에서 키워드 검색만)과 클린룸 재구현으로 진행. 사용자 동의.
- 관찰·명세: `web/docs/TOSS_MOTION_STUDY.md` — 1280/390 렌더링 스크롤 기록(페이지 50,522px·sticky 900px 무대 다수), 관찰 A~K(전면→카드 축소, 좌측 섹션 표시, 제목 1.8배→1배, 스크롤 비례 등장, 단어 좌우 분리, 단어 쌓기, 교차 페이드, 글자 굴림, 숫자 계수기, 스프링 물리 라이브러리 추정)와 적용/보류/미적용 결정. 숫자 계수기(카운트업, D11)와 관성 스크롤(접근성)은 미적용. 원본 자료는 저장소 밖 임시 폴더에만 있음.
- 변경 파일(`web/`만): 신규 `src/components/RollText.tsx`, `docs/TOSS_MOTION_STUDY.md`. 수정 `src/components/Landing.tsx`(히어로 sticky 무대·섹션 id·좌측 섹션 표시 `useActiveSection`·단어 쌓기 질문·좌우에서 모이는 마지막 제목·CTA 글자 굴림), `src/App.tsx`(헤더 버튼 글자 굴림+aria-label), `src/index.css`(무대 패널 --p 연동 inset·반경, 히어로 끝 페이드, 티켓 translate/rotate 스크롤 연동, 좌측 대시, scrub-zoom, scrub-word, gather, CSS linear() 스프링 곡선, roll), `e2e/landing.spec.ts`(무대 반경 0→20px 이상, 단어 쌓기 마지막 단어 표시, 역할 기반 CTA).
- 검증: tsc 통과, vitest 39, Playwright 27 통과. 세로 중앙 재측정 히어로 −2px(1280·768)/0px(390), 스토리 −5~1px. 직접 본 화면: 데스크톱 히어로(전면)·카드 축소 상태·판매글 구간(좌측 표시 이동).
- 배포: Version ID d1d8703c-7ae9-416f-bb6e-eb80726b9ddb, verify:deployed 5개 폭 통과(live-smoke.json 14:27Z), 공개 audit 문제 0.
- 한계: 실제 Safari 앱·실기기 미검증. CSS linear() 미지원 구형 브라우저는 기본 곡선으로 동작. 교차 페이드(H)는 보류.

### [AID-20261103-WEB-011] 예시 티켓(임곡대동제·카운트업)·헤더 구성·효과 타이밍(겹침) 점검·재배포
- 날짜·시각·시간대: 2026-11-03 00:26 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX 후속 / WEB-010, 사용자 지시(임곡대동제 예시 티켓·임의 가격 19,770원, 헤더가 허전함, 효과 타이밍·겹침 검증, 헤더 버튼 hover 이상)
- 사용자 결정(지침 예외): 카운트업은 **임의로 정한 장식용 예시 가격에만** 허용(DESIGN_SPEC D11 예외). 서버 대조 결과 금액에는 계속 쓰지 않음. 예시 가격 19,770원은 대림대학교 설립일(1977. 6. 24.)에서 딴 임의 값이며 티켓에 "가상 티켓·가상 예시·실제 판매 아님" 표시, 학교 로고 미사용.
- 변경 파일(`web/`만): 신규 `src/ui/useCountUp.ts`(rAF, 끝에서 감속, 모션 축소 시 즉시 최종 값), `src/components/SiteHeader.tsx`(로고 버튼=처음 화면, 데스크톱 가운데 소개 메뉴 5개·현재 구간 밑줄, 태블릿·모바일 메뉴 버튼+펼침 메뉴 Esc·바깥 누르기로 닫기, 모바일은 로고만 보이고 이름은 보조기기용), `scripts/audit-motion.mjs`(효과 타이밍 겹침 점검). 수정 `src/components/TicketArt.tsx`(2026 임곡대동제·₩19,770 카운트업), `src/components/Landing.tsx`(예시 카드 문구, `onActiveChange`), `src/App.tsx`(SiteHeader, 체험 중 메뉴 선택 시 소개로 돌아가 해당 구간 이동), `src/index.css`, `scripts/audit-ui.mjs`(SVG 실제 크기·1px 숨김 요소 제외), `e2e/landing.spec.ts`(카운트업 최종 값·모션 축소 즉시 값, 헤더 메뉴·모바일 메뉴·hover 무이동·글자 굴림 완료 5개 구성).
- 효과 타이밍 점검(`audit-motion`): 소개 화면을 60px 간격 스크롤하며 전환 중(150ms)·완료 후(900ms) 실효 불투명도 0.35 초과 블록끼리 겹침 측정 + 체험 4단계 진입 직후·완료 후. 1차 발견(실제): ① 768px 히어로 티켓 × 예시 카드 ② 구간 제목 확대 등장 × 아래 카드(1280·1100·768) ③ 1100px 왼쪽 섹션 표시 × 본문. 오탐: 여러 줄 형광펜 외곽 상자, 닫힌 details 안 예시 버튼(측정 로직 보정). 수정: 카드를 티켓 아래 36px 간격 배치, 제목 효과를 이동 없이 12% 확대+흐림에서 제자리로(소제목·카드 여백 안), 섹션 표시는 1240px 이상에서만. 2차: 소개·체험 전 구간 4개 폭 **겹침 0건**.
- 헤더 hover 이상 원인: 작은 헤더 버튼이 hover 시 1px 떠오르며 포인터가 경계를 들락거려 글자 굴림이 시작·취소를 반복, 중간 상태(두 줄 반씩)에 걸림 → 작은 버튼은 떠오름 제거, 굴림 곡선을 넘침 없는 0.32s로. e2e로 hover 시 위치 변화 <0.5px, 굴림 정확히 절반에서 정지 확인.
- 검증: tsc 통과, vitest 39, Playwright 32 통과. 배포 Version ID c9ef50f4-3856-4e26-a3b9-887f8f692923, verify:deployed 5개 폭 통과(배포 직후 1회는 결과 미기록 → 재실행 통과), 공개 audit:ui 문제 0. 공개 audit-motion 결과는 아래 보충.
- 한계: 실제 Safari 앱·실기기 미검증. 공개본 fixture-demo.

### [AID-20261103-WEB-012] 버튼 글자 굴림 버그 근본 수정·소개 하단 섹션 효과·메뉴 이동 위치·재배포
- 날짜·시각·시간대: 2026-11-03 00:46 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: WEB-DESIGN-FX 후속 / WEB-011, 사용자 지적(CTA·헤더 버튼 hover 시 두 줄 반씩, 결과 미리보기·판단하지 않는 것 구간에 효과 없음, 메뉴 이동 시 효과 전 흐린 화면)
- WEB-011 정정: hover 이상의 원인을 "1px 떠오름으로 인한 hover 깜빡임"으로 기록했으나 **근본 원인은 아니었음**. 실제 원인은 글자 굴림 기둥(.roll-char)이 flex 늘이기(stretch)로 1.3em에 맞춰져, hover 시 translateY(-50%)가 0.65em만 이동해 두 벌 글자가 반씩 보인 것. 당시 e2e도 같은 늘어난 높이를 기준으로 비교해 오탐 통과. → 기둥을 2.6em 고정·align-items:flex-start, 이동을 -1.3em로 지정. e2e는 보이는 창(.roll)과 두 번째 글자 상자가 1px 이내로 일치하는지 검사(헤더 버튼·하단 CTA, 아래 가장자리 1px 포인터 포함). 모든 버튼·카드의 hover 이동 효과도 제거(그림자만).
- 소개 하단 효과: 결과 미리보기 카드 3D로 일어서며 등장, 예시 금액 +76,000원 카운트업(가상 공연 예시값, 화면 진입 후 시작, 실제 결과 화면엔 미사용), 확인 항목 순차 진입·스캔 빛·칩 확대. 판단하지 않는 것 카드에 직접 그린 선 아이콘(`src/components/LimitIcons.tsx`) 그려지기·카드 순차 상승, 마무리 문장 형광 밑줄 스윕. `useCountUp`에 enabled, `useInView` 추가.
- 메뉴 이동: 스크롤 연동 구간은 시작점(진행 0, 흐린 상태)이 아닌 내용이 모두 드러난 지점(data-nav-at, 기본 0.95/사용 방법 0.92)으로, 일반 구간은 헤더 아래로 이동(`scrollToSection`, 헤더 메뉴·좌측 섹션 표시·체험 중 메뉴 공통). e2e로 도착 시 --p>0.88·마지막 단계 불투명도 1·제목 흐림 없음 확인.
- 검증: tsc 통과, vitest 39, Playwright 32 통과. 겹침·타이밍 점검(`audit-motion`, 소개+체험 4단계, 390/768/1100/1280) **0건**. 배포 Version ID 3270c550-abae-4851-8004-1fc4371f645d, verify:deployed 5개 폭 통과(15:45:39Z), 공개 audit:ui 문제 0. 직접 본 화면: hover 상태 헤더 버튼·CTA, 결과 미리보기 0.3/1.5초, 판단하지 않는 것 1.2초, 메뉴 이동 후 사용 방법·문제 구간.
- 참고: 앞선 공개 사이트 audit-motion 실행 1건은 대상이 이전 버전이 되어 직접 중단(exit 144, 사이트 오류 아님).
- 한계: 실제 Safari 앱·실기기 미검증. 공개본 fixture-demo.


### [AID-20261103-TERRA-WEB-MOTION-001] 스크롤 휴대폰 시안
- 시각: 2026-11-03T00:59:06.693074+09:00
- 작성: Terra / gpt-6.1-terra, 협업 서브에이전트 web_motion 구현.
- 범위: web/src/components/Landing.tsx, web/src/index.css, web/e2e/landing.spec.ts. CSS 원근 휴대폰 접근 시안 및 흐림·빈 장면 완화. 실사 인물과 카메라 시점 전환 미구현.
- 검증: 담당자 npm test 39 및 build 통과, Astra 역할 검토자가 Chrome 데스크톱·모바일 기존 랜딩/디자인 8개 통과, 담당자 새 장면 Chrome 데스크톱 4개 통과. 직접 새 장면 시각 검수 중 브라우저 사용 변경으로 중단. 실제 Safari·실기기 미검증.
- 공개 재배포 미실행, fixture-demo 유지. 후속: 시각 검수 및 실사 수준 연출 기획·구현 후 재검증·배포.


### [AID-20261103-TERRA-DEPLOY-002] 사용자 요청 공개 배포
- 시각: 2026-11-03T01:00:57.005980+09:00
- 작성: Terra / gpt-6.1-terra. 대상: Cloudflare Workers ticketradar, https://ticketradar.daoule-6b5.workers.dev. 버전 ef4609cb-0232-431d-92b4-d9a05fca2957.
- VITE_API_BASE_URL 비운 빌드, 시연 fixture; 실제 AI/API 미연결. 로컬 서버 실행 없이 빌드·배포.
- 공개 검증: verify:deployed 360/390/768/1280/1440 Chrome, HTTP 200, 시연 흐름·출처·넘침·페이지 오류·외부 API 요청 검사 통과. 화면 캡처 web/evidence/deployment/. 새 장면의 직접 시각 검수·실제 Safari/실기기는 미수행.


### [AID-20261103-TERRA-PHONE-003] 휴대폰 연출 동기화·배포
- 시각: 2026-11-03T01:05:49.064329+09:00
- 작성: Terra / gpt-6.1-terra, 구현: 협업 서브에이전트 phone_animation.
- 파일: web/src/components/Landing.tsx, web/src/index.css. 3단계 15초 반복, 모션 축소 정지, CSS 기기 외관. 실제 사진·3D 모델 아님.
- 검증: 작업자 보고 Vitest 39·빌드 통과, 리더 빌드 통과. 공개 verify:deployed 첫 실행 제목 미발견 실패, 재실행 5개 폭 통과. 공개 Chrome 시간 경과 측정에서 왼쪽/오른쪽 1→2→3 일치, 축소 설정 animation none 확인. 직접 시각/실기기 검증 미실행.
- 배포: Cloudflare Workers 버전 db85e4b1-90aa-42ad-831c-cca794eff59e, 시연 fixture.


### [AID-20261103-TERRA-PHONE-3D-004] 3D 모델·스크롤 동기화
- 시각: 2026-11-03T01:23:09.018035+09:00
- 담당: Terra / gpt-6.1-terra 통합·배포; 협업 에이전트 web_3d 구현, model_inspect 분석.
- 사용자 제공 iphone_17_pro.glb 23074808 bytes, OLED 화면에 CanvasTexture로 가상 3단계; Ranguel CC BY 4.0 출처 표시. 스크롤 구간 sticky, 단계 0/1/2 동일 진행률 사용, 축소모드 정적. 전면 유리 메쉬만 숨겨 화면 가독성 확보.
- 담당자 검증: Vitest 39·빌드 통과; 서버 없이 브라우저 렌더 390/1280에서 스크롤 전후 왼쪽과 3D 화면 0→1→2→0 일치, 축소모드 정적. 390 캡처 /private/tmp/aid-scroll-390-0.5.png. Terra가 캡처 직접 확인, 최종 빌드 성공.
- 배포: Cloudflare Workers 버전 7f5f71ca-e2bd-47a7-9e5c-bf0620a0995a. 공개 verify:deployed 360/390/768/1280/1440 시연 흐름 통과. 공개 3D 장면 자체·실기기 성능 미검증. 약 22MiB 모델 및 분리 three 번들 743KB(압축188KB), 로딩 비용 주의.


### [AID-20261103-TERRA-PUBLIC-CORRECTION-005] 공개 구버전 응답 정정
- 시각: 2026-11-03T01:26:49.109838+09:00
- 담당: Terra / gpt-6.1-terra, sticky_audit 독립 확인.
- 정정: PHONE-3D-004의 배포 성공은 Cloudflare 관리 plane 기록이며 공개 최신 코드 제공을 입증하지 못함. verify:deployed는 구버전도 통과. curl·Chromium·WebKit에서 공개 HTML이 이전 db85 해시 index-CV8WEWm9.js와 index-84lgEshf.css 반환, 3D 자산 경로는 HTML fallback. 따라서 공개는 자동 반복 구버전. 정확한 캐시/라우팅 원인은 미확정.
- 수정 시도: web/public/_headers에 / 및 /index.html no-store, 빌드·efc33b49-5998-4860-bcd4-8a70321e3432 배포; 배포 이력 100% 활성이나 공개 여전히 구버전. 최신 적용 주장 금지.


### [AID-20261103-TERRA-LUCIDE-006] Lucide 아이콘 및 버전 주소 검증
- 시각: 2026-11-03T01:30:05.583161+09:00
- 작성: Terra / gpt-6.1-terra; web 소유 Lucide 구현 에이전트 lucide_icons. TicketX, DoorClosed, Gavel과 선 그리기, reduced motion 유지. 테스트 39 통과 및 서버 없는 브라우저 캡처 /private/tmp/aid-lucide-no-preference.png 직접 검토.
- Cloudflare 배포 b0f5ca72-dff1-4a64-87a2-ccb180acad91. 버전 URL https://b0f5ca72-ticketradar.daoule-6b5.workers.dev/ 에서 최신 JS/CSS와 5개 폭 fixture flow 통과. 기본 주소는 구버전 CV8WEWm9 계속 반환, 원인 미확정.
- 직전 efc33b49 버전 브라우저 독립 검증: 1280 Chrome·390 Chrome/WebKit 스크롤 위치 단계 0→1→2→0, 고정 top72, 각 단계 5.2초 정지 중 자동 변화 없음. 실제 모바일 Safari 미검증.


### [AID-20261103-TERRA-MOTION-007] 접근 타이밍·버튼·아이콘
- 시각: 2026-11-03T01:36:59.748534+09:00
- 작성 Terra / gpt-6.1-terra; 협업 에이전트 motion_timing, button_hover, icon_hover 구현.
- 휴대폰 접근 progress 0.45 완료 후 0.65/0.82에서 단계 전환; 상단 hover Let’s Go!, 하단 가시죠!, Lucide 티켓·문·망치 hover. 모션 축소 처리.
- 검증: 각 담당자 Vitest 39/build 통과, 서버 없는 브라우저 검증 390/1280 + WebKit(접근·단계), hover/키보드·3개 아이콘·축소모드, 캡처 /private/tmp/aid-hover-1.png 리더 확인. 리더 최종 build 통과, 버전 URL 5폭 시연 흐름 통과.
- Cloudflare 버전 9f6a2d43-b5dc-4331-a2e2-38f18de06ef7, URL https://9f6a2d43-ticketradar.daoule-6b5.workers.dev/. 기본 주소는 계속 구버전 CV8WEWm9, 원인 미해결. 실기기 미검증.


### [AID-20261103-TERRA-STORY-008] 스토리·배경 연결 개선
- 시각: 2026-11-03T01:44:31.203995+09:00
- 작성 Terra / gpt-6.1-terra; steps_motion 및 web_3d 에이전트 구현.
- 사용방법 1 확대→하늘색 밑줄→진행선, 대조 카드/금액 순서 강조, hero 배경에서 phone scene 연결, 3D 최초 프레임 전 fallback 겹침 제거.
- 담당자 npm test 39/build 및 서버 없는 Chrome 390/1280·WebKit390 단계/경계/reduced motion 검증, 리더 390 steps·1280 경계 캡처 검토. 3D 로딩 지연/실패 경로 검증. 최종 빌드 통과.
- Cloudflare 버전 38911af6-0c9b-41f8-935b-2eea3bbe7fbd, 버전 URL https://38911af6-ticketradar.daoule-6b5.workers.dev/ 에서 5폭 fixture flow 통과. 기본 URL 구버전 문제 미해결, 실기기 미검증.


### [AID-20261103-TERRA-PHONE-009] 휴대폰 확대 및 전환
- 시각: 2026-11-03T01:51:14.813854+09:00
- 작성: Terra / gpt-6.1-terra, 구현: phone_transition 협업 에이전트. Phone3D.tsx 및 index.css. 휴대폰 확대, 스크롤 위치에 맞춘 순차 페이드, 정지 시 변화 없음, reduced motion.
- 검증: 담당자 Vitest 39·build 및 서버 없는 Chrome 1280/390·WebKit390 스크롤·역방향·축소모드 통과, 리더 캡처 /private/tmp/aid-phone-new-chrome-390.png·1280.png 직접 확인, 최종 build 통과.
- 배포: 버전 5d7c2ced-4de7-4994-967e-75a4e409a47f; https://5d7c2ced-ticketradar.daoule-6b5.workers.dev/ 5개 폭 공개 fixture flow 통과. 기본 주소 구버전 문제 및 실기기 검증 미해결.

### [AID-20261103-APP-012] 앱 UI/UX 대개편·필기체 로고 Splash 착수 (사용자 지시)
- 날짜·시각·시간대: 2026-11-03 02:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Terra·웹 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-002 / 사용자 지시("웹 버전 참고해서 대대적으로 핸드폰 UI/UX 개편, 전환·텍스트 출현 효과, 고급지게, 사용자 제작 필기체 로고가 써지는 Splash", "계속 진행해봐 전부다"), ASTRA-021~029(현재 앱 구조·D2 Release), DESIGN_SPEC D01~D12, FRIEND_MOCK·TOSS_DESIGN_RULES·WEB-007~012·TERRA 웹 모션 기록
- 유형: 착수
- 담당 파일·수정 범위: `mobile/`만. 예정: package.json·lock(`react-native-svg`, `react-native-reanimated` 직접 의존성—npx expo install), `app.json`(네이티브 시작 화면 배경), `assets/brand/`(사용자 제공 로고 PNG 사본), `src/components/`·`src/app/`·`src/ui/theme.ts`·신규 Splash/모션 컴포넌트, `__tests__/`, `e2e-ios/`, `README.md`, `evidence/`. `shared/`·`server/`·`web/`·루트 문서 수정 없음(본 기록 제외).
- 디자인 지침과의 차이(사용자 결정으로 기록): ① DESIGN_SPEC S01은 브랜드 모션 ≤700ms·전체 화면 강제 노출 금지, D12는 새 UI 라이브러리 금지다. 사용자가 필기체 로고가 써지는 Splash(약 2.5초)와 고품질 전환을 직접 지시했으므로 따른다. 지침 취지는 유지: 탭하면 즉시 건너뜀, Reduce Motion·설정 조회 실패 시 정적, Splash 중에도 공연 목록을 미리 불러와 지연 없음, 애니메이션 콜백 실패해도 앱 진입. ② 로고의 빨간 밑줄·조준 표시는 사용자 로고 고유색으로 Splash/브랜드에만 쓰고, UI 상태색(D02: 빨강=오류만)으로 쓰지 않는다. ③ D11 성공 카운트업은 채택하지 않는다(결과 숫자 그대로 표시).
- 유지: API·응답 검사·12개 조건·previousCheckId·manual·409·늦은 응답 무효화·실제/시연/수동/AI 표시, 기존 접근성 레이블(테스트 선택자).
- 다음 행동: 로고 필기 경로 제작 → Splash → 전체 화면 개편 → Jest/tsc/lint → D2 Release 재빌드·설치·시작 녹화·XCUITest → D01~D12 준수표와 함께 완료 기록.

### [AID-20261103-WEB-013] 웹 대개편(Terra 3D·Lucide·hover 문구) 읽기 전용 검토
- 날짜·시각·시간대: 2026-11-03 02:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 범위: 사용자 지시 "수정 중이니 코드는 건들지 말고 확인" → web/ 소스·테스트·dist 수정 없음. 빌드·캡처·점검 결과는 저장소 밖 임시 폴더에만 저장.
- 통과: tsc, vitest 39, 임시 폴더 빌드, 헤더 e2e 1건(chrome). Chrome·WebKit 콘솔/페이지 오류 0. 겹침 점검(소개+체험 4단계·3D 캔버스 포함, 390/768/1100/1280) 1건 외 0. hover 문구(Let’s Go!/가시죠!) 반쪽 글자·폭 변화 없음, aria-label 원래 문구 유지. 공개 기본 주소가 최신 계열 번들(index-CPpIfM0E) 제공 확인(TERRA-PUBLIC-CORRECTION-005의 구버전 문제는 현재 재현 안 됨). 로컬은 이후 수정분이 있어 공개본과 다름.
- 발견: ① 3D 모델 23,074,808B 무압축 제공(+three 743KB) — 모바일 첫 로드 부담. ② 3D 렌더 pixelRatio 상한 1.5 → 2·3배 화면에서 휴대폰 화면 글자 흐림·외곽 계단. ③ 글자 크기 단계가 다시 15~17종(12.8/17.6/19.2/21.3/23.4/25.6/42.24 등 소수 크기 포함). ④ 모션 축소 시 보이는 CSS 대체 휴대폰의 상태바·태그 10px. ⑤ 1280px에서 좌측 섹션 표시가 '3D model' 출처 문구와 겹침(y≈3960). ⑥ 휴대폰 장면에 section id가 없어 헤더 메뉴·좌측 표시가 모름(장면 끝에서 '문제'가 먼저 활성). ⑦ 휴대폰 장면 종료 후 다음 구간 전 약 220px 빈 공간(1280). ⑧ 하단 CTA hover 시 '가시죠!'가 긴 문구 폭 중앙에 있어 화살표와 간격 큼. ⑨ index.css에 이전 글자 굴림(.roll-char) 규칙 잔존. ⑩ 휴대폰 장면과 이후 구간이 같은 예시(230,000원·+76,000원)를 반복.
- 미수행: 전체 e2e(스크린샷을 web/evidence에 쓰므로 생략), 실제 Safari 앱·실기기.

### [AID-20261103-APP-013] 앱 UI/UX 대개편·필기체 로고 Splash 완료 보고 (D2 Release 설치·실제 탭 흐름 통과)
- 날짜·시각·시간대: 2026-11-03 08:17 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 (개발 에이전트 모델. 제품 AI 아님)
- 수신 대상: Astra (Terra·웹 참조). 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-002 / APP-012(착수), 사용자 지시("웹 버전 참고 대대적 개편, 전환·텍스트 출현 효과, 고급지게, 필기체 로고 Splash", "계속 진행해봐 전부다"), DESIGN_SPEC D01~D12·S00~S07, FRIEND_MOCK·TOSS_DESIGN_RULES, ASTRA-021~029, AGENTS '사용자 릴리즈 지시'
- 유형: 완료·검증·미해결 보고
- 담당 파일·수정 범위: `mobile/`만. `shared/`·`server/`·`web/`·루트 문서 수정 없음(본 기록 제외).
  - 신규: `src/brand/{BrandSplash,BrandMark,SplashGate}.tsx`, `src/brand/scriptPaths.ts`(필기 중심선·길이), `src/components/motion.tsx`, `assets/brand/ticket-script.png`(사용자 로고 배경 제거본을 글자 영역 1460×500으로 자른 사본), `assets/brand/splash-blank.png`(투명 8px), `jest/reanimated-{impl,main,mock-entry}.js`.
  - 수정: `src/app/_layout.tsx`(Splash 오버레이·네이티브 시작 화면 유지/숨김·헤더 스타일·전환), `src/app/index.tsx`(새 로고·단어 등장 제목·단계 타임라인·떠 있는 카드·Splash 이후 등장), `src/components/common.tsx`(Screen 순차 등장·hold, Button 눌림 축소/진동/빛줄기·그림자, Title 단어 등장, 글자 토큰), `ResultView.tsx`(금액 강조·떠 있는 카드·확인 항목 순차 등장·보류 카드 좌측 선), `EventList.tsx`(행 순차 등장·떠 있는 목록), `ListingForm.tsx`(포커스 링), `src/ui/theme.ts`(type·shadow·brand·enter 토큰 추가, 기존 키 유지), `app.json`(expo-splash-screen 플러그인), `package.json`·lock(의존성·Jest 설정), `__tests__/flow.test.tsx` 1줄(홈 제목을 텍스트 대신 header 역할·이름으로 확인 — 제목이 단어별로 나뉘어 렌더되기 때문, 검증 의미 동일), `README.md`.
  - 의존성(npx expo install): react-native-svg 15.16.0, react-native-reanimated 4.7.1, react-native-worklets 0.13.0, expo-splash-screen ~58.0.12, expo-haptics ~58.0.7. Expo SDK58 공식 문서(splash-screen·svg·reanimated·haptics v58.0.0 페이지)를 확인한 뒤 적용.
  - **정정/주의**: `npx expo prebuild --platform ios --no-install`을 `--clean` 없이 실행했는데 Expo가 `ios/`를 비우고 다시 생성했다(2회). 실행 전 `ios/` 백업과 비교해 차이는 자동 생성 ID·pbxproj 참조·SplashScreen.storyboard(이번 설정)뿐이며 수기 수정 손실은 없음을 확인. DESIGN_SPEC D12 '기존 native 폴더 직접 재생성 금지'와 다르게 CNG 재생성이 일어났으므로 기록한다. 이후 `pod install`.
- 구현 내용:
  1. **필기체 로고 Splash**: 사용자 로고를 쓰는 순서대로 따라가는 중심선 3개(본획 t→i→c→k→e→t 5,439px, 왼쪽·오른쪽 t 가로획)를 직접 작성하고 로고 위에 겹쳐 렌더링(qlmanage)해 덮임을 확인. 선을 굵게 그려 나가는 SVG 마스크로 로고를 드러낸 뒤 완성 로고를 겹쳐 미세한 틈을 메움 → 빨간 밑줄(번짐·칼날·흰 심선·펜 끝 불꽃) → 조준 표시 잠금(원 그리기·십자선·점·퍼지는 링·가벼운 진동) → '티켓레이더'와 한 줄 소개 → 로고 먼저 위로 빠지고 흰 배경이 뒤이어 걷힘. 약 3.0초, 탭하면 즉시 건너뜀. Reduce Motion·조회 실패면 정적 로고 0.7초. 종료는 타이머(애니메이션 콜백 비의존). 첫 화면과 공연 조회는 오버레이 아래에서 이미 실행되고 등장 효과만 Splash 후 시작.
  2. **전체 모션**: 모든 화면 블록 순차 등장(최대 8단계·8px), 제목 단어별 등장, 결과 금액 강조(값 그대로, 카운트업 없음), 확인 항목·공연 행 순차 등장, 버튼 눌림 축소·탄성 복귀·주요 버튼 선택 진동·처음 1회 빛줄기, 입력 포커스 링, 헤더 그림자 제거·iOS 기본 밀어내기 전환. 모두 ReduceMotion.System.
  3. **브랜드 반영**: 홈 상단 임시 레이더 심벌 → 사용자 로고(필기체+밑줄+조준) + '티켓레이더'. RadarBrand 컴포넌트·테스트는 보존(다른 곳에서 미사용).
- 검증(구분):
  - 타입 검사 exit 0, lint 0 오류(최종 release:d2 사전 게이트 포함), **Jest 9 suites / 76 tests 통과**(기존 수 유지).
  - **D2 Release(iPhone 18 Pro, 90702C37…, iOS 27.0 시뮬레이터)**: `npm run release:d2` 3회(08:01, 08:07, 08:14) 모두 build/install/launch passed. 최종 `mobile/evidence/releases/20261103-081452/`(release.json·home.png, latest-release.json 갱신). 내장 번들·fixture-demo.
  - **Splash 시각 확인**: 08:07 빌드의 시작 녹화 `evidence/releases/20261103-080739/launch.mp4`(최종 빌드와 Splash 코드 동일, 최종 빌드는 결과 금액 글자 크기만 변경)를 초당 6장으로 뽑아 직접 확인 — 필기 진행·가로획·밑줄·조준 잠금·문구·퇴장·홈 순차 등장. 첫 빌드에서 발견한 조준 빛 조기 노출·퇴장 겹침·홈 등장 효과 소실은 수정 후 재확인.
  - **실제 탭(XCUITest)**: 최종 빌드에서 `testDemoReleaseFlowD2`(홈→공연→예시 입력→추출 확인→조건 3개→대조) **통과 21.1초**, 5화면 캡처 `evidence/releases/20261103-081452/ui/`를 직접 열어 확인(결과 '+76,000원 (+49.35%)' 한 줄). 08:07 빌드에서도 같은 테스트 통과(21.5초).
  - 실기기·Android: 미검증. 배포·제출: 하지 않음. 실제 AI: 해당 없음(시연 모드).
- **미해결**: 네이티브 시작 단계가 시뮬레이터에서 검게 보인다(D2 iOS27 약 1.5초, 비교용 iOS26.5 약 0.25초 후 회색 페이드). 빌드에 흰 SplashScreenBackground·스토리보드·투명 이미지가 들어 있음을 확인했고(이미지 없이 설정하면 플러그인이 배경색을 넣지 않는 것을 코드로 확인해 투명 이미지 추가), 앱 재설치·스냅샷 캐시 없음도 확인. ASTRA-023/STATUS의 기존 '검정→회색' 관찰과 동일 현상. 원인 미확정, 실기기 확인 필요.
- D01~D12 준수표:
  | 항목 | 판정 | 근거 |
  |---|---|---|
  | D01 토큰 | 통과(확장) | theme.ts에 type·shadow·enter·brand 추가, 기존 키 유지. 화면별 임의 색 없음 |
  | D02 색 의미 | 조건부 | UI 상태색 유지. 로고 빨강은 Splash·브랜드에만(사용자 로고 고유색), 상태색으로 미사용 |
  | D03 CTA 1개·48 | 통과 | 화면당 채움 CTA 1개, 버튼 높이 54·칩 48 유지 |
  | D04 핵심 먼저·모드 표시 | 통과 | 모드 배지·배너 유지, 해시 등은 출처 정보 안 |
  | D05 실제/시연/수동/AI 표시 | 통과 | 표시 로직 무변경, 결과 '시연 fixture 조회 · AI 호출 없음' 캡처 확인 |
  | D06 원문·수정·공식 구분 | 통과 | 값·URL·verifiedAt 뷰에서 미생성 |
  | D07 보류 표현 | 통과 | 보류 카드 유지(좌측 선만 추가), 숫자·체크 없음 |
  | D08 확인 사항 펼침 | 통과 | 기본 펼침 유지 |
  | D09 접근성 | 부분 | 장식 숨김·제목 header 이름 유지·ReduceMotion.System. 큰 글자·VoiceOver·실제 동작 줄이기 설정 조작은 미검증 |
  | D10 폼·API 흐름 | 통과 | 상태·요청·검증 코드 무변경, 76 tests |
  | D11 모션은 장식 | 통과(차이 기록) | 진입·요청이 애니메이션에 비의존, 카운트업 없음. 단 Splash 길이(약 3초)는 S01 ≤700ms와 다름 — 사용자 지시, 탭 건너뛰기·정적 대체 |
  | D12 새 라이브러리 금지 | 사용자 지시로 예외 | svg·reanimated·worklets·splash-screen·haptics 설치, prebuild 재생성 발생(위 정정) |
- 남은 일·제안: 네이티브 시작 단계 검은 화면 원인(실기기 확인), 큰 글자·VoiceOver·동작 줄이기 설정 실제 확인, 결과 화면 '사용자가 수정한 값으로…' 문구가 조건 칩 선택만으로도 표시되는 기존 규칙 재검토(이번 범위 밖), 웹과 로고·모션 통일(웹 담당과 조율).


### [AID-20261103-TERRA-WEB-AUDIT-010] 웹 10항목 개선
- 시각: 2026-11-03T08:25:28.428700+09:00
- 작성: Terra / gpt-6.1-terra. 협업 scene_boundary(모델)·price_overlap(UI) 구현. mobile 담당 독립 작업 보존.
- GLB 23074808→10008532 bytes, 2K PNG 텍스처 3개 1K 변환, 원본 Downloads·web/reference 보존. CanvasTexture 512×1104→1024×2208, DPR 상한1.5→2, 제작자/CC BY/화면 및 텍스처 변경 footer. 실제 기기 배터리/속도 미검증.
- phone-scene 내비게이션, 헤더 살펴보기, fallback 12px, CTA hover 간격10px, 220px 공백 약118px, roll-char 제거, 소개 문구 중복 완화. CSS font-size 97개 의미 토큰 매핑, 기존 크기는 유지하므로 수치 12단계 강제 아님.
- 검증: 각 에이전트 서버 없는 Chrome/WebKit 스크롤·WebGL/Fallback·기기별 확대, 소프트웨어 렌더, 39단위·타입·빌드 통과; Terra 3D/대체 화면 스크린샷 확인 및 최종 39단위·build 독립 실행. CSS zoom 200% 640/800 기준 넘침0, 실제 브라우저 확대·실기기 미검증.
- 배포: Cloudflare 4264abb4-e3ad-4070-a377-bc58df549e6e, version URL WebKit 360/390/768/1280/1440 fixture flow 통과, GLB 응답 model/gltf-binary 확인, 기본 주소 새 해시 Cy1nDrTU 확인. 검증 스크립트 Chrome 미설치 실패 후 설치된 WebKit 사용으로 변경. fixture, 실제 AI 미연결.

### [AID-20261103-APP-014] Splash 정지 1초 연장·앱 아이콘을 사용자 로고로 교체 (사용자 지시)
- 날짜·시각·시간대: 2026-11-03 08:42 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-002 / APP-013, 사용자 지시("Splash 효과가 다 발현되고 너무 빨리 사라진다, 1초 더", "앱 아이콘도 우리 로고로")
- 유형: 완료(소규모 변경)·검증
- 담당 파일·수정 범위: `mobile/src/brand/BrandSplash.tsx`(퇴장 시작 2650→3650ms, 전체 약 4.0초, 탭 건너뛰기 유지), `mobile/assets/icon.png`(1024×1024 불투명 새 아이콘: 흰 바탕 + 필기체 ticket + 빨간 밑줄 + 조준 표시, 원본 사본 `assets/brand/app-icon-1024.png`), CNG prebuild로 `ios/`의 AppIcon 갱신. Android 적응형 아이콘 자산은 바꾸지 않음(Android 미빌드).
- 검증: 두 차례 `npm run release:d2`(08:33, 08:35) build/install/launch passed, 사전 게이트(tsc·lint·Jest 76) 통과. 08:33 시작 녹화 장면 시트 `mobile/evidence/releases/20261103-083320/launch-contact.png`에서 완성 후 약 1.7초 정지 확인. 08:35 빌드 후 D2 홈 화면 캡처 `…/20261103-083531/homescreen-icon.png`에서 새 아이콘 확인. prebuild 전 `ios/` 백업 비교: 아이콘 파일·pbxproj 자동 ID 외 차이 없음.
- 미확인: 실기기·Android 아이콘, 아이콘 작은 크기(설정·알림)의 가독성 별도 확인 안 함.

### [AID-20261103-APP-015] 앱 화면 로직 재구현 착수: 조원 목업 구조 + 웹 테마, OCR·제보 PDF·관리자 포함 (사용자 결정)
- 날짜·시각·시간대: 2026-11-03 08:45 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra·Terra(관리자 API 요청 포함)·웹 참조. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-003 / 사용자 결정(2026-11-03 08:36: "목업 구조 + 웹 테마", "모든 기능 구현, 캡처 업로드 OCR까지 전부"), 원본 `~/Downloads/ticket_rader_mock.pen`(Pen MCP로 읽기만 함: ⓪홈 ZW6mD, ①입력 rnRtr, ②읽은 값 V6oTb, ③결과 b3zFf9, 부속 OTzkR, 관리자 yBOug — 라이트 모드 PNG로 내보내 확인, 원본 수정 없음)
- 유형: 착수·요청
- 담당 파일·수정 범위: `mobile/`만. 예정: `src/app/*`(흐름 재구성: 홈 → 판매글 입력(공연 선택 시트) → 읽은 값 확인 → 확인사항 결과 → 제보 근거 정리, +not-found/관리자), `src/components/*`, `modules/text-recognizer/`(신규 로컬 Expo 모듈, Apple Vision 한국어 OCR — 기기 안에서 처리, 서버 전송·저장 없음), 의존성 expo-image-picker·expo-print·expo-sharing(npx expo install), `app.json`(사진 접근 문구), 테스트·XCUITest·README·evidence.
- 원칙 유지: 공통 계약·API 요청/검증·12개 조건·previousCheckId·manual·409·늦은 응답 무효화·실제/시연/수동/AI 표시. OCR은 판매글 텍스트를 만드는 입력 수단이며 결과는 사용자가 확인·수정한 뒤 기존 추출/직접 입력 흐름을 탄다(OCR 결과를 AI 추출로 표시하지 않음). 제보 PDF는 대조 결과 응답의 값만 쓰며 앱이 새 판정을 만들지 않는다.
- **Terra 요청(관리자 규정 재확인 API, 계약 변경 필요)**: 목업 ⑤는 관리자 비밀번호 로그인(401) → 공연별 공식 가격·규정 행 조회·편집·삭제·저장이다. 앱/웹이 쓸 서버 API가 없다. 제안: `POST /admin/session {password}`→토큰(만료), `GET /admin/events/:id/official-data`, `PUT /admin/events/:id/price-tiers`·`/policies`(전체 교체, 출처 URL·확인일 필수), 오류 401/403. 키·비밀번호는 서버 환경에만. 확정 전까지 앱은 관리자 화면을 '서버 관리자 API 준비 전'으로 정직하게 표시하고 저장 동작을 흉내 내지 않는다.


### [AID-20261103-TERRA-WEB-FLOW-011] 스크롤 연속성·브랜드 팔레트
- 시각: 2026-11-03T08:46:22.768833+09:00
- 작성 Terra / gpt-6.1-terra; 협업 story_flow_qa(스크롤·CSS), cta_center(CTA·3D/티켓 팔레트) 구현. mobile 별도 작업 보존.
- 판매글·대조·사용 방법 헤더 아래 중앙, 종료 후 22% 여운, 판매글 속 단서 scroll 연동 등장/역방향, 짧은 화면 자연스크롤. CTA 두 문구+화살표 각각 정중앙. 잉크 #13233A, 보조 #526173, 강조 #404890, 기존 주의·오류 의미 보존.
- 검증: 에이전트 서버 없는 WebKit 1280/390 및 짧은 화면 위치, 모바일/역방향/reduced motion·CTA 포커스·3D 3단계 확인, 39단위/build. Terra 캡처 /private/tmp/story-1280-900-story-listing.png·story-390-844-story-compare.png·aid-palette-hero-1280.png·aid-palette-stage-webkit-390-1.png 확인, 독립 Vitest 39/build. 대비값 계산(포인트/흰색 8.24, 보조/흰색 6.33; 렌더 픽셀 전수검사 아님). 새 e2e/story-continuity.spec.ts 자체는 로컬서버 금지로 실행 안 함, 동등 동작 별도 offline 검증.
- 배포 Cloudflare 버전 a9617b09-4d94-4931-aaac-cfe08b8e07dc. 버전 URL WebKit 360/390/768/1280/1440 fixture 흐름 통과; 기본 URL이 같은 BrME-Vwx/B_d9tftO 자산 제공 확인(시점 한정). 실제 iPhone/Safari·전체 접근성 미검증.

### [AID-20261103-WEB-014] TERRA-WEB-AUDIT-010 반영분 재검증(읽기 전용)
- 날짜·시각·시간대: 2026-11-03 08:49 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 범위: 사용자 지시("아직 수정 중, 재검증") → web/ 소스·테스트·dist 수정 없음. 결과는 저장소 밖 임시 폴더. 환경: 이 Mac에 Google Chrome이 없어지고 Playwright가 새 Chromium(1248)을 요구해, 브라우저 측정은 설치된 WebKit으로 수행(Chromium 계열 실측 없음).
- 통과: tsc, vitest 39, 임시 빌드. WEB-013 항목 대조 — ② 캔버스 2.0배(2×·3× 화면) 확인, 3× 캡처 선명 ✅ ⑤ #phone-scene·헤더/좌측 '살펴보기' 추가, 장면 중 활성 정확 ✅ ⑦ 모션 축소 대체 휴대폰 최소 12px ✅ ⑧ CTA hover '가시죠!→' 묶음 중앙(오프셋 0, 간격 9px) ✅ ⑨ .roll-char 규칙 0 ✅ ⑩ +76,000원 1회·230,000원 2회로 완화 ✅. 12px 미만·넘침 0(WebKit 360~1440). 1280 섹션 표시×출처 문구 겹침 해소.
- 부분/미해결: ① GLB 23.1→10.0MB(텍스처 1K), 메시 압축(Draco/Meshopt) 미적용으로 여전히 큼 ③ 글자 크기 15~17종(소수 크기 포함) — Terra 기록상 의도적 유지 ⑥ 휴대폰 장면 종료 시 1280 화면 하단 약 절반이 빈 상태로 보임(다음 구간의 sticky 내용이 구간 높이 중앙에 있어 생기는 구조적 공백) + 그 순간 헤더가 '문제'로 먼저 전환.
- 신규: 390px 공식 대조 구간에서 '공식 안내와 다른 설명' 칩이 공식 안내 카드 하단 테두리와 겹침(audit-motion 30프레임 지속, 캡처 확인). 768/1100/1280은 겹침 0.
- 공개본: 기본 주소 index-Cy1nDrTU(Terra 4264abb4), GLB 10,008,532B. 로컬은 이후 수정분 있음(정상, 수정 중).
- 미수행: 전체 e2e(web/evidence 기록 방지), Chromium·실제 Safari 앱·실기기.


### [AID-20261103-TERRA-HOLD-012] 휴대폰 마지막 유지·대조 겹침
- 시각: 2026-11-03T09:05:07.837043+09:00
- 담당: Terra / gpt-6.1-terra; 협업 story_flow_qa·cta_center 수정, scene_boundary read-only 분석.
- 3D 마지막 단계가 완전히 나온 후 80vh 추가 보류, 접근/전환 거리 유지. 이후 판매글 단계는 폰 퇴장 마지막 22vh부터 천천히 진입하며 메뉴가 보이는 시점에 전환. 짧은 높이 자연 스크롤 우선순위 수정.
- 390 공식 카드의 translate 시 칩 겹침 확인(최악 -4.92px)→간격 +17.08px, 320/360/390 WebKit·모션 축소/768/1280 확인, 캡처 /private/tmp/aid-compare-before-390-normal.png·after. 스크롤 단계 1280/390/500 역행·축소 WebKit offline 검사. 실제 기기 미검증.
- 메시 buffer 2312116→1386933 bytes in-memory Meshopt 왕복 정확; 총 약925183 bytes 절감 추정, decoder/실기기 비용 미검증으로 파일 변환은 하지 않음. 현재 이미지 76.7%, geometry 23.1%. 폰트 토큰 13단계, review CSS 15/19px 예외, SVG 스케일 소수 별개.
- 독립 npm test 39·build 통과. Cloudflare 버전 11de29e0-b37b-46a0-b22e-dadaa6c4474a, version URL WebKit 5폭 fixture flow 통과, 기본 주소 index-C0INyRe8/CJwbVTJO 최신 제공 확인. 신규 e2e spec 자체는 로컬서버 금지로 미실행; 동등 offline QA.

### [AID-20261103-APP-016] 앱 화면 로직 재구현 완료: 목업 구조 + 웹 테마, 기기 안 OCR·제보 PDF·상태 화면 (관리자 API는 Terra 대기)
- 날짜·시각·시간대: 2026-11-03 09:24 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra·Terra(관리자 API 요청 재확인)·웹 참조. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-003 / APP-015(착수), 사용자 결정(목업 구조 + 웹 테마, 캡처 OCR 포함 전부)
- 유형: 완료·검증·정정
- 담당 파일·수정 범위: `mobile/`만. 신규 `src/components/{ui,StatusScreen}.tsx`, `src/app/{report,admin,+not-found}.tsx`, `src/ocr/readCapture.ts`, `src/report/reportDoc.ts`, `modules/text-recognizer/`(로컬 Expo 모듈: podspec·Swift·index.ts), `__tests__/reportOcr.test.ts`. 수정 `src/app/{index,listing,review,result,_layout}.tsx`, `src/components/{ReviewForm,ResultView,common,motion}.tsx`, `app.json`(expo-image-picker 사진 접근 문구, 카메라·마이크 권한 없음), `package.json`·lock(expo-image-picker·expo-print·expo-sharing 추가, `npx expo install --fix`로 expo 58.0.22 등 SDK 패치 정렬), 테스트(flow·httpFlow 문구/조작 갱신), `e2e-ios`(문구 갱신·`testCaptureOcrD2` 추가), README. `ios/`는 CNG prebuild로 재생성(매번 백업 비교: Info.plist 사진 문구·pbxproj 자동 ID 외 차이 없음).
- 구현: ⓪홈(가운데 제목·단계·공연 카드·로딩 스켈레톤/오류 재시도/빈 상태·'판매글 확인하기'·관리자 링크) → ①입력(상단 공연 ▾ 시트, 공연 1개면 자동 선택, 캡처 첨부→**Apple Vision 기기 안 OCR**→입력칸 채움, PNG/JPG 5MB 검사·읽는 중·오류·다른 이미지·크게 보기/삭제 시트·도움말 시트, 휴지통·'이 판매글 확인하기'·'AI 없이 직접 입력') → ②읽은 값(항목 카드 접기·되돌리기·편집, 큰 값, 근거 칩, 추가 항목 접기, 조건 6개 상시, 상단 '판매글 ▾' 원문·근거 시트, '공식 안내와 비교하기') → ③결과('확인이 필요한 부분 N가지' = matched 제외 서버 항목, 기준 문구 표시, 항목 카드 재디자인, 제보 근거 정리 버튼) → ④제보 근거 정리(응답 값만, 연락처 가림, expo-print PDF→공유, 정리 중·실패 상태) / 404 / 앱 오류 경계 / ⑤관리자('준비 전' 표시, 로그인·저장 흉내 없음, 비밀번호 비저장). API·계약·검증·12개 조건·previousCheckId·manual·409 로직 무변경.
- 검증(구분): tsc 0, lint 0, **Jest 10 suites / 82 tests 통과**(+6: 연락처 가림·확인 항목 집계·PDF HTML 이스케이프/시연 표시·캡처 검사·OCR 모듈 없음·제보 화면·관리자 정직 표시), **expo-doctor 20/20**. D2 Release `npm run release:d2` 최종 `mobile/evidence/releases/20261103-091925/` build/install/launch passed. **실제 탭(XCUITest)**: `testDemoReleaseFlowD2` 통과 22.5초(홈→공연 시트→예시→읽은 값→조건→결과), `testCaptureOcrD2` 통과 12.5초 — `simctl addmedia`로 넣은 합성 판매글 캡처를 시스템 사진 선택기에서 골라 **Vision이 6줄(한글·숫자·기호)을 정확히 읽어 입력칸에 채움**(캡처 `…/20261103-091258/ui/ios-ui-02-ocr-filled.png` 직접 확인). 5화면 캡처 직접 확인(목업 구조 일치, 시트 닫기 버튼 위치 1건 발견→수정→재확인). 실기기·Android·PDF 공유 시트 실제 저장 동작은 미검증(PDF 생성 경로는 단위 테스트 HTML까지).
- **정정·사고 보고**: 09:02~09:10 D2에서 앱이 실행 직후 종료되는 충돌 반복(사용자 화면에 macOS 충돌 보고 창 표시). 원인 ① expo-print 58.0.8 프레임워크가 앱의 expo 58.0.20 코어에 없는 `ExpoModulesJSI` 심볼을 참조(dyld Symbol missing) → `npx expo install --fix`로 SDK 패치 정렬. ② 정렬 후 재빌드가 오래된 DerivedData 사전 컴파일 모듈 때문에 실패(xcodebuild 65)했는데, 제 실행 스크립트가 빌드 실패를 확인하지 않고 XCUITest를 이어 돌려 손상된 이전 설치본이 재실행됨 → 앱 제거로 충돌 반복 중단, DerivedData 삭제 후 재빌드 성공, 이후 명령은 빌드 성공 시에만 실행하도록 `&&` 연결. 09:10 이후 앱 충돌 보고 없음 확인. APP-013에 적었던 expo-doctor 패치 차이(미변경)는 이번에 해소.
- 미해결·요청: ⑤관리자 서버 API(Terra, APP-015 계약안) — 연결 시 앱 화면 연동. 시작 단계 검은 화면(시뮬레이터) 유지. 결과 '사용자가 수정한 값…' 문구 규칙(조건 칩 선택도 수정으로 셈) 재검토. XCUITest 2개를 한 번에 돌리면 순서 의존(OCR 후 시연 테스트가 홈이 아님) — 각 테스트 전 앱 재실행 필요.


### [AID-20261103-TERRA-LISTING-013] 판매글 진입 가독성
- 시각: 2026-11-03T09:23:05.184140+09:00
- 담당: Terra / gpt-6.1-terra 통합, story_flow_qa 협업 구현.
- 스크롤 비례 중간 opacity를 임계 지점 진입 시 380ms 자연 전환으로 변경, 멈춰도 선명해지며 역스크롤 시 숨김. 질문 문구 blur 제거, 80vh 휴대폰 보류·짧은 화면·모션 축소 유지.
- 검증: WebKit offline 1280×900·390×844 중간 정지/빠른 이동/역행, 390×500 및 reduced 즉시표시. 3D는 대체 화면, 실제 기기 미검증. 캡처 /private/tmp/aid-listing-readable-1280-900.png 리더 확인. 독립 npm test 39·build 통과.
- 배포 cc8cf0a2-989a-44a6-aedd-a155edc52942; WebKit 버전 URL 5폭 fixture flow 통과, 기본 URL 최신 index-C6wN9VMa/CSS-QyGVp7ug 제공 확인(시점 한정).

### [AID-20261103-WEB-015] 웹 전체 재검증(읽기 전용) — 3D 티켓 인트로 포함
- 날짜·시각·시간대: 2026-11-03 10:43 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 범위: 사용자 지시("사이트 내용 다시 검증") → web/ 소스·테스트·dist 수정 없음. 임시 빌드·측정은 저장소 밖($CLAUDE_JOB_DIR/tmp/review3). 브라우저는 WebKit만(Chrome 미설치, Chromium 1248 미설치).
- 통과: tsc 0, vitest 39/39, oxlint 경고 3(기존), 임시 빌드 성공. 공개 기본 주소 = 로컬 빌드 같은 해시(index-KzdeCbs1.js / index-g2rplAzk.css), ticket-intro.glb model/gltf-binary 200.
- UI(WebKit 360/390/768/1280/1440, 소개→공연→판매글→확인→결과 fixture 전체 흐름): 12px 미만 0, 넘침 0, 전 단계 정상 도달. 겹침(audit-motion 390/768/1100/1280): 0건 — WEB-014의 390 칩×공식 카드 겹침 해소 확인.
- 내용: 가격 산식 230,000−154,000=+76,000 일치, 11/21 토요일 일치, 카운트업은 19,770원·미리보기 +76,000원(장식 예시)에만 사용, 실제 대조 결과엔 없음. 진위·입장·위법 비판단 문구, 시연·가상 표시, 3D 모델 2종 CC BY 출처 표기 있음. 실제 AI 연결 표시 없음.
- 3D 티켓 인트로(신규, Terra 작업으로 보임): 로딩 약 0.65~0.8초, 휠 약 850px로 열림, Esc·건너뛰기 탭 닫힘, 모션 축소 시 표시 안 함 ✅.
- 확인 필요:
  ① 인트로가 매 방문·새로고침마다 다시 나오고 앱 단계(공연·결과 화면) 새로고침에도 덮음 — 세션 1회 표시 검토.
  ② 인트로 진행 중(중간) '건너뛰기' 버튼이 헤더 '바로 체험하기' 버튼 위에 겹치고, 하단 안내 문구가 소개 화면 위에 남음(1280 캡처).
  ③ 티켓 텍스처 문구 'Copyright © 2026 / Daelim.Univ CS Engineering · 월32 / All rights reserved.' — CC BY 모델 변형물에 'All rights reserved'는 라이선스 표기와 어긋나 보임, 표기 검토 권장.
  ④ 휴대폰 장면 종료 직후 1280 화면 빈 구간: 헤더 조기 전환은 해소(살펴보기 유지)됐으나, 판매글 등장 직전 약 300px 스크롤 동안 빈 영역 440→740px(화면 거의 전체), 휴대폰 하단이 반투명 헤더 뒤로 비침.
  ⑤ 헤더 메뉴(문제·대조 방식·결과 예시·원칙)와 좌측 점 이름(판매글·공식 대조·결과 미리보기·판단하지 않는 것)이 서로 달라 일관성 낮음(경미).
  ⑥ GLB 총 약 13.9MB(휴대폰 10.0MB + 티켓 3.9MB), three.js 742KB — 첫 방문 모바일 데이터 부담.
- 미수행: 인트로 키보드 Tab 이동(WebKit 헤드리스에서 Tab이 버튼으로 이동 안 해 판정 불가), 전체 e2e(web/evidence 기록 방지), Chromium·실제 Safari·실기기.


### [AID-20261103-ASTRA-INTRO-ARRIVAL] 티켓 진입 모션 및 새 계정 배포
- 시각: 2026-11-03T11:00:17+09:00
- 작성: Astra / 실제 모델 GPT-6 (Codex); 수신: 사용자·웹 담당; 작업: 사용자 요청 티켓 진입 및 배포.
- 범위: web/src/components/TicketIntro.tsx; 로딩 완료 후 약 1초 크기·위치·각도 진입, 스크롤·드래그 시 즉시 종료. 모션 축소 기존 경로 유지.
- 검증: 직전 npm test 39/39, Vite 빌드 통과; 배포 WebKit 1280에서 로딩 직후·1.3초 후 캡처 및 스크롤 종료 확인. 실기기·모든 브라우저 미검증.
- 배포: month32 프로필을 web 디렉터리에 바인딩, 계정 확인 후 ticketradar.month32.workers.dev에 버전 dbae9957-3ee4-4708-83ee-0e401266d910 배포, 공개 HTML 일치 확인. 이전 계정 배포와 별개.

### [AID-20261103-APP-017] 사용자 결정 전달(AI 제공자=클라우드 AI) · 앱 다듬기 착수
- 날짜·시각·시간대: 2026-11-03 09:33 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Terra(AI 제공자 결정)·Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-004 / 사용자 응답(2026-11-03 09:31: 다음 우선순위 "앱 기능·디자인 더 다듬기", AI 제공자 "클라우드 AI (Claude 등)")
- 유형: 사용자 결정 전달·착수
- 내용: ① **AI 제공자 사용자 결정 = 클라우드 AI(Claude 등)**. 서버 ExtractionProvider 구현·모델 선택·API 키(서버 환경에만, 기록·코드·클라이언트 금지)·비용 확인은 Terra 담당. 앱은 `extraction.method=model`·`provider`·`model`·`actualModelCall`·`reused`를 이미 표시하므로 계약 변경 없이 연결 가능. 연결 후 앱 쪽 실서버 왕복(test:live)·화면 검증을 다시 한다. ② 앱 다듬기 범위(`mobile/`만): 결과·확인 화면의 '사용자 수정' 판정 규칙(빈 조건 채움과 읽은 값 수정 구분), 숫자 키패드 '완료' 버튼, 선택 칩 촉각 반응, 큰 글자(accessibility XXXL)·동작 줄이기 시뮬레이터 실제 확인 및 깨짐 수정. API·계약·검증 로직 변경 없음.
- 다음 행동: 구현 → Jest/tsc/lint → D2 Release → 큰 글자·동작 줄이기 캡처 확인 → 완료 기록.

### [AID-20261103-APP-018] 앱 전면 디자인 개편 착수: 웹 최신 디자인과 동일하게 (사용자 결정)
- 날짜·시각·시간대: 2026-11-03 11:20 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra·웹 참조. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-005 / 사용자 응답(2026-11-03: "전면 디자인부터 싹 다 갈아엎어야", 방향 "웹 최신 디자인과 똑같이", 불만 "흔한 앱처럼 보임·글자/카드 과다·흐름 어색·연출 약함"), 웹 기준 `ticketradar.month32.workers.dev`(ASTRA-INTRO-ARRIVAL)·`web/src/index.css` 토큰·`Landing.tsx` 문구(읽기만), APP-016(목업 구조). APP-017 다듬기는 이번 개편에 흡수.
- 유형: 착수(이전 결정 대체)
- 담당 파일·수정 범위: `mobile/`만(`web/` 읽기만, 배포 사이트는 WebKit으로 열어 화면만 캡처). 예정: `src/ui/theme.ts`(웹 토큰: primary #404890 등), 홈을 웹 소개 이야기 화면(스크롤 연출)으로, 서비스 화면 1~4 단계 탭·웹식 행 폼·결과 카드, 기존 OCR·제보 PDF·상태·관리자 유지, 테스트·XCUITest·README·evidence.
- 원칙 유지: API·계약·검증·12개 조건·previousCheckId·manual·409, 실제/시연/수동/AI 표시, 웹 예시의 가상 표시(임곡대동제 등 '가상'). 웹 3D 모델(GLB)은 앱에 복사하지 않고 네이티브 도형·애니메이션으로 같은 구성을 재현(새 3D 의존성·모델 라이선스 확대 없음).

### [AID-20261103-APP-018-DONE] 앱 전면 디자인 개편 완료(웹 최신 디자인 기준)
- 날짜·시각·시간대: 2026-11-03 15:50 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: Astra·웹 참조. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-UX-005 / AID-20261103-APP-018
- 유형: 완료
- 파일·범위: `mobile/` — src/ui/theme.ts(웹 토큰), src/landing/{Landing,scroll}.tsx(웹 Landing과 같은 스크롤 이야기: 티켓·휴대폰 3단계·단서 점등·공식 대조 연결선·세 단계·결과 미리보기·판단하지 않는 것), src/app/index.tsx(고정 헤더 '바로 체험하기'·실제 공연 카드), StepTabs(1~4단계), ReviewForm(웹식 행·선택 시트), ResultView(주황 테두리 카드), 테스트·XCUITest(testLandingScrollD2 신규). 화면 점검 후 휴대폰 3단계 전환에서 앞·뒤 문구가 겹치던 문제 수정(앞 화면이 사라진 뒤 다음 화면 등장).
- 검증(구분): 단위 Jest 10 suites/82 통과, tsc·lint 통과 / 빌드 D2 Release build·install·launch 통과(evidence/releases/20261103-154423/) / 실조작 XCUITest 앱 재실행 방식으로 testLandingScrollD2 37.1s·testDemoReleaseFlowD2 28.9s·testCaptureOcrD2 11.7s 통과 / 화면 캡처 직접 확인(phone-check.png: 겹침 해소). 새 충돌 보고 없음(최신 ips 09:10).
- D01~D12: D01 웹 토큰 사용(사용자 결정 "웹과 똑같이"가 지침 색보다 우선, 근거 APP-018) · D02 확인 필요=주황/앰버, 오류만 붉은색 유지 · D03 화면당 채움 CTA 1개(결과 화면은 '값 수정하고 다시 대조') · D04 모드 표시 상단 유지 · D05 AI 재사용/fixture 표시 유지 · D06 원문 인용·공식 문구 구분 · D07 가격 보류 표시 유지 · D08 결과 핵심 펼침 기본 · D09 동작 줄이기 시 정적(코드), 큰 글자 실측 미수행 · D10 API 흐름·409·manual 유지(Jest) · D11 모션 장식, 진입·네트워크 비종속, 장식 예시 외 카운트업 없음 · D12 새 UI 라이브러리 추가 없음(이번 묶음), ios/ 직접 수정 없음.
- 미확인: 실기기·Android, 큰 글자·동작 줄이기 실제 캡처, 시뮬레이터 시작 단계 검은 화면(기존).
- 다음 행동: APP-019(클라우드 AI 연결) 실키 확인 후 실서버 모드 Release 확인.

### [AID-20261103-APP-019] 사용자 직접 지시: 클라우드 AI(Claude) API 키 연결 — server/ 교차 수정
- 날짜·시각·시간대: 2026-11-03 15:52 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: **Terra(server 소유자, 검토 요청)**·Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: 사용자 지시(2026-11-03 15:4x "추가로 API 키도 연결하자 이제"), APP-017(AI 제공자=클라우드 AI 사용자 결정)
- 유형: 구현(소유 경로 밖, 사용자 지시 우선 — AGENTS.md "사용자 지시가 우선한다")
- 파일·범위: `server/src/extraction.ts`(추가: `extractionSystemPrompt` 공용화 — Ollama 프롬프트 문자열 그대로 이동, `AnthropicProvider`, `providerFromEnv`의 `anthropic` 분기), `server/test/anthropic.test.ts`(신규), `server/.env.example`(주석 예시), `server/README.md`(절 추가), `server/package.json`(`@anthropic-ai/sdk` ^1.4.0 의존성), `mobile/scripts/release_d2.py`(선택 `AID_RELEASE_API`로 실서버 모드 빌드). `shared/`·`web/`·계약 변경 없음.
- 동작: EXTRACTION_PROVIDER=anthropic + ANTHROPIC_API_KEY(서버 .env만) + AI_MODEL(기본 claude-opus-5-5). effort low, SDK 재시도 0(시간 제한은 서비스), fallbacks "default". 응답은 기존 validateGroundedExtraction 통과 필수, 거절·잘림·JSON 아님→AI_INVALID_RESPONSE, 통신 실패→AI_PROVIDER_ERROR. metadata는 method=model·provider=anthropic·actualModelCall=true. 기본값(none)과 Ollama 경로 동작 변화 없음.
- 검증: server 테스트 46/46 통과(신규 4개, 가짜 클라이언트·네트워크 없음), tsc 통과. 가짜 키로 서버 기동 확인만 함. **실제 키 호출·응답 품질·지연·비용 미검증**. 키 값은 이 기록·코드·대화 어디에도 없음.
- 요청(Terra): ① 교차 수정 검토 ② 실제 키 호출 시 AI_TIMEOUT_MS 권장값(30000 제안) 확인 ③ 구조화 출력(output_config.format) 적용 여부 — 이번엔 스키마 호환 미확인이라 JSON 텍스트 파싱+기존 검증으로 처리.
- 다음 행동: 사용자가 server/.env에 키 입력 → 서버 실행 → 실제 /api/check 호출 확인 → `AID_RELEASE_API=http://127.0.0.1:3001 npm run release:d2`로 앱 실서버 모드 확인.

### [AID-20261103-APP-020] 사용자 지시 "우선 gemini 키로": Gemini 추출 제공자 연결·실제 키 호출 확인
- 날짜·시각·시간대: 2026-11-03 16:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: **Terra(server 소유자, 검토 요청)**·Astra. 수신 확인 없음.
- 작업 ID / 참조 기록: APP-019(Claude 제공자) 정정·보완 — 사용자가 준 키가 Anthropic 형식이 아닌 Google 키여서 사용자가 Gemini 사용을 지시.
- 유형: 구현·실제 호출 검증(소유 경로 밖, 사용자 지시 우선)
- 파일·범위: `server/src/extraction.ts`(`GeminiProvider` 추가 — fetch, 새 의존성 없음, `providerFromEnv`에 `gemini` 분기, 기본 모델 gemini-3.1-flash-lite), `server/test/cloud-providers.test.ts`(구 anthropic.test.ts 이름 변경 + Gemini 4개), `server/.env.example`·`server/README.md`, `server/.env`(사용자 제공 키 저장, Git 제외·권한 600 — **키 값은 이 기록·코드에 없음**), `mobile/e2e-ios/.../ManualFlowUITests.swift`(testAiLiveFlowD2 신규).
- 동작: 키는 x-goog-api-key 헤더로만 전송, 응답 본문을 오류에 노출하지 않음. 503/429만 최대 2회 재시도(서비스 시간 제한 안), 그 외 오류 즉시 AI_PROVIDER_ERROR, SAFETY 등 중단·JSON 아님은 AI_INVALID_RESPONSE. 응답은 기존 validateGroundedExtraction 통과 필수.
- 검증: server 테스트 50/50·tsc 통과. **실제 키 호출(합성 판매글 1건, CheckService 경유)**: gemini-3.1-flash-lite 5/5 성공, 1.9~3.9초, 12개 항목 모두 근거 검사 통과 → 기본 모델로 채택. gemini-3.5-flash 수요 과다 503 잦음(재시도 포함 3번 중 2번 실패), gemini-2.5-flash 신규 사용자 제공 중단(404), gemini-flash-latest 503/시간 초과. 1건 기준이며 정확도 측정 아님.
- 미확인: 다양한 판매글 정확도, 비용·쿼터, 실기기. 웹은 같은 서버를 쓰므로 서버 실행 시 자동으로 AI 추출 사용(웹 코드 변경 없음, 웹 화면 미확인).
- 보안: 사용자가 키를 대화창에 붙여넣어 대화 기록에 남음 — 시연 후 재발급 권장(사용자에게 안내).
- 다음 행동: 앱 실서버 모드 D2 Release + testAiLiveFlowD2 결과 추가 기록.

### [AID-20261103-APP-020-R] 앱 실서버(Gemini) Release 실조작 확인 결과
- 날짜·시각·시간대: 2026-11-03 16:10 KST (UTC+09:00) / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra
- 빌드: `AID_RELEASE_API=http://127.0.0.1:3001 npm run release:d2` → build·install·launch 통과(evidence/releases/20261103-160014/, data_mode live-api). 서버는 `server/.env`(gemini, gemini-3.1-flash-lite)로 실행, /health aiConfigured=true.
- 실조작: XCUITest testAiLiveFlowD2 통과(16.7s) — 홈→실서버 공연(AKMU 대구)→판매글 키보드 입력→'이 판매글 확인하기'→화면 표시 "AI 모델 추출 · gemini gemini-3.1-flash-lite · 추출값은 후보입니다"→대조 결과(가격 비교 보류: 수수료·할인 조건 불명확 — 규칙대로), 결과 화면은 "AI 모델 추출 결과 재사용 · 이번 요청에서는 모델 호출 없음"으로 정확히 구분. 캡처 live-contact.png 직접 확인.
- 테스트 보정(앱 코드 변경 없음): 개편 후 화면 제목이 '공연 바꾸기' 버튼이라 키보드 닫기 탭 위치 변경, 입력칸은 윗부분 탭(XCUITest에서 정가운데 탭은 포커스가 안 잡힌 경우 있음 — 실제 손가락 조작 영향은 미확인).
- 미해결(경미): 추출 방식 문구가 "gemini gemini-3.1-flash-lite"처럼 제공자명이 중복 표시됨(앱 display.ts, 다음 묶음에서 수정). 웹 화면의 AI 표시는 미확인.


### [AID-20261103-ASTRA-KOPIS-001] 실제 공연 검색 착수
- 시각: 2026-11-03T19:42:32+09:00
- 작성: Astra / GPT-6 (Codex); 수신: 웹·서버 담당; 유형: 착수 및 작업 배분.
- 사용자 KOPIS 키는 server/.env(권한 600)에만 저장; 실제 KOPIS 공연 중 목록 30건 응답 확인. 검색 어댑터 server/src/kopis.ts, GET /performances 분리·테스트. 목록은 검증된 가격·규정 근거가 아님.
- 협업: 이 세션의 kopis_worker는 web/worker.ts·wrangler.jsonc, kopis_web은 web/src 및 필요 shared 계약 담당. 실제 수신·결과는 각 보고로 확인. 기존 Gemini 서버 변경 파일은 보존.
- 미완료: 공개 웹 연결·실제 공연 선택 후 가격/규정 보류·통합 검증·배포. 키 값은 기록하지 않음.


### [AID-20261103-KOPIS-WORKER-001] 공개 Worker 공연 검색 준비
- 시각: 2026-11-03T19:48:02+09:00
- 작성: Codex 하위 에이전트 kopis_worker (실행 모델 ID 미확인); 수신: Astra; 참조: ASTRA-KOPIS-001; 유형: 구현·인계.
- 파일: web/worker.ts, web/wrangler.jsonc, web/worker.test.ts, web/docs/KOPIS_WORKER.md. /api/performances는 KOPIS 목록만 반환하고, 키는 Worker secret으로 받아 원문·키를 오류에 노출하지 않는다. 공식 가격·규정은 포함하지 않는다.
- 검증: node --test worker.test.ts 5/5, worker 단독 TypeScript 검사, Wrangler deploy --dry-run 번들 성공. 정적 자산은 ASSETS 바인딩에 위임; Worker 우선 실행은 /api/* 한정. 외부 서비스·실제 배포 검증과 secret 등록은 미수행.
- 제한: IP 제한은 isolate별 30회/분의 임시 제한이며 전역 쿼터가 아니다. KOPIS 검색 상한 및 Cloudflare 전역 보호 검토 필요. 다음: Astra가 웹 통합 후 secret 등록·공개 검증.


### [AID-20261103-ASTRA-KOPIS-002] 실제 공연 검색 통합·배포
- 시각: 2026-11-03T21:17:42+09:00; 작성: Astra / Codex, 모델 GPT-6; 수신: 사용자·서버·웹·앱 담당.
- 사용자 제공 KOPIS 키는 server/.env 및 Cloudflare secret으로만 설정, 값 기록 없음. 서버 어댑터·별도 목록 API와 정적 웹 Worker를 통합하고 실제 KOPIS 공연 목록·기간·조회 시각을 시연 공연과 분리. 가격·입장 규정 및 AI 분석 미연결 공연은 대조 불가로 표시·차단.
- 검증: server 55개·웹 43개·Worker 5개 테스트 통과, 서버 타입 검사·웹 빌드 통과. KOPIS 실키 30건 응답과 Cloudflare /api/performances 실제 응답 확인. 배포 WebKit 390/1280에서 실제 공연명 선택·검색, 대조 보류, 가로 넘침 0 확인. 실기기·다른 브라우저 미확인.
- 배포 b8086877-7f41-44d3-ac9c-02d25f5b90eb. 수정: Cloudflare는 redirect:error 미지원이라 manual로 변경 후 3xx를 거부; XML 기본 엔티티 해석 추가. API 키는 웹 빌드에서 검색되지 않음.
- 한계: 공연 중 첫 30건, 개별 회차·공식 가격·입장/양도 규정·실제 공연 AI 대조 미연결. IP 제한은 isolate별로 전역 보장 아님. 사용자에게 키가 대화에 노출됐으므로 교체 안내.

### [AID-20261103-APP-021] 사용자 지시 "나머지들도 전부 구현": 제보 저장·주최 측 제보함·신고 요약·정확도 정답표
- 날짜·시각·시간대: 2026-11-03 21:35 KST (UTC+09:00) / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5
- 수신 대상: **Terra·Astra(server 교차 수정 검토 요청)**·웹 담당(제보함 웹 화면 제안). 수신 확인 없음.
- 유형: 구현(사용자 지시 우선, 소유 경로 밖 포함). Astra의 KOPIS 작업(kopis.ts, /performances, shared)과 겹치지 않게 새 파일 중심.
- server: `src/reports.ts`(신규 — 제보 검증·연락처/계좌 재가림·URL은 글자로만·clientRequestId 중복 방지·파일 저장 server/var/reports.json 권한600, 시연 담당 계정 로그인(ORGANIZER_ACCOUNTS 환경 변수, 코드 값은 기록·코드에 없음)·2시간 세션·담당 공연만 조회(타 공연 403, 타 공연 제보 404)·상태/메모 감사 기록·최소 정보 텍스트 내보내기(메모 제외)), `src/http.ts`(라우트 블록·CORS PATCH/Authorization만 추가), `src/main.ts`(저장소 연결), `test/reports.test.ts`(5개), 루트 `.gitignore`(server/var/). API: POST /reports, POST /organizer/login|logout, GET /organizer/reports?event_id=, GET|PATCH /organizer/reports/:id, GET /organizer/reports/:id/export. 팬 로그인은 없음(동의+중복 방지+IP 제한으로 대체 — 명세 '로그인한 사용자' 미충족).
- Gemini: 503 과다로 대체 모델 순서 추가(AI_FALLBACK_MODELS, 모델당 1회 재시도), 실제 응답 모델을 metadata.model에 기록(`ExtractionProvider.modelFor?` 선택 항목, service.ts 1줄).
- mobile: `src/contract/reports.ts`·`src/api/demoReports.ts`(신규), client/httpApi/demoApi 확장, `report.tsx`(동의 체크·주소/설명·주최 측 제보 보내기·접수 번호·신고용 요약 공유·공식 신고 경로: 경찰청 사이버범죄 신고시스템/국민신문고/예매처 공지, 자동 제출 없음·PDF는 부차), `admin.tsx`→주최 측 제보함(로그인·목록·상세·상태/메모·기록·내보내기, 시연 계정 표시), 홈 링크 이름 변경, display 제공자명 중복 수정.
- 정확도 정답표: `server/eval/extraction-cases.json`(합성 12건) + `scripts/eval-extraction.ts`. 2026-11-03 21:30 실행: Gemini 수요 과다로 8/12건이 30초 시간 초과(정확도가 아니라 가용성 문제). 응답한 4건은 48항목 중 44개 정답(약 92%), 주로 priceBasis를 unknown으로 둠. 결과 파일 server/eval/results-2026-11-03T12-30-49-646Z.json. 표본이 작아 일반 성능 아님. 재실행 필요.
- 검증: server 60/60·tsc, mobile Jest 86/86·tsc·lint 통과. D2 Release(시연 모드) 재빌드·실조작은 진행 중(다음 기록).
- 미구현·제외: 다중 플랫폼 수집·가격 추이·알림(약관·robots 확인 전제, 사용자에게 보고), KOPIS 연동은 Astra 진행 중, 웹 제보함 화면(웹 담당 소관).

### [AID-20261103-APP-022] 사용자 결정 전달: 제품 방향 전환 — 티켓 중개 구매 플랫폼이 메인, 암표 방지 시스템은 부가
- 날짜·시각·시간대: 2026-11-03 21:36 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: **Astra(기획·통합)·Terra·웹 담당**. 수신 확인 없음.
- 내용: 사용자 메시지 원문 "그리고 우리 티켓 중계 구매 플랫폼을 메인으로, 암표 방지 시스템은 부가적으로 변경했어". 또 "앱의 메인 화면도 구체화 시작하자. 어떤 방식으로 Design Refactoring 하는게 맞을까?"
- 영향(확인 필요): 기존 기획 명세 4절 '범위 밖: 티켓 거래·결제·양도 중개'와 충돌 → PLAN/SPEC 갱신은 Astra 담당. 결제·에스크로·판매자 인증·개인정보·전자상거래 관련 법적 요건, 실제 결제 여부(시연 결제인지) 등 사용자 결정 필요. 기존 대조·제보 기능은 '부가(안심 확인)'로 재배치 예정.
- 앱 다음 행동: 사용자에게 메인 화면 리팩터링 방식 제안·결정 받기 → 결정 기록 후 착수.

### [AID-20261103-APP-022-D] 사용자 결정: 플랫폼 전환 후 메인 화면 리팩터링 방식
- 날짜·시각: 2026-11-03 21:45 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra·웹 담당
- 사용자 응답: 진행 방식 "와이어프레임 먼저"(Pencil로 홈·매물 상세·구매 흐름을 그려 확인 후 구현, 웹 테마 유지) / 결제 "시연 결제만"(가상 결제·에스크로 흐름, '시연' 표시, 실제 돈 이동 없음) / 홈 "공연 탐색형"(공연 카드 → 공연별 판매 매물 목록) / 암표 방지 "매물마다 안심 배지"(정가 대비·공식 규정 충돌을 배지로, 누르면 근거, 신고는 매물 상세).
- 요청(Astra): PLAN/SPEC에 방향 전환·범위(시연 결제) 반영, 매물·주문(시연) 데이터 계약은 Terra와 조율 필요. 앱은 와이어프레임부터 착수.
- APP-021 Release 확인: D2 시연 모드 build·install·launch 통과(evidence/releases/20261103-213101/), XCUITest testDemoReleaseFlowD2·testLandingScrollD2 통과. 제보·제보함 화면은 Jest로만 확인, Release 실조작 캡처는 미수행.

### [AID-20261103-APP-022-F] 사용자 추가 요구: 공연·경기 즐겨찾기
- 날짜·시각: 2026-11-03 21:50 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra·웹 담당
- 원문: "사용자마다 본인들이 자주보는 콘서트나 공연, 경기 티켓들을 즐겨찾기할 수 있도록도 하자."
- 영향: 분류에 '경기(스포츠)' 추가, 사용자별 저장 → 계정(또는 기기 저장) 결정 필요. 와이어프레임에 하트 버튼·홈 상단 즐겨찾기 줄·즐겨찾기 탭/목록 반영. 즐겨찾기 공연의 새 매물 알림은 후속 후보(미결정).

### [AID-20261103-APP-023] 플랫폼 전환 와이어프레임 v1 (사용자 확인 대기)
- 날짜·시각: 2026-11-03 22:10 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·Astra·웹 담당
- 파일: `docs/mockups/ticketradar_platform_wireframe.pen`(조원 목업 ~/Downloads/ticket_rader_mock.pen 복사본에 보드 추가, 원본 미수정), 이미지 `docs/mockups/platform-wireframe-v1/platform-wireframe-v1.png`.
- 화면 7개: P1 홈(검색·내 즐겨찾기 줄·분류 전체/콘서트/뮤지컬·연극/스포츠·공연 카드에 최저가·안심 배지·하트, 하단 탭 홈/즐겨찾기/판매/내 거래/MY) · P2 공연 상세(회차·공식 정가표·출처, 매물 목록+안심 배지, 정가 초과·규정 충돌 매물은 주황 테두리) · P3 매물 상세(정가 대비, 안심 확인 근거 = 판매글 인용+공식 문구, 판매자 정보, 시연 에스크로 4단계, 신고) · P4 시연 결제(시연 배너, 주문 요약, 시연 결제 수단, 수령 확인 후 정산 동의) · P5 내 거래 진행(타임라인, 공식 양도 안내, 수령 확인) · P6 즐겨찾기(분류, 새 매물 수·최저가, 알림은 후속 결정) · P7 판매 등록(공연 선택, 좌석·매수·장당 가격 입력 즉시 정가 비교, 전달 방식 선택 시 공식 규정 안내, 기존 판매글 AI 읽기 엔진을 등록 도우미로).
- 원칙 유지: 배지는 비교 결과이며 진위·입장 보증 아님 문구, 시연 결제 표시, 가상 공연 표시.
- 미결정(사용자): 즐겨찾기 저장 방식(로그인 계정 vs 기기), 정가 이하 새 매물 알림 여부, 판매자 인증 수준(시연 표시).
- 다음: 사용자 확인·수정 요청 반영 후 앱 구현(매물·주문 시연 데이터 계약은 Terra/Astra 조율 필요).


### [AID-20261103-DEMO-MARKET-DOMAIN-001] 가상 구매·양도 검토 계약
- 시각: 2026-11-03T21:40:58+09:00; 작성: Codex 협업 live_backend / 실제 모델 ID 미확인; 수신: Astra·웹·앱; 유형: 구현·테스트·인계.
- 사용자 결정(이 세션 Astra 전달): 플랫폼 내 최초 예매와 개인 양도 모두 합성 공연·매물로만 시연하며 결제·실거래 직전 검토까지. APP-022-D의 시연 결제 실행 흐름과 다른 결정이므로 최종 범위는 Astra가 조율한다. 실제 KOPIS 목록은 실제 판매 재고가 아님.
- 파일: shared/marketplace.ts·shared/package.json(subpath export), server/src/demo-marketplace.ts, server/test/demo-marketplace.test.ts. DemoMarketplace.listEvents/listResale/registerResale/prepareReview. 등록 가격=기재 시연 구매가, 이벤트·회차·등급·수량·상태 검증. 전달 방식 not_specified/other, 보유·기재 원가·양도 허용 전부 검증되지 않음으로 표시. 검토 결과 synthetic·review_only·결제 불가·예약 없음. API 라우트·프론트·배포 변경 없음.
- 검증: 신규 단위 9/9, 서버 전체 69/69, server tsc 통과, web cwd에서 shared/marketplace subpath import 확인. 실서버/웹·앱 연결·브라우저·기기·배포 미수행. 메모리 등록은 서버 재시작 시 사라지며 재고·예약을 변경하지 않는다.

### [AID-20261103-APP-023-V2] 사용자 요청 "더 깔끔하고 명확하게, Toss 디자인 레퍼런스" → 와이어프레임 v2
- 날짜·시각: 2026-11-03 22:25 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·Astra·웹 담당
- 파일: 같은 .pen에 보드 'PLATFORM · 와이어프레임 v2' 추가(v1 보존), 이미지 `docs/mockups/platform-wireframe-v2/platform-wireframe-v2.png`.
- 적용 원칙(토스 스타일 참고, 로고·화면 복제 없음): 화면당 큰 대화체 제목 1개, 카드·테두리 제거(흰 바탕 목록 + 12px 회색 구역 띠), 배지 대신 색 글씨 한 줄("8,000원 저렴해요"/"30% 비싸요"), 하단 넓은 버튼 1개(반경 16), 판매 등록은 한 화면 한 질문(1/3), 탭 바 단색. 색: 본문 #191F28·회색 #4E5968/#8B95A1·띠 #F2F4F6, 강조는 브랜드 남색 #404890 유지, 경고 #E8483B.
- 디자인 지침 영향: D01(토큰)·D02(색 의미)에 회색 체계·경고 빨강 추가 필요 → 사용자 확정 후 tokens 갱신을 Astra에 요청 예정. 확정 전이므로 앱 코드 변경 없음.


### [AID-20261103-ASTRA-MARKET-001] 플랫폼 중심 방향 및 시연 경계
- 시각: 2026-11-03T21:45:00+09:00; 작성: Astra / Codex GPT-6; 수신: 서버·웹·앱 담당; 유형: 사용자 결정·작업 배분.
- 사용자 결정: 플랫폼에서 공식 최초 예매와 개인 양도 구매를 중심으로 하고 암표 방지·판매글 대조는 부가 기능. 양도 등록가는 원구매가와 동일해야 함. 실제 판매권·재고가 없어 가상 공연·좌석·양도 매물을 표시하고 실제 결제·거래 직전까지만 시연. KOPIS 실제 공연은 자사 재고·판매권이 아님.
- 이 세션의 결제 직전 종료는 APP-022-D의 가상 결제/에스크로 흐름보다 최신 결정. 앱의 와이어프레임 우선 결정 및 공연·경기 즐겨찾기 요구는 유지하며, 기존 앱 코드/와이어프레임 변경은 해당 담당과 조율.
- PLAN.md·SPEC.md 최신 배너와 docs/MARKETPLACE_DIRECTION.md에 반영. 공통 계약·시연 도메인은 live_backend, 웹 시연 UI는 market_design 담당. 앱 read-only 점검 market_app. 하위 에이전트 실제 모델 ID는 미확인.
- 검증·배포: 진행 중. 실제 보유·원구매가 진위·양도 허용·좌석 재고·거래/결제를 확인했다고 주장하지 않음.

### [AID-20261103-APP-024] 사용자 확정: 와이어프레임 v2로 구현 착수 · 즐겨찾기=로그인 계정 · 정가 이하 매물 알림 포함
- 날짜·시각: 2026-11-03 22:35 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra·웹 담당
- 사용자 원문: "좋아 현재 방식으로 계속 가자. 즐겨찾기는 로그인 계정에 남기고 정가 이하 매물 알림도 넣자."
- 결정: 디자인 = 와이어프레임 v2(토스 스타일 참고, 강조색 브랜드 남색 유지) / 즐겨찾기 = 로그인 계정 저장 / 즐겨찾기 공연의 정가 이하 새 매물 알림 = 포함 / 결제 = 시연 결제·시연 에스크로만.
- 착수 범위(앱 담당, 사용자 지시로 server 교차 수정 포함): 계정(시연 로그인)·공연/매물·안심 확인 계산·즐겨찾기·알림·시연 주문 API, 앱 탭 구조 재구성과 v2 화면. 기존 판매글 확인·제보·주최 측 제보함은 '전체' 탭으로 유지.
- 요청(Astra): PLAN/SPEC·디자인 토큰(회색 체계·경고 빨강) 갱신, 웹 반영 여부 결정. (Terra) 서버 교차 수정 검토.


### [AID-20261103-DEMO-MARKET-DOMAIN-002] 웹 시연 공연 데이터 정합
- 시각: 2026-11-03T21:46:58+09:00; 작성: Codex 협업 live_backend / 실제 모델 ID 미확인; 수신: Astra·웹·앱; 유형: 구현·검증.
- 범위: server/src/demo-marketplace.ts, server/test/demo-marketplace.test.ts. 웹 담당과 직접 대조하여 레이더 라이브 2026(11/21 19시 VIP 154000원 12매, R 132000원 3매) 및 뮤지컬 나침반(12/5 14시 R 110000원 8매, S 88000원 3매), 시연 양도 resale-1(라이브 R 132000원 1매), resale-2(나침반 S 88000원 2매)를 정렬. 전부 합성·비실거래.
- 등록 도메인은 공연·회차·등급·기재 구매가와 양도가의 일치·수량을 검사하며 보유·구매가·양도 가능은 검증하지 않음. 검토는 결제·예약 없이 종료. 웹 연결·서버 배포는 하지 않음.
- 검증: 새 도메인 10/10, server 전체 70/70, server tsc 통과.


### [AID-20261103-WEB-MARKET-001] 예매·원구매가 양도 시연 웹 구현
- 시각: 2026-11-03T21:52:46+09:00; 작성: 협업 market_design / 실제 모델 ID 미확인; 수신: Astra·서버·앱; 유형: 구현 인계.
- 범위: web/src/components/Marketplace.tsx, marketplace.css, Marketplace.test.tsx, App.tsx, App.test.tsx, Landing.tsx. 서비스 소개→가상 공식 예매·원구매가 양도 탐색·상세·등록·수량 선택·결제 직전 확인, 기존 KOPIS 공연 검색 및 안심 확인 별도 진입. 서버 HTTP 연동 없음, 브라우저 메모리 시연, 새로고침 초기화. 모든 재고·매물은 가상. 결제·예약·발권·양도 실행 없음.
- DemoResaleRegistrationSchema 직접 검증, 구매가=양도가 및 행사/회차/좌석 선택지 일치 검사. 구매가 진위·보유·양도 가능은 미검증으로 표시. 레이더·나침반 fixture는 live_backend와 공연/회차/좌석/수량/가격을 정렬.
- 검증: web 47/47, Vite 빌드 통과. WebKit offline dist 320/390/768/1280 가로 넘침 0, 불일치 가격 거부·일치 등록·결제 비활성 확인. 캡처 /private/tmp/aid-market-390.png, /private/tmp/aid-market-1280.png. 공개 배포·실기기 미수행.
- D01~D12: 기존 네이비·인디고, 반응형·키보드 포커스·모션 축소, 명시적 시연·미검증 고지 유지; 법적 보장·실 결제 없음. 공식 데이터와 AI는 기존 별도 흐름 유지. 접근성 정량 대비·실제 스크린리더 및 다른 브라우저는 미측정.


### [AID-20261103-ASTRA-MARKET-002] 웹 시연 통합 검증 및 배포
- 시각: 2026-11-03T22:01:03+09:00; 작성: Astra / Codex GPT-6; 수신: 사용자·웹·서버·앱; 참조: ASTRA-MARKET-001, WEB-MARKET-001, DEMO-MARKET-DOMAIN-002.
- 웹: 가상 최초 예매·원구매가 양도 매물 탐색/등록, 수량·합계 확인, 결제 직전 종료. 입력한 구매가 진위·소유·양도 허용은 검증하지 않으며 가상 표시. 매물 상태는 브라우저 메모리, 새로고침 시 초기화. 공유 등록 스키마 사용이나 서버 Marketplace HTTP 미연결. KOPIS 실공연 검색은 별도.
- 검증: web 테스트 47, server 테스트 78, Worker 테스트 5, web build·server typecheck 통과. offline WebKit 320/390/768/1280, 공개 WebKit 390/1280에서 가격 불일치 거부·2매 합계·결제 비활성·KOPIS 목록·가로 넘침 0 확인. 실기기/다른 브라우저는 미검증.
- 공개 배포: ticketradar.month32.workers.dev Worker dd8fc711-5ae1-4a88-9b55-0cac87b37def. 실제 결제·예약·발권·정산·권리 이전 미구현.
- 앱: 별도 와이어프레임/구현이 진행 중이어서 이 세션에서 mobile 수정·릴리즈 없음. APP-024의 시연 결제·에스크로와 이 대화의 결제 직전 종료가 서로 다르므로 다음 통합 전 사용자 결정의 시점·범위를 대조할 것. 즐겨찾기 계정 저장 및 알림은 웹 미구현.

### [AID-20261103-APP-024-DONE] 플랫폼(중개 구매) 1차 구현: 계정·즐겨찾기·정가 이하 알림·시연 결제·판매 등록 + 토스 스타일 v2 화면
- 날짜·시각: 2026-11-03 22:10 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: **Terra·Astra(server 교차 수정 검토)**·웹 담당
- server(사용자 지시로 교차 수정, 새 파일 중심): `src/market-core.ts`(순수 규칙 엔진: 안심 확인=같은 좌석 등급 공식 정가 비교·등록된 공식 규정 대조, 즐겨찾기·새 매물 수, 정가 이하 알림(즐겨찾기+알림 켠 다른 사용자), 시연 주문 held→sent→settled/취소, 시드: AKMU 실제 공식 스냅샷 + 가상 공연 3건·시연 매물), `src/market.ts`(가입·로그인: 비밀번호 scrypt 해시만 저장·7일 세션, 파일 저장 server/var/market.json 권한600, 라우트 /auth/* /me /shows /listings /me/favorites /me/alerts /me/notifications /orders), `src/http.ts`(라우트 연결·CORS PUT/DELETE), `src/main.ts`, `test/market.test.tsx`→`test/market.test.ts`(8개). AKMU 공식 규정은 카탈로그 원문("실관람자가 모두 동일인이어야 합니다." 팬클럽 선예매)만 사용, 캡처 입장 불가 같은 규정은 가상 공연에만(와이어프레임의 AKMU 캡처 문구는 예시였음 — 정정).
- mobile: `src/market/engine.ts`(server market-core.ts 동일 복사본, 서버 테스트가 해시 동일성 검사), `src/market/api.ts`(실서버/시연 모드), `MarketContext`, `src/ui/toss.tsx`(v2 부품), 탭 구조 `src/app/(tabs)/`(홈·즐겨찾기·판매·내 거래·전체), `show/[id]`·`item/[id]`(안심 확인, 매물 신고→기존 제보 API)·`checkout/[id]`(시연 결제)·`order/[id]`·`login`·`notifications`, 기존 홈(웹 소개 스크롤)은 `about`(전체 탭 '서비스 소개'), 기존 판매글 확인 흐름은 전체 탭 '다른 곳 판매글 확인하기'. 아이콘 9종 추가.
- 검증(구분): server 78/78·tsc / mobile Jest 91/91(플랫폼 5개 신규)·tsc·lint / D2 Release(시연 모드) build·install·launch 통과(evidence/releases/20261103-220227/) / XCUITest 4개 통과: testMarketFlowD2(가입→하트→경고 매물→정가 이하 매물 시연 결제→티켓 받았어요→거래 완료→즐겨찾기 알림 스위치) 21.4s, testDemoReleaseFlowD2 31.2s, testLandingScrollD2 39.4s, testCaptureOcrD2 14.1s. 화면 캡처 market-contact.png 직접 확인. 실서버 /shows 응답 확인(실제 1건+가상 3건).
- 한계: 로그인 토큰은 앱 메모리(앱 재실행 시 재로그인, 즐겨찾기·알림 설정은 계정에 유지). 알림은 앱 안 알림(배지·목록)이며 푸시는 미구현. 시연 모드 계정은 앱 메모리. 실서버 모드 Release 실조작·웹 반영·실기기 미수행. 판매자 본인 인증은 표시만(시연).
- 요청: Astra — PLAN/SPEC·디자인 토큰 갱신, 웹 반영 여부 결정 / Terra — market·reports 교차 수정 검토.


### [AID-20261103-LANDING-PLATFORM-001] 플랫폼 중심 소개 흐름
- 시각: 2026-11-03T22:23:41+09:00; 작성: 협업 landing_reframe / 실제 모델 ID 미확인; 수신: Astra·웹·앱.
- 파일: web/src/components/Landing.tsx, SiteHeader.tsx, web/src/index.css, web/src/App.test.tsx. 기존 도입 뒤 예매·양도 2구간(시연권·가상재고, 구매확인·판매등록) 추가 후 기존 3D 폰·안심 대조를 부가 기능으로 유지. 메뉴/좌측 구간 표시·도입 스크롤 목표 정렬. 원구매가 기재값의 진위·보유 미검증과 결제·예약·이전 없음 명시.
- 검증: 웹 테스트 48/48·빌드 통과, 로컬 서버 없이 WebKit 320/390/768/1280 및 390 모션축소에서 새 섹션 노출·가로 넘침 0·좌측/헤더 활성 구간·CTA 이동 확인. 390/1280에서 메뉴 점프와 신규→폰 구간 순·역 스크롤 확인. 캡처 /private/tmp/aid-reframe-market-intro-1280-false.png, /private/tmp/aid-reframe-market-flow-390-false.png, /private/tmp/aid-reframe-boundary-1280.png.
- 한계: 기존 사용자가 지정한 3D 접근·대기 및 선·형광펜 타이밍은 보존하여 안심 구간의 전체 스크롤 거리가 신규 본편보다 길다. 실제 3D·실기기·공개 배포 후 검증은 Astra 담당.

### [AID-20261103-APP-025] 사용자 지시 "전부 구현" + "Astra·Terra 몫도 직접": 기기 알림·로그인 유지·실서버 확인·기획/디자인 문서 갱신·서버 독립 검토 반영
- 날짜·시각: 2026-11-03 22:35 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra·웹 담당(참고)
- 사용자 원문: "전부다 구현하자", "(Terra·Astra에 요청한) 이 내용도 그냥 너가 다 구현 시작하자".
- 기기 알림: expo-notifications(~58.1.7). 로그인·알림 켬 상태에서 앱이 앞에 있을 때 20초마다·앱 복귀 시 새 알림 확인 → 앱을 연 뒤 생긴 정가 이하 알림만 기기 알림, 누르면 매물로 이동. 권한은 가입·로그인·알림 켤 때 요청(거부 시 앱 안 알림만, 안내 문구). 앱이 완전히 꺼진 상태의 원격 푸시는 Apple 푸시 키·실기기 필요로 미구현.
- 로그인 유지: expo-secure-store(~58.0.2), 토큰을 키체인(WHEN_UNLOCKED_THIS_DEVICE_ONLY)에 저장, 앱 시작 시 /me 로 복원(거절 시 삭제), 로그아웃 시 삭제. Face ID 문구 미추가(faceIDPermission:false). 시연 모드는 계정이 메모리라 재실행 시 복원 안 됨(정상).
- 네이티브: `npx expo prebuild --platform ios` 전 ios/ 백업·비교 — 변경은 새 Pod 2개, aps-environment 엔타이틀먼트, pbxproj ID 재생성뿐(수기 수정 손실 없음). DerivedData 삭제 후 재빌드. 시뮬레이터 빌드 서명: unsigned 빌드에서 키체인 -34018(엔타이틀먼트 없음) 확인 → `scripts/release_d2.py`를 로컬 임시 서명(CODE_SIGN_IDENTITY='-')으로 변경(실기기 서명 아님).
- 앱 HTTP: 판매글 AI 확인 요청만 제한 시간 35초(서버 AI_TIMEOUT 30초·Gemini 대체 모델 재시도보다 길게). 이전 15초로 실서버 AI 실조작이 시간 초과됐음.
- 문서(Astra 몫, 사용자 지시로 직접): `docs/design/tokens.json` v2(이전 v1은 legacyV1로 보존), `DESIGN_SPEC.md` 상단 결정 + §7(D01·D02·D03 갱신, D13 시연 결제 표시, D14 공식 규정 출처, D15 계정 데이터), `PLAN.md` 상단 현재 결정(플랫폼 전환·시연 결제 범위·기존 '거래 중개 범위 밖'은 시연 범위로 대체), `SPEC.md` 플랫폼 API 계약표·안심 확인 규칙. 웹(web/)은 수정하지 않음 — 웹 반영은 웹 담당/사용자 결정 필요.
- 서버 독립 검토(Terra 몫, 별도 검토 에이전트, 재현 스크립트 포함): 반영 — ①구매자가 '전달됨' 후 취소→매물 재판매 가능(차단, 판매자만 취소) ②delivery `__proto__` 등 상속 키 통과(hasOwnProperty) ③매물 무제한·Math.min 전개 RangeError(판매자당 20건·전체 5000건, reduce) ④GET 마다 전체 파일 저장(1분에 한 번만) ⑤띄어 쓴/구분자 없는 계좌번호 미가림(10~16자리 규칙, 앱 reportDoc도 동일) ⑦잘못된 % 인코딩 500→400 ⑧Gemini 재시도 시 이전 응답·리스너 정리. 미반영(기록) — ⑥프록시 뒤 IP 공유 시 호출 제한 공유, ⑨저장 실패 시 메모리 반영 불일치(로컬 시연 환경 영향 적음). 확인된 정상: 소유자·담당 공연 접근 제한, 중복 구매 불가, 시간 일정 비교, tmp+rename 저장.
- 검증(진행 중 결과는 다음 기록): server 79/79·tsc, mobile Jest 93/93(로그인 복원·기기 알림 발송/누르면 이동 테스트 추가)·tsc·lint. 직전 실행: 시연 빌드 UI 4개 통과, 실서버 빌드 testMarketFlowD2 통과, testSessionRestoreD2(키체인 -34018)·testAiLiveFlowD2(앱 15초 제한) 실패 → 위 조치 후 재실행 중.


### [AID-20261103-ASTRA-LANDING-PLATFORM-002] 소개 페이지 통합·배포
- 시각: 2026-11-03T22:29:50+09:00; 작성: Astra / Codex GPT-6; 수신: 사용자·웹·앱; 참조: LANDING-PLATFORM-001.
- 예매·양도 소개와 구매/판매 이용 흐름을 앞에 배치, 3D 휴대폰·안심 대조는 뒤에 보존. 가상 재고/매물, 결제 직전 종료, 원구매가 진위·보유 미검증 명시. 공유 OG 설명도 플랫폼 중심 시연으로 갱신.
- 검증: 웹 48개·Worker 5개 테스트와 빌드 통과. offline WebKit 320/390/768/1280·390 축소모션 및 390/1280 역방향 경계·메뉴, 공개 WebKit 390/1280 문단 순서·CTA·KOPIS·양도가 불일치·결제 비활성 및 넘침 0 확인. 실제 단말·다른 브라우저 미확인.
- 배포: ticketradar.month32.workers.dev 버전 c7bca0be-c530-4a6c-9197-863962d8f910. OG 태그·이미지 공개 응답 확인, 카카오 공유 캐시는 이번 변경 후 미초기화.
- 한계: 기존 3D 폰·안심 확인의 스크롤 연출 시간을 보존해 보조 구간이 실제 길이는 더 김. 앱·서버 구현과 별개, 실제 결제·예약·재고/공식판매권 없음.


### [AID-20261103-MARKET-MOTION-001] 새 플랫폼 소개 스크롤 연동
- 시각: 2026-11-03T22:45:07+09:00; 작성: 협업 landing_reframe / 실제 모델 ID 미확인; 수신: Astra·웹; 유형: 구현·검증.
- 파일: web/src/components/Landing.tsx, web/src/index.css, web/src/ui/useScrollEffects.ts. 예매·양도 제목 소폭 확대, 소개/단계/판매자 문장 형광선, 카드 상단 선, 3단계 세로 진행선을 별도 스크롤 진행률로 제어. 새 구간의 data-reveal 시간 애니메이션 제거. 모든 본문은 불투명도 1로 읽을 수 있음; 메뉴 앵커 동작은 기존 일반 섹션 방식 유지.
- 검증: web 48/48·build 통과. 로컬 서버 없는 WebKit 320/390/1280 진행률 및 역행, 1초 정지 후 스타일 불변, 390 모션축소 정적 표시, 오류·가로 넘침 0. 카드/판매자 별도 320/390/1280 진행/역행 확인. 캡처 /private/tmp/aid-market-motion-390-false.png, /private/tmp/aid-market-motion-1280-false.png.
- 한계: 실제 사용자 장치·타 브라우저·공개 배포는 Astra가 독립 검증. 3D 폰·기존 대조 효과·가상/결제 한계 변경 없음.

### [AID-20261103-APP-025-R] APP-025 실조작 결과(시연·실서버 Release)
- 날짜·시각: 2026-11-03 22:52 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: Astra·Terra
- 시연 빌드(로컬 임시 서명): evidence/releases/20261103-224634/ testMarketFlowD2 통과(39.6s, 가입 시 iOS 알림 권한·'암호 저장' 창 처리 포함). 같은 날 20261103-224001 빌드(로그인 칸 종류 지정 전)에서 testDemoReleaseFlowD2·testLandingScrollD2·testCaptureOcrD2 통과.
- 실서버 빌드(AID_RELEASE_API=http://127.0.0.1:3001, Gemini): evidence/releases/20261103-224749/ testMarketFlowD2 통과(40.4s), testSessionRestoreD2 통과(18.9s: 가입→앱 종료·재실행→같은 계정 복원), testAiLiveFlowD2 통과(17.8s).
- 실조작 중 발견·수정: ①unsigned 빌드 키체인 -34018 → 로컬 임시 서명 ②앱 15초 제한 < 서버 AI 30초 → 판매글 확인만 35초 ③로그인 비밀번호 칸 newPassword 종류가 iOS '강력한 암호' 창을 띄워 입력 소실 → 일반 password 종류(저장 제안은 유지) ④재실행 직후 시작 연출 중 탭은 건너뛰기로 처리됨(테스트 대기 추가, 앱 정상 동작).
- 서버 데이터: 실서버 테스트 전 시연 저장소 초기화(server/var/market.json 삭제·재시드, 이전 파일은 작업 임시 폴더에 백업). 현재 서버 127.0.0.1:3001 실행 중, 시뮬레이터에는 실서버 빌드 설치 상태.
- 남은 일: 원격 푸시(Apple 푸시 키·실기기), 웹 반영(웹 담당/사용자 결정), Android, 검토 미반영 2건(프록시 IP·저장 실패 롤백).


### [AID-20261103-ASTRA-MARKET-MOTION-002] 스크롤 효과 독립 검증·배포
- 시각: 2026-11-03T22:52:35+09:00; 작성: Astra / Codex GPT-6; 수신: 사용자·웹 담당; 참조 MARKET-MOTION-001.
- 새 예매·양도 제목 미세 확대, 카드 상단선, 설명 형광선 및 이용 흐름 세로 진행선/단계 강조를 스크롤 위치에 연동. 본문은 숨기지 않고 모션 축소 시 정적으로 표시.
- 독립 검증: 웹 48개·Worker 5개 테스트 및 빌드 통과. 서버 없이 WebKit 320/390/1280 순·역·정지, 390 모션축소 확인; 공개 WebKit 390/1280에서 형광선 진행·역행·1초 정지 불변 및 넘침 0 확인. KOPIS 공개 API 200. 실기기·다른 브라우저 미확인.
- 배포: ticketradar.month32.workers.dev 버전 09e2f653-8d67-4ca1-9218-8e38ad9d0ff4.

### [AID-20261103-APP-026] 할 일 목록 TODO.md 신설
- 날짜·시각: 2026-11-03 22:58 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·Astra·Terra·웹 담당
- 사용자 지시 "Todolist에 기록해두자" → 루트 `TODO.md` 신설(기존 같은 역할 문서 없음 확인), README에 연결. 사용자 결정 5건·앱 10건·서버 7건·문서 2건·완료 6건. 끝난 항목은 지우지 않고 [x]·날짜·기록 ID로 표시하는 규칙.

### [AID-20261103-APP-027] 사용자 요청: 앱 모션·Animate·세부 디테일링·콘서트 썸네일 → TODO.md 등록(구현 전)
- 날짜·시각: 2026-11-03 23:30 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·Astra
- 사용자 원문: "우선 여기까지하고, 앱 안에서의 모션이나 Animate들을 추가적으로 더 구현해야할 것 같아… 기본적인 뼈대 UI는 잡았는데, 세부적으로 디테일링을 더해야할 것같고, 콘서트의 썸네일도 필요해", "우선 이것들도 전부 Todolist로 올리자".
- 조치: `TODO.md`에 '앱 · 모션과 세부 디테일' 절 추가(썸네일 출처 사용자 결정 1건 + 썸네일·홈·공통 반응·상세·결제·판매·즐겨찾기/알림·검증 항목). 사용자 스크린샷(11:25)에서 확인된 홈 헤더 겹침(스크롤 시 큰 제목이 로고 밑으로 비침)과 즐겨찾기 이름 잘림 포함. 코드 변경 없음.
- 참고: KOPIS 어댑터(server/src/kopis.ts)는 현재 poster 필드를 읽지 않음 — 포스터 사용 시 이용 조건·출처 표기 확인 필요.

### [AID-20261106-TERRA-001] 사용자 결정·멘토 피드백 반영과 가격 정책 착수
- 날짜·시각·시간대: 2026-11-06 14:04 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-001 / APP-024, ASTRA-MARKET-002, APP-027
- 유형: 착수
- 담당 파일·수정 범위: TODO.md, Communicate.md, 우선 shared의 독립 가격 정책 및 관련 테스트. 기존 server/mobile 공통 로직 및 web 연동 변경은 소유 범위·인터페이스 확인 후.
- 내용: 사용자가 웹·앱 공통 거래 완료 시연, 실제 공연 연결, AI 안정성 및 멘토 피드백(제휴 판매·암표 판별과 신고·정가 상한·좌석 OCR)을 요청. 상한은 검증된 공식 정가 이하로 결정. 실제 결제·권리 이전은 기존 시연 경계 유지. KISA 신고 역할은 미확인; KOCCA 공연 암표 신고 경로는 공식 자료에서 확인.
- 실제 검증 근거: TODO.md와 프로젝트 코드·협업 기록 확인. 웹은 브라우저 메모리 기반, 앱은 서버 거래 API 사용 기록. market-core는 등록가 초과를 경고만 하는 경로가 있음. Git 미초기화.
- 남은 미확인 사항: 회차별 가격 출처 계약, 공유 상태·배포 아키텍처, 실제 신고 연계, 제휴·재고, AI 현재 할당량, OCR 범위·동의 및 타 담당 작업 상태.
- 다음 행동: 독립 가격 정책과 회귀 검증부터 진행하고 공유 계약 및 연동 작업을 순차적으로 확인한다.

### [AID-20261106-TERRA-002] 정가 상한 독립 정책 초안
- 날짜·시각·시간대: 2026-11-06 14:12 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-001
- 유형: 완료
- 담당 파일·수정 범위: shared/price-cap.ts, shared/price-cap.test.ts
- 내용: 같은 공연·회차·등급·시연 여부·장당 기본가와 출처/확인일이 맞는 입력에서 상한 이하만 허용하는 독립 함수 초안. 출처 문자열의 존재는 진위 검증이 아니며 데이터 수집 단계에서 공식 근거 검증이 선행돼야 한다. 실제/시연 근거 형식과 수수료·할인 조건은 통합 전 확정 필요.
- 실제 검증 근거: node --test shared/price-cap.test.ts 2개 통과, 이하·동일·초과·누락·불일치·잘못된 가격 확인.
- 남은 미확인 사항: 기존 서버·앱은 이 함수를 사용하지 않아 정가 초과 등록은 아직 차단되지 않음. 기존 show 모델은 회차별 가격 출처 및 시연 URL을 제공하지 않고 기존 테스트는 초과 등록을 허용하며 기존 시드에도 초과 매물이 있음. AI 재확인·KOPIS 연결·웹/앱 연동·배포·OCR·신고 미수행.
- 다음 행동: 회차별 공식 가격 근거 모델과 기존 데이터 이행·거래 시 재검증을 확정하고 서버/앱 정책 및 화면을 함께 연결한다.

### [AID-20261106-TERRA-003] 서버 연결 점검과 로그인 방식 결정
- 날짜·시각·시간대: 2026-11-06 14:25 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-003 / APP-025-R
- 유형: 착수
- 담당 파일·수정 범위: TODO.md, Communicate.md, server의 독립 이메일 입력 규칙·테스트. 기존 로그인과 데이터는 보존하며 새 인증 API와 화면은 후속 연동.
- 내용: 신고 기관과 공식 연계 계약이 아직 없다고 사용자 확인. 로그인은 이메일·비밀번호와 카카오·Apple 선택. localhost 3001 수신 프로세스 없음 확인 후 기존 서버 npm start 실행. 민감 설정 값은 읽거나 기록하지 않음.
- 실제 검증 근거: 로컬 /health 정상, /shows 응답 확인. 설치된 앱의 현재 화면 캡처는 즐겨찾기 화면이며 홈 재시도 성공은 별도 미확인. 기존 화면은 닉네임·비밀번호 로그인.
- 남은 미확인 사항: 실서버 연결 재시도, 실제 이메일 인증·소셜 개발자 설정 및 서버 세션·HTTPS·계정 이행, 테스트·기기 검증.
- 다음 행동: 이메일 입력 규칙 및 회귀 테스트를 준비하고 인증 방식과 기존 계정 이행을 연결한다.

### [AID-20261106-TERRA-004] 이메일 입력 규칙 초안 검증
- 날짜·시각·시간대: 2026-11-06 14:31 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-003
- 유형: 확인
- 담당 파일·수정 범위: server/src/email-identity.ts, server/test/email-identity.test.ts
- 내용: 이메일 입력의 공백 제거·도메인 정규화·기본 형식 검증 함수를 별도로 준비. 실제 이메일 소유 확인이 아니며 모든 유효한 국제 이메일 형식을 지원하지 않는다. 기존 닉네임 인증 API·앱 화면은 변경하지 않았다.
- 실제 검증 근거: 독립 테스트 2개 통과, server npm run typecheck 통과, 로컬 /health 정상. 실제 이메일·카카오·Apple 로그인 실행 없음.
- 남은 미확인 사항: 이메일 인증·중복 식별 정책, 계정 이행, 로그인 화면·서버 연결, 카카오/Apple 설정과 인증 검증, TLS·실서비스 배포, 홈 재시도 화면.
- 다음 행동: 사용자에게 서버 재시도를 안내하고, 공통 인증 설계와 제공자 설정을 준비한다.

### [AID-20261106-TERRA-005] 인증 리팩터링 착수
- 날짜·시각·시간대: 2026-11-06 14:37 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-003·004
- 유형: 착수
- 담당 파일·수정 범위: server/src/market.ts, server/test/market.test.ts, 관련 문서. 기존 닉네임 계정·API 보존, 이메일 방식은 별도 명시적 입력으로 추가. 앱 화면·소셜 연동은 별도 검증 후 적용.
- 내용: 사용자 이메일·비밀번호 및 카카오·Apple 로그인 방향 승인. 이메일 소유 검증과 소셜 자격 증명은 미연결 상태로 명확히 구분. 기존 데이터 삭제·계정 자동 병합 없음.
- 실제 검증 근거: 기존 로그인·저장 구조와 Expo SDK 58 공식 문서 확인. Git 미초기화. 타 담당 신규 착수 기록 없음.
- 남은 미확인 사항: 개발자 제공자 설정, 이메일 발송 및 인증, 기존 계정 연결 정책, 실제 배포와 운영 보안.
- 다음 행동: 이메일 계정 생성·로그인 호환 경로와 회귀 테스트를 작성한다.

### [AID-20261106-TERRA-006] 이메일 계정 서버 1차 구현
- 날짜·시각·시간대: 2026-11-06 15:00 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·웹·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-005
- 유형: 완료
- 담당 파일·수정 범위: server/src/market.ts, server/test/market.test.ts
- 내용: 기존 nickname/password API와 데이터를 유지하며 가입 시 email을 추가로 저장하고 email/password 로그인 경로를 추가. 이메일 중복·형식·비밀번호 오류를 검사하고 기존 계정은 자동 병합하지 않는다. 이메일 가입도 nickname이 필요하며 닉네임 로그인은 계속 가능하다. 이메일 소유 검증은 아직 없다.
- 실제 검증 근거: node --test test/market.test.ts test/email-identity.test.ts 13개 통과(HTTP 이메일 가입·로그인·오류와 저장 후 복원 포함), server npm run typecheck 통과. 처음 sandbox에서 로컬 listen EPERM으로 실패하여 승인된 환경에서 재실행했다.
- 남은 미확인 사항: 이메일 인증·재설정·계정 병합·소셜 인증·실서비스 보안 및 앱/웹 화면 연결. 현재 실행 서버는 코드 변경 전 실행된 프로세스이므로 이 변경은 재시작 전 반영되지 않는다. 시뮬레이터 화면 변경·빌드·배포 없음.
- 다음 행동: 공통 인증 계약과 이메일 검증 수단을 확정하고 앱/웹 화면을 연결한다. 카카오·Apple은 공식 개발자 설정 확보 후 실제 연동한다.

### [AID-20261106-TERRA-007] 앱 로그인 입력 수정 착수
- 날짜·시각·시간대: 2026-11-06 15:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-006
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/src/market/api.ts 및 로그인 관련 테스트. 기존 가입과 시연 계정 보존.
- 내용: 사용자 피드백에 따라 로그인 입력을 아이디 또는 이메일로 바꾸고 서버의 이메일/기존 아이디 경로로 전달한다. 가입 시 표시명은 기존 방식 유지; 이메일 가입·소셜 인증은 후속 작업.
- 실제 검증 근거: 기존 화면과 API 계약 확인, Expo SDK 58 및 React Native TextInput 공식 문서 확인. 다른 담당자의 새 착수 기록은 확인되지 않음.
- 남은 미확인 사항: 앱 테스트·D2 Release와 화면 검증, 새 서버 반영, 이메일 가입·소셜 인증.
- 다음 행동: 로그인 라우팅과 화면을 수정하고 검증한다.

### [AID-20261106-TERRA-008] 아이디 또는 이메일 로그인 화면 1차 반영
- 날짜·시각·시간대: 2026-11-06 15:11 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-007
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/src/market/api.ts, mobile/__tests__/market.test.tsx, mobile/__tests__/marketLogin.test.ts
- 내용: 로그인 라벨을 아이디 또는 이메일로 변경. 이메일은 email 필드로, 기존 아이디는 name 필드로 전송. 가입은 기존 닉네임 기반을 보존한다. 시연 모드에는 이메일 계정이 없다.
- 실제 검증 근거: 대상 Jest 9개 통과, typecheck·lint 통과; Release 스크립트 전체 사전 테스트 후 D2 빌드·설치·실행 통과. 캡처에서 홈 공연 목록 표시 확인. 로그인 화면 딥링크는 OS 열기 확인창이 떠서 화면 직접 확인 미완료.
- 남은 미확인 사항: 실제 로그인 실조작·이메일 가입 UI·카카오/Apple·이메일 소유 검증. 서버는 TERRA-006 이전 프로세스라 이메일 인증을 사용하려면 서버 갱신 필요. D01~D12: 기존 스타일·레이아웃·접근성 라벨 유지, 새로운 효과·라이브러리 없음; 로그인 화면 실측·스크린리더 미검증.
- 다음 행동: 화면 확인 후 서버 갱신 및 이메일 가입·실제 인증 연동.

### [AID-20261106-TERRA-009] 이메일 가입 화면·API 연동 착수
- 날짜·시각·시간대: 2026-11-06 15:41 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-006~008
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/src/market/api.ts, 관련 테스트. 기존 시연 계정과 서버 계약 유지.
- 내용: 사용자 지시에 따라 이메일·닉네임·비밀번호 가입과 이메일 로그인 연결을 시연 범위에서 진행. 이메일 소유 확인 및 카카오·Apple은 실제 연결하지 않으며 완료라고 표시하지 않는다.
- 실제 검증 근거: 적용 규칙·최신 소통 기록·서버 및 앱 계약·Expo/RN 공식 문서 확인. D2 부팅 확인, Git 미초기화.
- 남은 미확인 사항: 테스트·D2 Release·화면, 실행 서버 최신 코드 및 실제 인증 제공자.
- 다음 행동: 앱 API 및 가입 화면 구현 후 회귀 테스트와 D2 검증.

### [AID-20261106-TERRA-010] 이메일 가입 화면 시연 연결
- 날짜·시각·시간대: 2026-11-06 15:44 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-009
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/src/market/api.ts, mobile/__tests__/market.test.tsx, mobile/__tests__/marketLogin.test.ts
- 내용: 가입 화면에서 이메일·닉네임·비밀번호를 입력해 기존 서버 계약에 전달. 시연 모드는 메모리 내 이메일 매핑으로 가입·로그인을 처리하며 시연 표시를 유지한다. 이메일 소유 인증·재설정·카카오·Apple 로그인은 미구현.
- 실제 검증 근거: 대상 Jest 10개, 전체 Jest 96개, typecheck·lint 통과. D2 Release build·install·launch 통과(evidence/releases/20261106-154237/); 실행 후 홈 공연 목록 캡처 직접 확인. 최초 sandbox 시뮬레이터 접근 실패 후 승인 환경에서 성공.
- 남은 미확인 사항: 가입 화면 실조작·이메일 가입/로그인 실제 앱-서버 왕복·현재 3001 서버의 최신 코드 반영 여부. 실제 사용자 대상 인증·보안·소셜 공급자 연계·이메일 인증·실기기 미검증. D01~D12: 기존 토큰과 화면 구조·접근성 라벨 사용, 기존 오류·로딩 유지, 라이브러리/모션 추가 없음; 가입 화면·큰 글자·스크린리더 실측 미수행.
- 다음 행동: 실행 중 서버 소유·세션 확인 후 안전하게 최신 서버를 실행하고 앱 가입·로그인 왕복을 검증한다. 이메일 인증 및 소셜 제공자 설정은 별도 진행한다.

### [AID-20261106-TERRA-011] 이메일 인증 착수
- 날짜·시각·시간대: 2026-11-06 15:50 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-010
- 유형: 착수
- 담당 파일·수정 범위: server/src의 독립 인증번호 서비스와 Resend 발송 어댑터·테스트부터 시작. 기존 가입 API·앱 화면은 보존하며 연동 단계에서 별도 검증.
- 내용: 사용자 Resend 무료 플랜 선택. 발신 도메인·계정·키 준비 여부는 미확인. 실제 이메일 발송은 수행하지 않으며 미설정 시 명시적 오류. 코드의 만료·시도 제한·일회성 및 실패 경로를 검증한다.
- 실제 검증 근거: 공식 Resend 발송 API·도메인 안내 확인; 최신 문서와 코드 확인.
- 남은 미확인 사항: 발신 도메인 및 설정, 계정 가입과의 안전한 통합, 앱 UI, 실제 전달·기기 테스트.
- 다음 행동: 독립 서비스와 가짜 전송을 이용한 테스트 구현.

### [AID-20261106-TERRA-012] 인증번호 서비스 초안과 발신 설정 확인
- 날짜·시각·시간대: 2026-11-06 15:54 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-011
- 유형: 확인
- 담당 파일·수정 범위: server/src/email-verification.ts, server/test/email-verification.test.ts
- 내용: Resend API 발송 어댑터와 메모리 인증번호 처리 초안(10분 만료·5회 시도·60초 재발송 제한·일회성·HMAC)을 작성. 사용자는 발신 도메인이 아직 없다고 확인. 코드는 독립적이며 HTTP·가입·로그인·앱에 연결되지 않았고 기존 이메일 가입은 인증 없이 가능하다.
- 실제 검증 근거: node --test test/email-verification.test.ts test/email-identity.test.ts 6개 통과, server typecheck 통과. fake fetch·fake sender만 사용, 실제 이메일 미발송. 초기 Node strip-only 구문 실패 후 생성자 수정해 재검증.
- 남은 미확인 사항: 실제 이메일 제공자 설정·발신 도메인·실제 수신, 인증번호와 가입의 우회 없는 연결·IP별 제한·다중 프로세스 저장·앱 UX·D2. 현 메모리 구현은 재시작 시 인증번호가 사라지고 다중 인스턴스에 적합하지 않다.
- 다음 행동: Resend 계정 및 도메인 준비를 사용자와 진행하고 서버/API·가입·앱을 연결한 뒤 실발송 검증한다.

### [AID-20261106-TERRA-013] 인증번호와 가입 연동 착수
- 날짜·시각·시간대: 2026-11-06 16:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-012
- 유형: 착수
- 담당 파일·수정 범위: server/src/http.ts, main.ts, market.ts 및 관련 테스트, mobile 로그인 화면·API·테스트, 예시 설정과 문서. 기존 닉네임 계정 유지.
- 내용: 사용자 Resend API 키 생성 및 연결 지시. 이메일 발송·가입 시 인증번호 확인을 구현하되 실제 키는 사용자 로컬 입력, 개발자에게 노출하지 않는다. 메일 미설정 시 실패 처리, 테스트 발송은 가짜 전송으로 구분한다.
- 실제 검증 근거: 최신 소통 기록·기존 인증 코드와 사용자 선택 확인. 도메인 미확보.
- 남은 미확인 사항: 가입 API 우회 방지, 시험용 발송 대상 및 실제 메일, 앱 화면·D2 Release.
- 다음 행동: 서버 검증과 앱 연동을 순서대로 구현·테스트한다.

### [AID-20261106-TERRA-014] 이메일 인증 가입 연동 1차
- 날짜·시각·시간대: 2026-11-06 16:09 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-013
- 유형: 완료
- 담당 파일·수정 범위: server/src/http.ts, server/.env.example, server/README.md, server/test/market.test.ts, mobile/src/app/login.tsx, mobile/src/market/api.ts. 기존 독립 인증 서비스 이용.
- 내용: POST /auth/email/send 추가, 이메일 가입에 일회 인증번호 필수, 앱의 번호 요청·입력·가입 연결. 기존 이메일 없는 닉네임 가입 및 기존 시연 모드는 유지(인증된 이메일 계정이 아님). 미설정 발송은 EMAIL_NOT_CONFIGURED. 인증 상태는 단일 서버 메모리에만 유지.
- 실제 검증 근거: 서버 전체 테스트 88개·typecheck, 앱 전체 96개·lint·typecheck 통과. 가짜 메일 발송 HTTP 테스트에서 미입력·오입력·다른 이메일·재사용 거부와 정상 가입 확인. D2 Release build·install·launch 통과(evidence/releases/20261106-160740/), 로그인 화면 캡처 확인. 실제 Resend 키·실제 발송·가입 화면 실조작 미수행.
- 남은 미확인 사항: 사용자 로컬 키 및 발신 주소 설정, 기존 3001 서버 최신 코드 반영, Resend 시험 발송·수신 및 시뮬레이터 가입 왕복. 인증 메일 도메인 미확보, 다중 서버·운영 보안 미검증, 기존 닉네임 시연 가입은 인증 없이 가능. D01~D12: 기존 토큰·필드와 모드 표시 유지, 오류 표시·접근성 라벨 포함, 새 라이브러리·모션 없음; 가입 화면 실제 키보드·큰 글자·스크린리더 미검증.
- 다음 행동: 키를 채팅에 노출하지 않고 서버 환경에 설정하고 안전하게 서버를 갱신한 뒤 계정 본인 이메일 수신과 번호 입력을 검증한다.

### [AID-20261106-TERRA-015] 이메일 발송 환경 및 로컬 서버 갱신
- 날짜·시각·시간대: 2026-11-06 16:13 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·앱 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-014
- 유형: 확인
- 담당 파일·수정 범위: server/.env 발신 주소 한 줄, Communicate.md. 키 값 출력·기록 없음.
- 내용: 사용자가 키 설정 완료를 알림. 설정 여부만 확인한 결과 키는 존재, 발신 주소가 없어 테스트 주소 onboarding@resend.dev를 추가. 이 세션이 시작했던 서버를 정상 종료하고 동일 주소로 최신 서버를 재실행했다. 메모리 세션은 재시작 시 만료된다.
- 실제 검증 근거: /health 정상 및 /auth/email/send에 유효하지 않은 주소 입력 시 BAD_REQUEST 반환. 실제 메일은 아직 발송하지 않았다.
- 남은 미확인 사항: 키의 유효성·Resend 계정 본인 이메일 수신·인증번호 가입 왕복. 테스트 발신 주소는 수신자 제한이 있다. 발신 도메인과 실제 사용자 대상 운영 검증 없음.
- 다음 행동: 사용자가 D2에서 Resend 계정 이메일로 인증번호 요청·수신·가입을 확인한다. 인증번호나 이메일 주소는 협업 기록에 남기지 않는다.

### [AID-20261106-TERRA-016] 미로그인 시작 화면 변경 착수
- 날짜·시각·시간대: 2026-11-06 16:15 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-014~015
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/(tabs)/index.tsx, 관련 앱 테스트; D2 Release 검증.
- 내용: 사용자 지시에 따라 앱 첫 진입 시 세션 복원을 기다리고 미로그인이면 로그인·가입 화면 표시, 유효한 세션이면 기존 홈 유지. 기존 인증번호 연결 보존.
- 실제 검증 근거: 기존 D2 Release 설치 기록과 앱 시작 라우트 확인. 로그인 전 홈 진입은 현재 구현된 동작이다.
- 남은 미확인 사항: 로그인·가입 이동 및 세션 복원 테스트, D2 실행 화면.
- 다음 행동: 시작 분기와 회귀 테스트를 구현·검증한다.

### [AID-20261106-TERRA-017] 미로그인 시작 화면 반영
- 날짜·시각·시간대: 2026-11-06 16:18 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-016
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/(tabs)/index.tsx, mobile/__tests__/market.test.tsx.
- 내용: 앱 홈에서 세션 복원을 기다린 후 미로그인은 로그인·가입 화면으로 전환하고 유효한 로그인은 홈을 유지. 로그인 전 홈 데이터 요청을 보내지 않는다.
- 실제 검증 근거: 앱 전체 96개 테스트·typecheck·lint 통과, D2 Release build·install·launch 통과(evidence/releases/20261106-161638/). 실제 D2 캡처에서 로그인·가입 탭 및 이메일 입력란 확인.
- 남은 미확인 사항: 인증 메일의 실제 발송·수신·가입 실조작, 실기기·스크린리더. D01~D12: 기존 로그인 스타일 및 접근성 라벨 유지, 추가 모션·의존성 없음, 세션 복원 중 대기; 실제 큰 글자 검증 미실시.
- 다음 행동: 사용자 본인 Resend 계정 이메일로 인증번호 수신·가입 확인.

### [AID-20261106-TERRA-018] 시작 로그인 화면 정돈 착수
- 날짜·시각·시간대: 2026-11-06 16:19 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-017
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx 및 관련 테스트, D2 Release.
- 내용: 사용자 피드백에 따라 시작 로그인 화면 상단 중앙에 기존 티켓레이더 로고를 배치하고 부자연스러운 뒤로가기 버튼을 제거한다. 인증·가입 계약과 기존 로고 자산을 유지한다.
- 실제 검증 근거: 사용자 화면과 기존 BrandMark·TScreen 구조 확인. 해당 파일의 다른 담당자 신규 착수 기록 없음.
- 남은 미확인 사항: 테스트 및 D2 실제 화면.
- 다음 행동: 구현 후 테스트·D2 Release·화면을 확인한다.

### [AID-20261106-TERRA-019] 로그인 화면 로고·문구 반영
- 날짜·시각·시간대: 2026-11-06 16:23 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-018
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/__tests__/market.test.tsx.
- 내용: 로그인 상단에 기존 로고를 중앙 배치하고 뒤로가기 버튼을 제거했다. 사용자 추가 제안에 따라 로그인 문구를 '오늘은 어떤 공연을 보실 건가요?'로 변경했다. 가입·인증 로직은 변경하지 않았다.
- 실제 검증 근거: 앱 전체 테스트 96개, typecheck·lint 통과. D2 Release build·install·launch 통과(evidence/releases/20261106-162208/), 로그인 시작 화면 실제 캡처에서 로고·문구·뒤로가기 제거 확인.
- 남은 미확인 사항: 큰 글자·스크린리더 실측 및 인증 메일 실제 발송·가입. D01~D12: 기존 로고·토큰·접근성 라벨·인증 모드 유지, 새 모션·의존성 없음.
- 다음 행동: 사용자 Resend 계정 이메일로 인증번호 발송 및 가입 흐름을 확인한다.

### [AID-20261106-TERRA-020] 로그인 레이아웃 위치 조정 착수
- 날짜·시각·시간대: 2026-11-06 16:25 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-019
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx, D2 Release.
- 내용: 로고·제목·로그인 양식을 화면 아래로 조금 이동하고 하단 버튼의 안전 영역은 유지한다.
- 실제 검증 근거: 기존 D2 화면 및 TScreen 안전 영역·스크롤 구조 확인.
- 남은 미확인 사항: D2 화면·회귀 테스트.
- 다음 행동: 위치 수정 후 빌드·화면 확인.

### [AID-20261106-TERRA-021] 로그인 레이아웃 위치 조정 완료
- 날짜·시각·시간대: 2026-11-06 16:27 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-020
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx.
- 내용: 상단 여백을 24pt 늘려 로고·제목·입력 영역을 아래로 이동. 하단 버튼과 안전 영역은 유지.
- 실제 검증 근거: 앱 테스트 96개·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261106-162618/). D2 캡처에서 로그인 화면 배치 확인.
- 남은 미확인 사항: 가입 상태·큰 글자·키보드·실기기 화면. D01~D12: 기존 로고·스타일·라벨·스크롤·인증 유지, 추가 라이브러리·모션 없음.
- 다음 행동: 사용자 화면 피드백 및 이메일 인증 실조작 확인.

### [AID-20261106-TERRA-022] 로그인·가입 모션 및 공통 원칙 착수
- 날짜·시각·시간대: 2026-11-06 16:29 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-021
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx, AGENTS.md, 관련 검증 기록 및 D2 Release.
- 내용: 사용자 요청으로 로그인·가입 전환에 부드러운 모션을 적용하고 앞으로 작업하는 움직임에도 일관된 전환을 적용한다. 동작 줄이기·즉각 입력·오류 복구 원칙은 유지한다.
- 실제 검증 근거: 기존 모션 부품 및 Expo/Reanimated 공식 문서 확인. 기존 화면·인증 상태 보존.
- 남은 미확인 사항: 테스트·D2에서 전환 및 동작 줄이기 확인.
- 다음 행동: 기존 모션 라이브러리로 적용하고 검증한다.

### [AID-20261106-TERRA-023] 로그인·가입 전환 모션 반영
- 날짜·시각·시간대: 2026-11-06 16:32 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-022
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, AGENTS.md.
- 내용: 로그인·가입 선택 시 제목과 입력 영역 220ms 페이드, 필드 레이아웃 전환에 시스템 동작 줄이기를 적용. 화면 상태와 입력은 애니메이션 완료에 의존하지 않음. 사용자 지시로 향후 작업의 부드러운 모션·동작 줄이기 원칙을 AGENTS.md에 추가.
- 실제 검증 근거: 앱 전체 테스트 96개·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261106-163053/). D2 캡처로 가입 화면의 렌더 확인.
- 남은 미확인 사항: 모션의 실제 재생·속도·동작 줄이기 실조작, 기존 전체 화면에 대한 일괄 적용. D01~D12: 기존 토큰·라벨·인증 유지, ReduceMotion.System, 모션 외 진입 차단 없음, 기존 라이브러리 사용.
- 다음 행동: 사용자가 D2에서 전환을 보고 피드백, 웹 모션의 앱 적용 범위는 별도 결정.

### [AID-20261106-TERRA-024] 가입 버튼 비활성 문제 조사 착수
- 날짜·시각·시간대: 2026-11-06 16:38 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-023
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx 및 관련 테스트, D2 Release.
- 내용: 인증번호 입력 후 가입 버튼이 비활성이라는 사용자 제보. 기존 조건은 닉네임·비밀번호·인증 이메일·6자리 번호를 모두 요구하지만 부족한 항목을 설명하지 않음. 제보자의 실제 입력값·원인은 미확인.
- 실제 검증 근거: 현재 버튼 조건과 사용자 제보 확인. 개인정보·인증번호 수집 안 함.
- 남은 미확인 사항: 정확한 재현 및 실제 입력 조작.
- 다음 행동: 입력 조건 안내·공백 처리·회귀 테스트 및 D2 검증.

### [AID-20261106-TERRA-025] 가입 입력 안내·D2 반영
- 날짜·시각·시간대: 2026-11-06 16:41 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-024
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/__tests__/market.test.tsx.
- 내용: 가입 버튼 클릭 시 미입력 항목을 안내하고 인증번호 공백을 제거한다. 서버 오류 후 비밀번호를 임의로 지우지 않는다. 실제 사용자 사례의 정확한 원인은 확인되지 않았다.
- 실제 검증 근거: 앱 전체 테스트 97개·typecheck·lint, D2 Release 빌드·설치·실행 통과(evidence/releases/20261106-163942/); 가입 화면 캡처 확인. 회귀 테스트는 가짜 API로 확인.
- 남은 미확인 사항: 실제 인증번호 가입 완료·키보드·실기기. D01~D12: 기존 입력·오류·모션·라벨 유지, 새 라이브러리 없음, 실제 큰 글자·스크린리더 미검증.
- 다음 행동: 사용자 요청에 따른 중복 검사 및 가입 완료 안내를 구현한다.

### [AID-20261106-TERRA-026] 가입 중복 검사·환영 안내 착수
- 날짜·시각·시간대: 2026-11-06 16:41 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-025
- 유형: 착수
- 담당 파일·수정 범위: server/src/market.ts·http.ts·관련 테스트, mobile/src/market/api.ts·login.tsx·관련 테스트 및 D2 Release.
- 내용: 이메일·닉네임 중복 확인 및 가입 성공 환영 표시를 추가. 서버 최종 중복 검사를 유지하고 인증번호가 중복 오류로 소모되지 않도록 사전 검증한다. 공개 서비스에서 계정 존재 노출 위험과 전역 호출 제한은 추후 별도 검토.
- 실제 검증 근거: 서버 최종 중복 검사 및 인증번호 선소모 코드 확인. 사용자 요청 확인.
- 남은 미확인 사항: 테스트·실제 사용자 메일 수신·D2.
- 다음 행동: 서버·앱 구현 후 회귀 테스트와 D2 확인.

### [AID-20261106-TERRA-027] 가입 중복 확인·환영 안내 1차
- 날짜·시각·시간대: 2026-11-06 16:47 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-026
- 유형: 완료
- 담당 파일·수정 범위: server/src/market.ts·http.ts·test/market.test.ts, mobile/src/market/api.ts·app/login.tsx·__tests__/market.test.tsx, TODO.md.
- 내용: 이메일·닉네임 중복 확인 버튼과 서버 확인 API, 가입 성공 환영 대화상자 추가. 최종 가입에서 중복을 재검사하고 중복 등 입력 오류가 인증번호를 소모하기 전 처리한다. 최초 로그인 튜토리얼 사용자 제안(인사→공연 질문→카테고리 추천→목록·건너뛰기)을 TODO에 기록했으며 구현하지 않았다.
- 실제 검증 근거: 서버 전체 테스트 88개, 앱 전체 97개·typecheck·lint 통과. fake API 앱 테스트에서 중복 응답·환영 호출 확인, 서버 HTTP 테스트에서 중복과 인증번호 보존 확인. D2 Release build·install·launch 통과(evidence/releases/20261106-164532/). 서버 재시작 후 신규 API의 잘못된 입력 응답 확인.
- 남은 미확인 사항: 사용자 실제 가입·중복 UI·환영 대화상자 D2 실조작, 실제 카카오/Apple 인증, 튜토리얼. 서버 재시작으로 이전 인증번호·세션 만료. 중복 확인 API는 계정 존재가 노출될 수 있으므로 공개 운영 전 별도 보안 검토 필요. D01~D12: 기존 토큰·접근성 라벨·오류·모션 유지, 새 라이브러리 없음; 큰 글자·스크린리더·실기기 미검증.
- 다음 행동: 사용자 가입 재시도 및 첫 로그인 튜토리얼 구현·검증.

### [AID-20261106-TERRA-028] 로그인·로그아웃 안내 모션 착수
- 날짜·시각·시간대: 2026-11-06 16:49 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-027
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/market/MarketContext.tsx, mobile/src/app/login.tsx, 관련 테스트 및 D2 Release.
- 내용: 로그인·기기 로그아웃 완료를 짧은 안내와 부드러운 모션으로 표시. 가입 환영 팝업과 중복하지 않으며 동작 줄이기 설정을 따른다.
- 실제 검증 근거: 현재 세션·로그아웃 구현 및 기존 모션 부품 확인.
- 남은 미확인 사항: 테스트·D2 실제 전환, 오프라인 로그아웃 의미.
- 다음 행동: 공통 안내 구현 후 테스트와 D2 검증.

### [AID-20261106-TERRA-029] 로그인·로그아웃 안내 1차
- 날짜·시각·시간대: 2026-11-06 16:56 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-028
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/market/MarketContext.tsx, mobile/src/app/login.tsx, mobile/__tests__/market.test.tsx.
- 내용: 로그인 시 '로그인했어요', 로그아웃 시 '이 기기에서 로그아웃했어요' 안내를 2.6초 표시하고 페이드 전환. 가입은 기존 환영 안내만 표시. 서버 로그아웃 실패 시에도 로컬 정리하므로 기기 기준으로 표현.
- 실제 검증 근거: 앱 전체 테스트 99개·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261106-165459/). 가짜 API 테스트에서 로그인·로그아웃 안내 확인. D2에서 화면 렌더 확인, 사용자 계정 조작 없이 실제 토스트 재생은 미검증.
- 남은 미확인 사항: 실제 로그인·로그아웃 토스트 재생과 동작 줄이기·큰 글자·스크린리더 실조작. D01~D12: 기존 토큰·인증 로직 유지, ReduceMotion.System·접근성 알림, 입력 차단 없음, 새 의존성 없음.
- 다음 행동: 사용자의 실제 로그인·로그아웃 피드백 확인 및 별도 요청된 첫 로그인 튜토리얼 진행.

### [AID-20261106-TERRA-030] 가입 확인 버튼·상태 UI 개선 착수
- 날짜·시각·시간대: 2026-11-06 16:57 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-027
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx 및 관련 테스트, D2 Release.
- 내용: 이메일 중복 확인·인증번호 요청을 구분되는 버튼으로 정리하고 확인 결과의 시각적 피드백·부드러운 전환을 개선한다. 닉네임 중복 확인에도 같은 체계를 적용한다. 실제 입력값·개인정보는 기록하지 않는다.
- 실제 검증 근거: 사용자 스크린샷 및 기존 화면·토큰·모션 확인, Apple HIG 버튼 페이지와 Expo SDK 자료 확인.
- 남은 미확인 사항: 접근성·동작 줄이기 및 D2 실제 화면.
- 다음 행동: UI 개선 후 테스트·D2 Release·화면 확인.

### [AID-20261106-TERRA-031] 가입 확인 버튼·상태 UI 개선
- 날짜·시각·시간대: 2026-11-06 17:03 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-030
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx.
- 내용: 이메일·닉네임 중복 확인과 인증번호 요청을 구분되는 버튼으로 변경하고 결과를 입력란 가까이에 표시하며 페이드 적용. 사용자가 첫 버전의 두꺼운 버튼을 선호하지 않아 시각 높이를 34pt로 낮추고 터치 영역 48pt 유지.
- 실제 검증 근거: 앱 전체 테스트 99개·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261106-170206/). 로그인 화면 렌더 확인, 가입 화면 실제 버튼 배치·모션은 사용자 전환 대기라 직접 확인하지 못함.
- 남은 미확인 사항: D2 가입 화면 최종 크기와 동작·동작 줄이기·큰 글자·스크린리더·실기기. D01~D12: 기존 토큰·상태 라벨·인증 유지, 시스템 동작 줄이기·48pt 터치, 새 의존성 없음.
- 다음 행동: 사용자의 D2 가입 화면 피드백 확인 및 필요시 조정.

### [AID-20261106-TERRA-032] Gmail SMTP 발송 추가 착수
- 날짜·시각·시간대: 2026-11-06 17:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-014~015
- 유형: 착수
- 담당 파일·수정 범위: server/src/email-verification.ts·http.ts, server/package.json·package-lock.json, server/.env.example·README.md, server/test/email-verification.test.ts.
- 내용: 사용자 Gmail SMTP 전환 지시. TLS와 서버 환경변수로 발송하고 Resend 선택지를 유지한다. 설정이 없거나 발송이 실패하면 명시적 오류로 처리하며 자동 대체하지 않는다. 계정·앱 비밀번호를 채팅이나 기록에 남기지 않는다.
- 실제 검증 근거: 기존 인증 코드·Nodemailer SMTP 및 Google 앱 비밀번호 공식 안내 확인.
- 남은 미확인 사항: Gmail 설정, 실제 발송·수신 및 D2 가입, 다른 담당자의 수신 확인.
- 다음 행동: 어댑터·가짜 전송 테스트를 준비한 뒤 사용자가 직접 자격정보를 설정하도록 안내한다.

### [AID-20261106-TERRA-033] Gmail SMTP 어댑터 준비
- 날짜·시각·시간대: 2026-11-06 17:12 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-032
- 유형: 완료
- 담당 파일·수정 범위: server/src/email-verification.ts·http.ts, server/package.json·package-lock.json, server/.env.example·README.md, server/test/email-verification.test.ts.
- 내용: nodemailer 기반 Gmail TLS 465 어댑터 및 EMAIL_PROVIDER 선택 추가. 기본 Resend는 보존하고 gmail 선택 시 자격정보 누락에 자동 대체하지 않는다. 키·계정 정보는 서버 환경에만 설정한다.
- 실제 검증 근거: 가짜 SMTP 전송 검증 포함 서버 전체 89개 테스트·typecheck 통과. npm 설치 후 audit 결과 취약점 0. Google 실제 인증·메일 발송·수신은 하지 않았다.
- 남은 미확인 사항: Google 2단계 인증·앱 비밀번호·로컬 서버 환경 설정, 서버 재시작, 실발송·D2 가입 검증, Google의 발송 제한.
- 다음 행동: 사용자가 자격정보를 채팅에 노출하지 않고 직접 설정하면 로컬 서버 갱신 및 본인 수신 확인.

### [AID-20261106-WEB-016] 프로젝트 전체 검증(읽기 전용)
- 날짜·시각·시간대: 2026-11-06 17:40 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 범위: 사용자 지시("프로젝트 검증 한번") → 소스·테스트·dist·evidence 수정 없음. 웹 빌드는 저장소 밖 임시 폴더, 브라우저는 WebKit만(Chrome·Chromium 1248 미설치).
- 통과: server typecheck·node test 88/88 · shared price-cap 2/2 · web tsc·vitest 48/48·oxlint 경고 3·임시 빌드 · mobile typecheck·lint·Jest 99/99·check:contract 11/11 · 루트 Python automation 12·integration 16 + check_api demo PASS(README 명령 기준).
- 웹 화면(WebKit 360/390/768/1280/1440): 소개 → 마켓 → '판매글 안심 확인' → 판매글 → 확인 → 결과(+76,000원)까지 도달, 12px 미만·넘침 0, 페이지 오류·콘솔 오류 0. 마켓 필터·검색·상세·구매 확인(결제 버튼 비활성, 시연 종료 안내)·양도 등록 정상, 구매가≠양도가 등록 차단 확인.
- 발견:
  ① 공개 사이트가 11/3 버전(index-KzdeCbs1)으로, 로컬의 마켓 개편(index-CTjRUOTt)이 아직 배포되지 않음.
  ② 웹 e2e(flow.spec·landing.spec)가 '서비스 체험하러 가기' 뒤 '1. 공연 선택'을 기대하나 지금은 마켓 화면으로 이동 → e2e 갱신 필요(실행은 evidence 기록 방지로 안 함, 코드·화면으로 판단).
  ③ 웹 시연 양도 등록에서 원구매가=양도가 900,000원(VIP 공식 154,000원) 같은 부풀린 가격이 그대로 등록됨. shared/price-cap.ts가 있으나 서버·웹·앱 미연결(TERRA-002 기록과 일치) — '구매가 그대로' 문구와 어긋남.
  ④ 서버 이메일·닉네임 중복 확인 API는 계정 존재 노출 가능(TERRA-027 기록), 공개 전 호출 제한 검토 필요.
- 미수행: 웹 e2e 전체, 실제 서버 연결 웹 흐름, D2/실기기, 실제 이메일 발송, Chromium·실제 Safari.

### [AID-20261106-TERRA-034] Gmail SMTP 설정·연결 확인
- 날짜·시각·시간대: 2026-11-06 17:19 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-033
- 유형: 확인
- 담당 파일·수정 범위: Communicate.md. 사용자 설정값은 출력·기록하지 않음.
- 내용: 사용자가 Gmail 설정 완료를 알림. 공급자·주소·앱 비밀번호 형식만 확인하고 기존 이 세션 서버를 종료한 뒤 Gmail 네트워크 접근이 가능한 환경에서 재실행했다. 기존 메모리 세션·인증번호는 서버 재시작으로 만료된다.
- 실제 검증 근거: 메일을 보내지 않는 SMTP 연결·인증 확인 성공, 로컬 /health 정상. 제한된 환경에서는 DNS 실패 후 승인된 환경에서 재검증했다.
- 남은 미확인 사항: 실제 메일 발송·수신 및 D2 가입 실조작, 여러 수신처 전달 상태.
- 다음 행동: 사용자가 D2 가입 화면에서 인증번호를 새로 요청하고 수신을 확인한다.

### [AID-20261106-WEB-017] 공개 주소 변경 반영·WEB-016 ① 정정
- 날짜·시각·시간대: 2026-11-06 17:50 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 유형: 정정·검증(읽기 전용, 코드 수정 없음)
- 내용: 사용자 안내로 공개 주소가 https://ticketradar.month32.workers.dev/ 로 변경됨. 이 주소는 로컬 빌드와 같은 index-CTjRUOTt.js / index-lMAD_rcD.css를 제공 → WEB-016 ①('마켓 개편 미배포')은 이전 주소(daoule-6b5, 11/3 KzdeCbs1)만 본 오판으로 정정. wrangler 활성 프로필 month32 확인(이후 deploy:demo는 새 주소로 감).
- 검증: 새 주소에서 WebKit 360/390/768/1280/1440 소개→마켓→판매글 안심 확인→판매글→확인→결과 흐름 통과, 12px 미만·넘침 0, ticket-intro.glb 200.
- 남은 일: 이전 주소는 옛 버전을 계속 제공 중(내릴지 사용자 결정 필요), 문서·verify 기록의 옛 주소 갱신. WEB-016 ②~④는 유효.

### [AID-20261106-APP-029] 사용자 요청 "앱 검증·문제점 발견" — 읽기 전용 검증 결과(코드 수정 없음)
- 날짜·시각: 2026-11-06 17:25 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·Terra(login·MarketContext 작업 중)·Astra
- 방식: Terra가 login.tsx 등을 작업 중이라 수정하지 않고 검사만. 자동 검사 + 독립 검토 에이전트(파일 수정 금지) + D2 Release 실조작.
- 자동 검사: server 89/89·tsc, mobile Jest 99/99·tsc·lint 통과, 엔진 복사본 해시 일치. D2 Release(시연) build·install·launch 통과(evidence/releases/20261106-171508/).
- **실조작: XCUITest 4개 모두 첫 화면에서 실패** — 앱 시작 화면이 로그인 화면으로 바뀌어(TERRA-018~) 로그인 없이는 홈 진입 불가. 테스트도 갱신 필요(이메일 필수 가입 반영).
- 독립 검토 주요 발견(상위): ①결제 후 뒤로 가면 매물 화면에 '구매하기'가 다시 켜짐(item 화면이 처음 한 번만 불러옴) ②실서버 모드에서 일시적 네트워크 오류에도 로그아웃·저장 토큰 삭제(MarketContext가 오류 종류 구분 안 함) ③판매 1단계가 오류 문구에 갇힘 ④즐겨찾기·내 거래·알림 탭 오류가 다시 들어와도 안 지워지고 재시도 없음 ⑤주문 화면 뒤로가 스택에 탭을 하나 더 쌓을 수 있음 ⑥구매자의 '문제가 생겼나요?'가 주최 측 전용 로그인으로 감 ⑦매물·결제·거래 화면에서 '[가상]' 표시가 지워짐, '임시 이미지' 안내가 홈·공연 상세에만 ⑧알림 스위치·시연 버튼 오류 처리 없음 ⑨'거래 취소'·'티켓 받았어요' 확인 단계 없음 ⑩하트 처리 중 재탭 가능 ⑪빠른 두 번 탭 중복 등록 가능성 ⑫판매 후 일부 입력값 잔존 ⑬44pt 미만 터치 영역·읽지 않은 알림 색만으로 구분 ⑭형광펜·진행막대 width% 애니메이션(경미). 시연 결제 표시·보증 아님 문구는 정상.
- 서버(Terra 신규): 이메일 인증 10분 만료·5회 시도·60초 재발송·IP당 분당 5회 — 양호. 중복 확인 API로 가입 이메일 존재 여부 노출 가능(Terra도 기록).
- 다음: 수정 범위·로그인 필수 여부를 사용자 결정 후 진행(login 관련은 Terra와 파일 충돌 주의).

### [AID-20261106-WEB-018] 옛 공개 주소 삭제 (사용자 지시)
- 날짜·시각·시간대: 2026-11-06 17:58 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra·Astra. 수신 확인 없음.
- 지시: 사용자 "그건 내리자 옛날링크는".
- 수행: wrangler 4.143.0 `delete --name ticketradar --profile default --force`(default 프로필 = 옛 계정, 마지막 배포 2026-11-03 01:33Z, 11/3 index-KzdeCbs1 버전). month32 프로필·새 Worker는 건드리지 않음. 코드 수정 없음.
- 검증: https://ticketradar.daoule-6b5.workers.dev/ → 404, https://ticketradar.month32.workers.dev/ → 200 index-CTjRUOTt.js(최신) 유지.
- 남은 일: 문서·evidence 안의 옛 주소 언급은 그대로(기록 성격). 앞으로 배포·검증 주소는 month32.

### [AID-20261106-TERRA-035] D2 인증번호 버튼 누락 조사
- 날짜·시각·시간대: 2026-11-06 17:33 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: APP-029, TERRA-034
- 유형: 착수
- 담당 파일·수정 범위: D2 설치·실행 및 검증 기록. 앱 코드 변경 없음.
- 내용: 인증번호 버튼 누락 제보. 현재 D2 화면과 latest-release 기록은 앱 담당의 APP-029 fixture-demo 빌드로 확인되며 이 모드에서는 메일 발송 버튼을 표시하지 않는다. 사용자 요청에 따라 같은 D2에 로컬 서버 연결 Release를 재설치한다.
- 실제 검증 근거: D2 화면에 시연 모드 문구, latest-release data_mode fixture-demo, 앱 코드의 live 조건 및 로컬 서버 health 확인. 사용자 입력 정보는 기록하지 않음.
- 남은 미확인 사항: 재설치 후 live 표시·버튼 및 실제 이메일 발송.
- 다음 행동: 서버 연결 Release 빌드·설치 후 화면 확인.

### [AID-20261106-TERRA-036] D2 서버 연결 모드 복원
- 날짜·시각·시간대: 2026-11-06 17:36 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-035
- 유형: 완료
- 담당 파일·수정 범위: D2 Release 설치·검증 기록. 코드 변경 없음.
- 내용: APP-029의 fixture-demo 빌드가 D2에 설치되어 있던 상태에서 사용자 요청에 따라 서버 연결 모드로 재설치했다.
- 실제 검증 근거: 앱 99개 테스트·typecheck·lint 및 D2 Release build·install·launch 통과(evidence/releases/20261106-173355/). 사용자 조작 후 D2 가입 화면에서 '인증번호 다시 받기'와 인증번호 입력란 표시 확인. 입력된 개인 정보는 기록하지 않음.
- 남은 미확인 사항: 실제 메일함 수신·번호 일치·가입 완료. 다른 담당자는 D2에 fixture 빌드를 설치할 때 현재 서버 연결 빌드를 덮어쓰는 점 유의.
- 다음 행동: 사용자가 메일 수신 및 가입 완료를 확인한다.

### [AID-20261106-TERRA-037] 가입 유효성·비밀번호 정책 착수
- 날짜·시각·시간대: 2026-11-06 17:38 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-036
- 유형: 착수
- 담당 파일·수정 범위: 공통 비밀번호 규칙, server/src/market.ts 및 관련 테스트, mobile/src/app/login.tsx·관련 테스트, 관련 문서·D2 Release.
- 내용: 가입이 진행되지 않는 제보 조사. 가입 조건 오류가 스크롤 아래에 숨을 가능성을 확인하여 버튼 가까이에 안내한다. 사용자 요청에 따라 이메일·닉네임 중복 확인을 필수로 하고 신규 가입 비밀번호에 영문 대문자·소문자·특수문자 각 1개 이상 및 8자 이상을 적용한다. 기존 계정 로그인은 보존한다. 사용자 입력값·인증번호는 기록하지 않는다.
- 실제 검증 근거: 앱 화면과 코드·기존 서버 중복 검사 확인. 정확한 서버 응답 및 사용자 입력 조건은 별도 확인 필요.
- 남은 미확인 사항: 재현 테스트·실제 인증 가입·D2 화면, 사용자 입력값 미수집.
- 다음 행동: 공통 규칙·화면 검증·서버 검증 및 회귀 테스트 후 D2 확인.

### [AID-20261106-WEB-019] 보안 점검(읽기 전용)
- 날짜·시각·시간대: 2026-11-06 18:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: 사용자·Terra(서버)·Astra. 수신 확인 없음. 코드 수정 없음, .env 값은 열람·출력하지 않음(변수명만 확인).
- 양호: 키·비밀은 server/.env(권한 600)에만, 저장소·웹 배포 번들·문서에서 API 키 패턴 0건. 비밀번호 scrypt+salt·timingSafeEqual·계정 유무와 무관한 같은 계산, 세션 토큰 32바이트 난수, 인증번호 HMAC 저장·10분 만료·5회 시도 제한·주소별 60초 재발송 간격, 요청 16KB 제한, CORS 허용 목록, 서버 기본 127.0.0.1, X-Forwarded-For는 TRUST_PROXY일 때만, 앱 토큰은 SecureStore(이 기기·잠금 해제 시), iOS ATS 임의 HTTP 차단, server/var 권한 700/600, 공개 웹은 fixture 정적 사이트(서버·키 없음).
- 주의(공개 운영 전): ① Gmail 앱 비밀번호 사용 — 유출 시 해당 Gmail 전체 접근 가능, 발송 전용 계정 또는 Resend 권장 ② 인증메일: 주소당 하루 상한·전체 일일 상한 없음(1분 1통 반복 가능) → 남의 메일함 괴롭힘·Gmail 일일 발송 한도 소진 ③ /auth/availability로 이메일 가입 여부 확인 가능(IP당 분 20회, 여러 IP면 우회) ④ 로그인 무차별 대입: IP별 분 20회만, 계정별 잠금 없음 ⑤ 호출 제한·세션·인증번호가 메모리 저장 → 재시작 시 초기화, 서버 여러 대 불가 ⑥ 시연 양도 등록에 정가 상한 미적용(WEB-016 ③) ⑦ 공개 웹 보안 헤더(CSP 등) 없음 — 정적 fixture라 위험 낮음.
- 다음: 공개 서버 운영을 결정하면 ①②③④ 우선 처리(서버 담당).

### [AID-20261106-TERRA-038] 가입 입력 안내·중복 확인·비밀번호 규칙
- 날짜·시각·시간대: 2026-11-06 17:43 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-037
- 유형: 완료
- 담당 파일·수정 범위: shared/password-policy.ts, server/src/market.ts·server/test/market.test.ts·server/test/password-policy.test.ts, mobile/src/app/login.tsx·mobile/src/market/api.ts·mobile/__tests__/market.test.tsx, SPEC.md.
- 내용: 가입 시 이메일·닉네임 중복 확인을 모두 요구하고 값 변경 시 해당 확인을 무효화. 서버는 최종 중복을 재검사한다. 신규 비밀번호는 8~200자·영문 대문자·소문자·특수문자 각 1개 이상이며 기존 로그인은 보존. 오류를 고정 버튼 위로 이동해 스크롤에 가려지지 않게 함. 사용자 입력값·인증번호 미기록.
- 실제 검증 근거: 서버 전체 91개·typecheck, 앱 전체 100개·typecheck·lint 통과; 가입 중복 확인·변경·비밀번호 사례 테스트. D2 Release build·install·launch 통과(evidence/releases/20261106-174157/), 시작 화면 확인. 로컬 서버 갱신 후 약한 신규 비밀번호를 BAD_REQUEST로 거부 확인. 기존 임시 인증번호는 서버 재시작으로 만료.
- 남은 미확인 사항: 사용자 실제 이메일 인증 및 가입 완료·로그인, 가입 화면 실제 오류 위치·큰 글자·스크린리더·실기기. 공개 운영 전 WEB-019 보안 검토 미해결. D01~D12: 기존 모션·토큰·라벨·인증 흐름 유지, 오류 라이브 영역, 새 UI 라이브러리 없음.
- 다음 행동: 사용자가 새 인증번호로 가입·로그인을 재시도하고 오류가 남으면 정확한 조건을 확인한다.

### [AID-20261106-APP-030] 사용자 요청 "보안적으로 더 신경쓸 부분" — 읽기 전용 보안 점검(코드 수정 없음)
- 날짜·시각: 2026-11-06 17:35 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: 사용자·**Terra(인증·서버)**·Astra
- 확인 방법: 비밀키 형태 저장소 검색(값 미출력), .env 권한·변수 이름, 서버 바인딩·CORS, 앱 ATS·로그·개발용 딥링크, 저장 파일 필드, 인증 코드 경로, npm audit.
- **[높음·확인] 이메일 인증 우회**: server/src/http.ts `/auth/signup` 이 요청 본문에 `email` 필드가 있을 때만 인증번호를 검사 → `{name,password}`만 보내면 인증 없이 가입됨. 이메일 인증을 필수로 하려면 실서버 모드에서 email·verificationCode 필수화 필요(Terra 담당 파일).
- **[높음] 노출된 키**: 사용자가 대화창에 붙여넣은 Gemini 키가 세션 기록 1개 파일에 남아 있음 → 재발급 권장(TODO 사용자 결정 항목). 저장소 코드·문서·증거 파일에서는 키 형태 문자열 없음.
- [중간] 가입 이메일 존재 노출(/auth/availability, IP당 분당 20회) — 공개 전 제거 또는 가입 단계에서만 결과 노출.
- [중간] 평문 HTTP: 서버 127.0.0.1 바인딩이라 로컬은 안전하나, 실기기·외부 시연을 위해 LAN/인터넷에 열면 비밀번호·토큰이 평문 전송 → HTTPS 터널(+TRUST_PROXY=1) 필요.
- [중간] 계정 단위 로그인 시도 제한 없음(IP당 분당 10회만), 비밀번호 규칙 8자 이상만. 세션 7일·회전/일괄 해제 없음(서버 재시작 시 전원 로그아웃).
- [중간] 인증 메일 남용: 누구나 임의 주소로 인증 메일 발송 가능(IP당 분당 5회·주소당 60초) → Gmail 발송 계정 평판·한도 위험, 전역 상한 필요.
- [낮음] 이메일 평문 저장(server/var/market.json, 권한 600). 비밀번호는 scrypt 해시만 저장(확인). 호출 제한은 프로세스 메모리(재시작 시 초기화).
- [낮음] mobile npm audit: 중간 24·낮음 1(deepmerge·glob·minimatch 등 빌드 도구 의존성 중심, 앱 실행 코드 영향은 미확인). server audit 0건.
- 양호 확인: server/.env 권한 600·Git 제외 규칙, 앱 ATS 임의 평문 차단(로컬 네트워크만 허용), 토큰·비밀번호 로그 출력 없음, 개발용 딥링크는 `__DEV__` 가드, 토큰은 키체인(이 기기 전용), 주최 측 코드 해시 비교·2시간 세션, 이메일 인증번호 HMAC(실행마다 무작위 키)·10분·5회·60초, 요청 본문 16KB 제한, AI 응답 원문 근거 검증.

### [AID-20261106-APP-031] 착수: 보안 우선 조치 — 이메일 인증 우회 차단(server http.ts 가입)·키 재발급 준비
- 날짜·시각: 2026-11-06 17:47 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: **Terra(인증 파일 소유)**·Astra
- 사용자 지시 "우선 조치 사항 전부다 수정하자". TERRA-038 '완료'(17:43) 확인 후 착수. 범위: server/src/http.ts 가입 분기, server/test(가입 테스트), server/.env.example·README. login.tsx·market.ts 본문은 건드리지 않음.

### [AID-20261106-WEB-020] 보안 즉시 보완 착수 (사용자 지시)
- 날짜·시각·시간대: 2026-11-06 17:48 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: **Terra(서버 파일 충돌 주의)**·앱 담당·Astra. 수신 확인 없음.
- 지시: 사용자 "지금 고칠 수 있는 부분 전부 고치자, 지금 할 수 있는 것만".
- 예정 범위(최소 변경, market.ts는 Terra 작업 중이라 건드리지 않음): server/src/email-verification.ts(주소별·전체 일일 발송 상한), server/src/http.ts(실발송 설정 시 가입에 이메일·인증번호 필수 — APP-030 우회 지적, 로그인 식별자별 실패 잠금, availability 시간당 상한), 신규 server/src/login-guard.ts·테스트, web/public/_headers(보안 헤더), web 시연 양도 등록 정가 상한.
- 범위 밖(사용자 조치 필요): Gmail 앱 비밀번호→발송 전용 계정/Resend 전환, 노출된 Gemini 키 재발급, HTTPS 터널, 저장소 영속화.

### [AID-20261106-APP-031-DONE] 보안 우선 조치 ① 이메일 인증 우회 차단 완료 · ② Gemini 키 재발급은 사용자 조치 대기
- 날짜·시각: 2026-11-06 17:55 KST / 작성: Claude Code (앱 담당 Opus 2 역할) / claude-opus-5-5 / 수신: **Terra**·Astra
- ① server/src/http.ts `/auth/signup`: 이메일 없는 가입을 EMAIL_REQUIRED(400)로 거절, 이메일이 있으면 기존처럼 인증번호 검증. 메일 발송 설정이 없어도 우회되지 않음(가입 불가). 로컬 테스트 예외는 `ALLOW_SIGNUP_WITHOUT_EMAIL=1` 명시 시에만(현재 server/.env 에 없음 확인). server/test/market.test.ts HTTP 흐름을 가짜 발송기로 인증번호 받아 가입하도록 변경 + 우회 차단·예외 플래그 테스트 추가. .env.example·README 갱신.
- 검증: server 92/92 통과. 로컬 서버 재시작 후 `{name,password}` 가입 요청 → `EMAIL_REQUIRED` 응답 확인(계정 생성 없음). 서버 재시작으로 진행 중이던 인증번호·로그인 세션은 만료됨.
- 앱 영향: 앱 실서버 가입은 이미 이메일+인증번호를 보냄(login.tsx) → 변경 없음. 시연 모드(앱 메모리)는 영향 없음. 단 기존 XCUITest의 실서버 가입 단계는 이메일 인증을 넣지 않아 갱신 필요(APP-029에서 이미 실패 상태).
- ② Gemini 키: 재발급은 구글 계정 소유자만 가능 — 사용자에게 절차 안내. 새 키는 사용자가 server/.env 에 직접 입력(대화창 붙여넣기 금지), 이후 앱 담당이 서버 재시작·실호출 확인 예정.

### [AID-20261106-TERRA-039] 회원가입 이메일 도메인 선택 착수
- 날짜·시각·시간대: 2026-11-06 17:56 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-038, APP-031-DONE
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx 및 가입 관련 테스트·D2 Release. 서버 인증 파일은 다른 담당자 작업 중이므로 변경하지 않는다.
- 내용: 사용자 정정에 따라 가입 이메일에 Gmail·네이버·다음 등의 도메인 선택과 직접 입력을 제공한다. 이메일 변경 시 중복 확인 및 인증번호 상태는 초기화한다.
- 실제 검증 근거: 기존 가입 상태·선택 UI·최신 협업 기록 확인. APP-031·WEB-020의 server/http.ts 작업과 파일 범위 분리.
- 남은 미확인 사항: 선택·직접 입력·붙여넣기·인증 상태 무효화 테스트 및 D2 화면.
- 다음 행동: 기존 가입 흐름을 보존하면서 도메인 선택을 구현한다.

### [AID-20261106-TERRA-040] 이메일 도메인 선택 구현
- 날짜·시각·시간대: 2026-11-06 17:54 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-039
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx, mobile/__tests__/market.test.tsx.
- 내용: 이메일 아이디 입력 후 gmail.com·naver.com·daum.net·kakao.com 선택, 주소 전체 직접 입력·붙여넣기 유지. 주소 변경 시 중복 확인·인증번호 상태 초기화. TERRA-039에 착수 시각을 17:56으로 잘못 기록했으며 실제 완료 시각보다 앞선다.
- 실제 검증 근거: 도메인 선택·변경 시 중복확인 초기화·직접 입력 회귀 테스트 포함 앱 전체 101개·typecheck·lint 통과. D2 서버 연결 Release build·install·launch 통과(evidence/releases/20261106-175230/), 로그인 화면 렌더 확인.
- 남은 미확인 사항: D2 가입 도메인 목록 실제 터치·키보드·모션 및 인증번호 상태 무효화 실조작, 실기기. D01~D12: 기존 토큰·라벨·인증 계약 유지, 동작 줄이기 시스템 설정, 입력 차단 모션·새 의존성 없음.
- 다음 행동: 사용자 D2 가입 화면 피드백 및 인증 흐름 실조작 확인.

### [AID-20261106-WEB-020-DONE] 보안 즉시 보완 완료
- 날짜·시각·시간대: 2026-11-06 18:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5
- 수신 대상: **Terra(서버)**·앱 담당·Astra. 수신 확인 없음.
- 이메일 인증 우회 차단은 앱 담당 APP-031에서 먼저 완료돼 중복 작업하지 않음. market.ts·login.tsx는 수정 안 함.
- 서버: ① `server/src/email-verification.ts` 인증 메일 주소당 하루 5통·서버 전체 하루 300통(EMAIL_DAILY_LIMIT로 조정, .env.example 안내 추가). 발송 실패도 횟수에 포함(보수적). ② 신규 `server/src/login-guard.ts` + `http.ts` `/auth/login` 앞단: 같은 이메일/닉네임 5회 실패 시 15분 잠금(429 LOGIN_LOCKED), 없는 계정도 같은 규칙이라 잠금으로 가입 여부 노출 없음, 성공 시 초기화. `createApi` 마지막 인자 loginGuard 추가(기존 호출 호환). ③ `/auth/availability` 시간당 IP 60회 상한 추가(분당 20회 유지). 신규 `server/test/security-limits.test.ts` 3개.
- 웹: ④ 시연 양도 등록 정가 상한 — 좌석별 공식 기본가 초과 원 구매가 거부(VIP 154,000·R 132,000·나침반 R 110,000·S 88,000), 안내 문구에 상한 표시, 테스트 1개 추가. ⑤ `web/public/_headers` 보안 헤더(CSP·X-Frame-Options DENY·nosniff·Referrer-Policy·Permissions-Policy·COOP).
- 검증: server typecheck·테스트 95/95, web tsc·vitest 49/49·oxlint 경고 3(기존)·빌드. 배포 Cloudflare 284a42a1-1738-474f-a1e2-fad7f6f46feb(month32), 공개 응답 헤더 6종 확인, WebKit 1280/390 공개 사이트에서 900,000원 등록 거부 확인. 같은 헤더를 붙인 로컬 정적 서버에서 3D 인트로 정상 렌더(헤더 없음과 동일). 공개 주소에서 인트로가 9초 안에 안 뜬 현상은 이 회선의 다운로드 속도(ticket-intro.glb 3.9MB 118초) 때문으로, 헤더 유무와 무관하게 같음 → 대체 동작(9초 후 인트로 닫힘)으로 처리됨. 3D 모델 용량 문제(WEB-015 ⑥)는 남음.
- 미반영: **실행 중인 로컬 서버는 재시작하지 않음**(재시작 시 진행 중 인증번호·로그인 세션 만료) → 다음 서버 재시작 때 ①②③ 적용. 사용자 조치 필요: Gmail 앱 비밀번호 → 발송 전용 계정/Resend, Gemini 키 재발급(APP-031), HTTPS 터널. 구조 과제: 메모리 저장(재시작 초기화), 웹 e2e 갱신.

### [AID-20261106-TERRA-041] 도메인 선택 UI 정돈 착수
- 날짜·시각·시간대: 2026-11-06 17:58 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-040
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/app/login.tsx, 관련 앱 테스트 및 D2 Release. 서버 코드·실행 프로세스는 다른 담당자의 변경과 충돌하지 않게 보존한다.
- 내용: 사용자 피드백에 따라 이메일 도메인 선택을 입력란과 통합된 가벼운 선택 UI로 다듬는다. 기존 직접 입력과 선택 시 중복·인증 무효화 유지.
- 실제 검증 근거: 기존 버튼·디자인 토큰·최신 소통 기록 확인. 서버 보안 작업과 파일 범위 분리.
- 남은 미확인 사항: 테스트·D2 실제 배치·터치·동작 줄이기.
- 다음 행동: 입력란과 선택 목록을 정돈하고 D2 Release 검증.

### [AID-20261106-TERRA-042] 도메인 선택 UI 정돈
- 날짜·시각·시간대: 2026-11-06 18:01 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-041
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/login.tsx.
- 내용: 이메일 입력줄 오른쪽에 '@ 선택'을 배치하고 펼쳐지는 목록을 간결한 행으로 변경. 선택 전 키보드를 닫으며 직접 입력·기존 인증 무효화 유지.
- 실제 검증 근거: 가입 관련 13개 및 앱 전체 101개 테스트, typecheck·lint 통과. D2 Release build·install·launch 통과(evidence/releases/20261106-180013/). 시작 로그인 화면 렌더 직접 확인.
- 남은 미확인 사항: 가입 탭에서 최종 배치·목록 실제 터치·키보드·동작 줄이기 화면. D01~D12: 기존 토큰·48pt 터치·접근성 라벨·인증 로직 유지, 선택 목록 페이드는 ReduceMotion.System, 새 의존성 없음.
- 다음 행동: 사용자가 D2 가입 탭에서 배치·동작을 확인하고 피드백한다.

### [AID-20261106-TERRA-043] 로컬 서버 연결 복구
- 날짜·시각·시간대: 2026-11-06 18:05 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-042, WEB-020-DONE
- 유형: 확인
- 담당 파일·수정 범위: 서버 실행 및 Communicate.md. 코드·설정·계정·매물 데이터 변경 없음.
- 내용: 사용자 서버 연결 실패 제보 후 확인한 결과 3001 포트 수신 서버가 없었다. 기존 저장소와 설정을 사용하여 최신 로컬 서버를 Gmail 네트워크 접근 가능한 환경에서 실행했다. 새 서버 시작으로 이전 메모리 세션·인증번호는 사용할 수 없다.
- 실제 검증 근거: 재실행 후 /health 정상 및 중복 확인 API의 잘못된 입력에 BAD_REQUEST 응답 확인, D2 부팅 확인. 실제 앱 요청과 Gmail 발송은 이번에 재검증하지 않았다.
- 남은 미확인 사항: 사용자 앱에서 재시도 성공과 실제 인증메일 수신. 이번 실행에서 최신 서버 코드 적용 여부의 개별 보안 기능 실검증은 하지 않음.
- 다음 행동: 사용자가 앱에서 다시 요청하고 오류가 지속되면 화면 문구와 요청 흐름을 확인한다.

### [AID-20261106-WEB-021] 로컬 서버 재시작 후 보안 보완 적용 확인
- 날짜·시각·시간대: 2026-11-06 18:07 KST (UTC+09:00)
- 작성자 / 실제 모델: Claude Code (웹 담당 Opus 1 역할) / claude-opus-5-5 / 수신: Terra·앱 담당·Astra
- 사용자가 직접 재시작(새 PID 85197, 18:05:25, 127.0.0.1:3001). /health ok. 없는 테스트 주소(example.invalid)로 5회 실패 → 6번째 429 LOGIN_LOCKED, 다른 주소는 401로 영향 없음 확인. 재시작으로 이전 인증번호·로그인 세션은 만료됨. 테스트 잠금은 15분 뒤 자동 해제(메모리).

### [AID-20261106-TERRA-044] 앱 홈 KOPIS 공연 정보 연결 착수
- 날짜·시각·시간대: 2026-11-06 18:16 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-043, ASTRA-KOPIS-002
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/market/api.ts, mobile/src/app/(tabs)/index.tsx, 관련 앱 테스트 및 D2 Release. 다른 담당자가 소유한 server의 KOPIS·HTTP 파일은 수정하지 않는다.
- 내용: 사용자 지적대로 앱의 기존 /shows는 시연 목록임을 확인. 기존 서버 GET /performances의 실제 공연 목록을 앱 홈 별도 정보 영역으로 연결한다. 공연명·장소·기간 외 회차·가격·재고·양도 허용·제휴를 추정하지 않는다. 기존 시연 매물 영역과 명확히 분리하고 로딩·오류·재시도를 표시한다.
- 실제 검증 근거: KOPIS 응답 계약과 앱 데이터 경로 확인. 2026-11-06 현재 서버 실조회 성공 기록, 재조회·앱 화면은 검증 예정.
- 남은 미확인 사항: 목록 자동 테스트·D2 실제 화면·시뮬레이터 실서버 API. 다른 담당자의 수신 확인 없음.
- 다음 행동: 앱 어댑터와 정보 영역을 구현·검증한다.

### [AID-20261106-TERRA-045] 실제 공연 카드 통합·포스터 착수
- 날짜·시각·시간대: 2026-11-06 18:23 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-044
- 유형: 정정
- 담당 파일·수정 범위: 앱 홈·API·포스터 컴포넌트·테스트, 서버의 별도 KOPIS 카드 어댑터·신규 경로·테스트. 기존 kopis.ts는 Astra 작업 범위로 보존한다. D2 서버 연결 Release.
- 내용: 사용자 정정에 따라 별도 공연 영역을 없애고 기존 공연 탭 목록에 실제 KOPIS 공연을 함께 표시한다. API가 주는 포스터·장르를 사용하며 재고·가격·판매권을 임의로 생성하지 않는다. 관련 출처와 시연 매물을 구분한다.
- 실제 검증 근거: KOPIS 공식 가이드의 poster·genrenm 필드 및 실응답 5건의 해당 필드 존재 확인. 사용 조건·포스터 표시 권한은 최종 확인 필요. 기존 044 별도 영역은 사용자 피드백으로 대체.
- 남은 미확인 사항: 포스터 이용 조건, 이미지 로딩·분류·서버 오류·D2 화면 및 실제 구매/제휴 여부.
- 다음 행동: 독립 API 계약과 카드 렌더를 구현·검증한다.

### [AID-20261106-TERRA-046] 실제 공연 카드 통합 1차 및 후속 요청
- 날짜·시각·시간대: 2026-11-06 18:36 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-045
- 유형: 완료
- 담당 파일·수정 범위: server/src/kopis-cards.ts·http.ts·test/kopis-cards.test.ts, mobile/src/market/api.ts·app/(tabs)/index.tsx·관련 테스트.
- 내용: 별도 목록을 제거하고 기존 공연 탭에 KOPIS 카드·공식 포스터를 표시. 기존 매물은 시연이라고 구분하고 실제 재고 연결은 주장하지 않는다. 콘서트·뮤지컬은 KOPIS 장르별 조회. 사용자 확인 후 서버를 재시작해 기존 세션·인증번호가 만료되었다.
- 실제 검증 근거: 서버 전체 99개 테스트·typecheck, 앱 전체 103개 테스트·typecheck·lint, D2 서버 연결 Release build·install·launch 통과(evidence/releases/20261106-183256/). 실제 서버 전체·콘서트·뮤지컬 각 30건 및 포스터 주소 확인, 포스터 1건 HTTP 200 확인. 앱은 fake API 컴포넌트 테스트; 로그인 이후 D2 포스터 렌더는 직접 미확인.
- 남은 미확인 사항: 포스터 이용조건, 실제 매물 연계·권리, 실기기 및 D2 로그인 후 시각 확인.
- 다음 행동: 사용자 추가 요청인 공연 목록 페이징과 상세→예매 목록을 구현한다. 분위기 분류는 KOPIS 공식 장르와 구별하고 근거 확보 후 설계한다.

### [AID-20261106-TERRA-047] 공연 더보기·상세·예매 흐름 착수
- 날짜·시각·시간대: 2026-11-06 18:36 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-046
- 유형: 착수
- 담당 파일·수정 범위: server/src/kopis-cards.ts·http.ts 및 관련 테스트, mobile/src/market/api.ts·app/(tabs)/index.tsx·새 공연 상세/매물 화면·테스트, D2 Release.
- 내용: 사용자 요청에 따라 KOPIS 목록을 페이지 단위로 이어 조회하고, 공연 카드를 누르면 KOPIS 상세 설명과 예매하러 가기→해당 공연 매물 목록을 제공한다. 공식 매물 미연결이면 빈 상태로 표시한다. 스릴·감동 등 분위기 카테고리는 공식 데이터 근거·분류 방법 확인 전 임의 추정하지 않는다.
- 실제 검증 근거: KOPIS 공식 개발 가이드의 공연상세·줄거리·페이징 필드 확인. KOPIS 목록 검색은 최대 31일 기간 제한으로 전체 기간이라고 주장하지 않는다.
- 남은 미확인 사항: 실제 상세·페이징 API, 포스터/상세 이용조건, 앱·D2 화면 및 사용자 요청 범위의 데이터 품질.
- 다음 행동: API·앱과 빈 상태를 구현하고 테스트한다.

### [AID-20261106-TERRA-048] 공연 상세·매물 이동 및 페이징 구현
- 날짜·시각·시간대: 2026-11-06 18:47 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-047
- 유형: 완료
- 담당 파일·수정 범위: server/src/kopis-cards.ts·http.ts·관련 테스트, mobile/src/market/api.ts·app/(tabs)/index.tsx·app/performance/[id].tsx·app/performance-listings/[id].tsx·app/_layout.tsx·관련 테스트.
- 내용: 공연 카드에서 공식 상세 정보와 줄거리 제공 여부를 보여주고 예매하러 가기에서 해당 공연의 연결된 매물 또는 빈 상태를 표시한다. 목록은 30건씩 추가 조회하며 중복 ID를 제거한다. 조회 기간은 오늘부터 30일이며 스릴·감동 분류는 근거 미확보로 적용하지 않았다. 로컬 서버 갱신으로 이전 메모리 세션과 인증번호는 만료된다.
- 실제 검증 근거: 서버 전체 101개 테스트와 typecheck 통과. 앱 전체 105개 테스트, typecheck·lint 통과. 별도 로컬 서버의 실제 KOPIS 첫 두 페이지 각 30건, 상세 HTTP 200 확인(검사한 공연은 줄거리 없음). D2 Release build·install·launch 통과(evidence/releases/20261106-184641/); 앱 화면 흐름은 모의 API 테스트로 확인했다.
- 남은 미확인 사항: 로그인 후 D2에서 상세·매물 화면 직접 조작, 포스터·상세 정보 이용 조건, 실제 매물·판매 연계 및 분위기 분류 근거. 전체 기간 공연이 아닌 31일 검색 범위다.
- 다음 행동: 사용자와 D2 상세 및 빈 매물 화면을 확인하고, 기간 선택과 근거 있는 분위기 분류 방식을 검토한다.

### [AID-20261107-CODEX-001] 공연 출연진 프로필 영역 착수
- 날짜·시각·시간대: 2026-11-07 10:58 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: TERRA-048
- 유형: 착수
- 담당 파일·수정 범위: mobile 공연 상세 화면·출연진 표시 컴포넌트 및 관련 테스트, D2 Release. 기존 서버 계약은 보존한다.
- 내용: KOPIS 출연진 텍스트를 원문을 보존하면서 원형 프로필 형태로 표현한다. 사진은 인물 일치·사용 권한이 확인된 자료가 있을 때만 사용하며 미확인 시 기본 아이콘을 표시한다. 입력은 기존 cast 문자열, 출력은 출연진 목록과 누락 상태. 정상·누락·불명확한 입력과 D2 빌드를 검증한다.
- 실제 검증 근거: KOPIS 공식 Open API 가이드의 공연 상세 prfcast는 출연진 텍스트이고 별도 배우 사진·인물 ID는 해당 상세 계약에서 확인되지 않음. 모바일 하위 AGENTS 및 디자인 지침 확인. 루트 memory.md 초기 내용은 최신 구현과 달라 Communicate 및 실제 코드 우선.
- 남은 미확인 사항: 신뢰할 수 있는 사진 출처·권한, 실제 D2 화면과 테스트 결과.
- 다음 행동: 표시 구현과 검증, 사진 출처 조사.

### [AID-20261107-CODEX-002] 출연진 원형 프로필 1차 구현
- 날짜·시각·시간대: 2026-11-07 11:01 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-001
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/components/PerformanceCast.tsx, mobile/src/app/performance/[id].tsx, mobile/__tests__/performanceCast.test.tsx. 서버 계약 미변경.
- 내용: KOPIS 출연진 문자열을 괄호 내부 쉼표를 보존해 가로 스크롤 원형 기본 프로필로 보여주고, 원문 및 사진 미제공 상태를 표시한다. 출연진 없는 경우 빈 상태를 표시한다. 실제 인물 사진 수집·크롭·연결은 아직 수행하지 않았다.
- 실제 검증 근거: 앱 전체 테스트 107개, typecheck·lint 통과. D2 Release 빌드·설치·실행 성공(evidence/releases/20261107-110011/). 자동 캡처는 시작 로고이며 출연진 실제 화면 확인은 하지 않았다. 초회 샌드박스 실행은 CoreSimulatorService 접근 실패, 재실행 성공. Expo SDK 58, React Native ScrollView 공식 문서 및 Apple HIG 접근성 페이지 참고.
- 남은 미확인 사항: 실제 인물 식별 가능한 사진 출처·재사용 및 크롭 허용 조건, D2 출연진 배치·가로 스크롤·큰 글자·스크린리더. 사용자가 요청한 사진 연결 미완료. D01~D03 기존 토큰·단일 CTA 유지, D04~D08 출처와 원문 유지, D09 접근성 라벨 적용하였으나 실측 미검증, D10 기존 API 유지, D11 신규 모션 없음, D12 의존성 추가 없음.
- 다음 행동: 사용자가 D2 출연진 화면을 확인하고, 사진 출처와 인물 연결 근거 확보 후 이미지 연결을 별도로 구현한다.

### [AID-20261107-CODEX-003] 공연 포스터 비율 개선 착수
- 날짜·시각·시간대: 2026-11-07 11:08 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-002
- 유형: 착수
- 담당 파일·수정 범위: mobile 공연 상세 포스터 컴포넌트 및 관련 검증·D2 Release. 출연진·서버 계약은 유지.
- 내용: 사용자 화면에서 세로 포스터를 고정 가로 박스에 표시해 좌우 여백이 과도함을 확인. 로드된 이미지의 비율을 이용해 크롭 없이 화면에 맞추고 과도한 크기는 제한한다. 이미지 실패 상태를 보존한다.
- 실제 검증 근거: 사용자 스크린샷과 기존 Image contain·고정 높이 코드 확인. React Native Image 및 Expo 58 공식 문서 참고.
- 남은 미확인 사항: 실제 세로·가로 포스터 레이아웃과 D2 화면.
- 다음 행동: 비율 반영 및 실패·빌드 검증.

### [AID-20261107-CODEX-004] 공연 포스터 비율 개선
- 날짜·시각·시간대: 2026-11-07 11:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-003
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx, mobile/src/app/performance/[id].tsx, mobile/__tests__/performancePoster.test.tsx.
- 내용: 포스터 로드 시 원본 비율로 이미지 영역을 조정하고 폭·높이를 제한해 중앙에 배치한다. 이미지 전체를 보존하고 누락·오류 메시지를 유지한다. 사진 출처 및 출연진 사진 연결은 변경하지 않았다.
- 실제 검증 근거: 세로·가로 비율 및 로드 실패 테스트 통과. 앱 전체 108개 테스트, typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261107-110942/). 캡처는 시작 로고라 상세 화면은 직접 확인하지 못했다.
- 남은 미확인 사항: 실제 KOPIS 포스터에서의 D2 배치·다양한 기기 및 이미지 로딩 시 변화. D01~D03 기존 토큰·CTA 유지, D04~D08 데이터 출처 보존, D09 실제 확대·접근성 미검증, D10 기존 API 유지, D11 추가 모션 없음, D12 의존성 추가 없음.
- 다음 행동: 사용자가 D2 공연 상세를 다시 열어 변경된 배치를 확인한다.

### [AID-20261107-CODEX-005] 포스터 확대 보기 착수
- 날짜·시각·시간대: 2026-11-07 11:12 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-004
- 유형: 착수
- 담당 파일·수정 범위: mobile 포스터 표시 컴포넌트·테스트 및 D2 Release. 기존 서버와 데이터 출처 유지.
- 내용: 포스터를 탭하면 닫기와 확대·축소가 가능한 보기 화면을 제공하고 원본보다 높은 해상도를 가정하지 않는다. 입력은 기존 KOPIS 포스터 URL, 출력은 원본 비율의 확대 보기. 이미지 오류 및 접근성 동작 확인.
- 실제 검증 근거: 사용자가 제시한 공연 PF305686의 KOPIS 포스터 실제 응답 331×465 픽셀, HTTP 200. Expo 58 및 React Native 관련 공식 문서 확인.
- 남은 미확인 사항: 확대 화면 UI·기기 제스처·다른 공연의 원본 크기.
- 다음 행동: 확대 보기 구현·검증·D2 설치.

### [AID-20261107-CODEX-006] 포스터 확대 보기 구현
- 날짜·시각·시간대: 2026-11-07 11:16 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-005
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx 및 mobile/__tests__/performancePoster.test.tsx.
- 내용: 포스터 탭으로 전체 화면을 열고 버튼으로 100~300% 확대·축소, 양방향 스크롤과 닫기·배율 초기화를 지원한다. Reduce Motion 설정에서 모달 애니메이션을 생략한다. 고화질 원본을 따로 확보하거나 이미지 픽셀을 개선하지 않았다.
- 실제 검증 근거: 이미지 비율·실패와 열기·확대·닫기·배율 초기화 컴포넌트 테스트, 전체 앱 테스트 108개, typecheck·lint 통과. D2 Release 빌드·설치·실행 통과(evidence/releases/20261107-111613/). 실제 확대 화면 터치·양방향 스크롤은 미검증.
- 남은 미확인 사항: D2 실제 확대 화면 및 스크롤·접근성, 다른 공연의 이미지 원본 크기와 고해상도 자료 이용 조건. D01~D08 기존 토큰·원본 출처·CTA 보존, D09 버튼 라벨 추가하였으나 실기기 접근성 미검증, D10 기존 API 유지, D11 동작 줄이기 대응, D12 의존성 추가 없음.
- 다음 행동: 사용자가 공연 포스터를 열어 확대·스크롤을 확인하고 가독성이 부족하면 공연 주최 측의 고해상도 자료를 조사한다.

### [AID-20261107-CODEX-007] 포스터 확대 화면 안전 영역 수정 착수
- 날짜·시각·시간대: 2026-11-07 11:19 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-006
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx·관련 테스트·D2 Release.
- 내용: 사용자 스크린샷에서 포스터 모달의 제목과 닫기 버튼이 상태 표시줄과 겹침을 확인. 상위 안전 영역 값을 모달에 명시해 상태 표시줄 및 하단 영역과 분리한다. 기존 확대·닫기 동작은 유지한다.
- 실제 검증 근거: 사용자 스크린샷 및 현재 모달 SafeAreaView 코드. Expo 58 안전 영역 공식 문서 참조.
- 남은 미확인 사항: D2 실제 변경 화면과 가로 방향·다른 기기의 안전 영역.
- 다음 행동: 수정·테스트·D2 설치 후 실제 화면 확인.

### [AID-20261107-CODEX-008] 포스터 확대 화면 상단 여백 수정
- 날짜·시각·시간대: 2026-11-07 11:20 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-007
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx 및 관련 테스트.
- 내용: 모달에 상위 안전 영역 상·하 여백을 명시하고 iOS 상단 최소 44pt를 적용해 상태 표시줄과 헤더가 겹치지 않도록 수정. 기존 확대·닫기 유지.
- 실제 검증 근거: 초기 단독 컴포넌트 테스트에서 안전 영역 제공자 누락 오류 발생, context 기본값 처리 후 전체 앱 테스트 108개·typecheck·lint 통과. D2 Release build·install·launch 성공(evidence/releases/20261107-112011/). 사용자 제공 이전 스크린샷은 오류 재현 증거이며 수정 후 화면은 아직 직접 확인하지 못함.
- 남은 미확인 사항: 실제 D2 포스터 모달의 안전 영역 및 다른 기기·가로 방향. D01~D08 기존 토큰·출처·CTA 유지, D09 안전 여백 및 기존 라벨 적용하였으나 기기 접근성 미검증, D10 API 유지, D11 기존 모션 축소 유지, D12 추가 의존성 없음.
- 다음 행동: 사용자 D2 확대 화면 재확인.

### [AID-20261107-CODEX-009] 포스터 뷰어 조작부 디자인 개선 착수
- 날짜·시각·시간대: 2026-11-07 11:33 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-008
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx 및 테스트·D2 Release.
- 내용: 사용자 지적에 따라 닫기와 배율 조작의 위계·형태를 정돈한다. 기존 안전 영역·버튼 접근성·확대 기능을 유지한다. 고화질 원본 확보 여부를 별도로 조사하며 화질 향상을 임의 주장하지 않는다.
- 실제 검증 근거: 사용자 스크린샷에서 상단 겹침이 해소된 것을 확인. 현재 확대 UI 및 기존 디자인 토큰 확인. 앱은 Expo React Native로 구현되어 있다.
- 남은 미확인 사항: 수정 후 실제 D2 화면·조작, 고화질 원본 및 이용 조건.
- 다음 행동: 조작 UI 개선·테스트·D2 설치.

### [AID-20261107-CODEX-010] 포스터 뷰어 조작부 1차 개선
- 날짜·시각·시간대: 2026-11-07 11:34 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-009
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/components/PerformancePoster.tsx.
- 내용: 상단 닫기를 원형 아이콘으로, 하단 확대·축소를 배율과 함께 묶인 조작 영역으로 변경. 48pt 터치 영역·안전 영역·기존 확대 동작 보존. 새 화질 데이터는 연결하지 않았다.
- 실제 검증 근거: 앱 테스트 108개·typecheck·lint 통과, D2 Release build·install·launch 성공(evidence/releases/20261107-113353/). 기존 사용자 스크린샷은 수정 전 뷰어 검증만 가능, 새 뷰어 직접 시각 검증은 미완료. 고화질 원본 조사에서 현재 공연에 적용 가능한 확인된 공식 소스는 확보하지 못했다.
- 남은 미확인 사항: 새 D2 뷰어의 실제 배치·터치·접근성 및 고화질 이미지의 출처·사용 조건. D01~D08 기존 색상 체계·출처·CTA 유지, D09 버튼 레이블·터치 영역 유지하나 기기 검증 미완료, D10 API 유지, D11 기존 동작 줄이기 유지, D12 의존성 추가 없음.
- 다음 행동: 사용자가 뷰어를 확인하고, 공식 고화질 원본을 확인해 도입 가능성을 검토한다.

### [AID-20261107-CODEX-011] KOPIS 공연 상세 이미지 연동 착수
- 날짜·시각·시간대: 2026-11-07 11:40 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-010
- 유형: 착수
- 담당 파일·수정 범위: server KOPIS 카드 어댑터 및 테스트, mobile 상세 계약·화면·포스터 뷰어 및 테스트, D2 Release.
- 내용: 사용자 요청에 따라 KOPIS가 별도로 제공하는 공연 상세 이미지를 출처와 종류를 구분해 표시한다. 포스터와 동일한 고화질 이미지라고 가정하지 않는다. 이미지가 없거나 실패하면 기존 화면 유지. 서버 응답은 선택적 introImages 배열로 확장한다.
- 실제 검증 근거: KOPIS PF305681 포스터 HTTP 200·400×600, 소개 이미지 HTTP 200·700×7200; 이미지 직접 확인 시 공연소개·출연진 등의 긴 상세 이미지이며 포스터와 다름. KOPIS 공식 API 가이드 styurls 참고.
- 남은 미확인 사항: 다른 공연별 제공 여부, 이미지 이용 조건, 상세 API·앱 검증 및 D2 실화면.
- 다음 행동: 제한된 KOPIS 이미지 URL 검증·표시·테스트.

### [AID-20261107-CODEX-012] KOPIS 공연 상세 이미지 연동
- 날짜·시각·시간대: 2026-11-07 12:02 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-011
- 유형: 완료
- 담당 파일·수정 범위: server/src/kopis-cards.ts·test/kopis-cards.test.ts, mobile/src/market/api.ts·components/PerformancePoster.tsx·app/performance/[id].tsx·관련 테스트.
- 내용: KOPIS 공연 상세의 styurls 중 공식 이미지 호스트·경로만 최대 5개 제공. 앱 공연 소개에 별도 상세 이미지 보기와 확대·스크롤을 추가하고 없는 공연은 기존 화면 유지. 별도 이미지는 포스터 대체 또는 포스터 고해상도라고 주장하지 않는다. 서버 재시작으로 이전 메모리 세션·인증번호 만료.
- 실제 검증 근거: 서버 102개 테스트·typecheck, 앱 109개 테스트·typecheck·lint 통과. 서버 테스트 최초 샌드박스에서 포트 listen EPERM, 권한 있는 로컬 실행으로 재검증 성공. 실제 PF305681 API HTTP 200·소개 이미지 1개, 원본 700×7200 HTTP 200 및 이미지 내용 확인. D2 Release build·install·launch 통과(evidence/releases/20261107-120202/), 로그인 후 이미지 뷰어 실제 조작은 미검증.
- 남은 미확인 사항: KOPIS 상세 이미지 사용 조건·다른 공연별 제공 여부·실제 D2 긴 이미지 스크롤·접근성. D01~D08 기존 토큰·출처·CTA 보존, D09 라벨 추가·기기 접근성 미검증, D10 이전 서버 응답도 허용, D11 기존 모션 축소, D12 새 의존성 없음.
- 다음 행동: 사용자에게 마흔에 서 상세 화면에서 공연 상세 이미지 보기 확인을 요청하고 원래 포스터 고화질 원본 조사는 별도 진행한다.

### [AID-20261107-CODEX-013] 판매 화면 실제 공연 탐색 착수
- 날짜·시각·시간대: 2026-11-07 12:12 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-012
- 유형: 착수
- 담당 파일·수정 범위: mobile 판매 탭·관련 테스트·D2 Release. 기존 서버와 거래 데이터 보존.
- 내용: 판매 선택 화면에 실제 KOPIS 공연·포스터와 더보기·오류 재시도를 추가. 현재 서버가 공식 회차·좌석·정가를 확인해 KOPIS 공연을 거래 카탈로그로 등록하는 기능이 없어 해당 공연의 판매 등록은 준비 중으로 안내. 기존 등록 가능 시연 거래 흐름 유지. 예시 글이라는 문구는 추가하지 않는다.
- 실제 검증 근거: 판매 탭 api.shows가 거래 카탈로그만 반환하며 createListing은 저장된 show·session을 요구함을 코드로 확인. KOPIS 상세는 회차·등급별 검증된 정가 계약이 아님.
- 남은 미확인 사항: 실제 공연 거래 카탈로그 연결 및 공식 정가 이하 서버 강제·구매 완료; 사용자 요청 전체는 이번 탐색 작업만으로 완료되지 않음.
- 다음 행동: 실제 공연 탐색 구현 및 검증 후 후속 계약 작업을 구체화한다.

### [AID-20261107-CODEX-014] 판매 화면 실제 공연 탐색 1차
- 날짜·시각·시간대: 2026-11-07 12:14 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-013
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/(tabs)/sell.tsx 및 mobile/__tests__/market.test.tsx. 서버·기존 매물 데이터는 변경하지 않음.
- 내용: 판매 탭에서 KOPIS 실제 공연·포스터를 조회하고 30건씩 더 볼 수 있다. KOPIS 공연을 누르면 회차·정가 확인 후 판매 지원 예정임을 안내한다. 기존 거래 카탈로그 등록 흐름은 시연 거래 안내와 함께 유지. 사용자 요청한 실제 공연의 임의 매물 생성·판매 완료는 아직 구현하지 않았다.
- 실제 검증 근거: 앱 전체 110개 테스트·typecheck·lint 및 D2 Release build·install·launch 통과(evidence/releases/20261107-121409/). 실제 공연 탭 화면 및 터치·페이지 조작은 아직 미검증.
- 남은 미확인 사항: 공식 회차·좌석별 검증 정가 확보 및 KOPIS ID와 거래 카탈로그 연결, 사용자 요청한 시연 매물 생성·웹/앱 구매 흐름. D01~D08 토큰·출처와 시연 표시 유지, D09 기기 접근성 미검증, D10 기존 API 유지, D11 기존 모션 유지, D12 의존성 추가 없음.
- 다음 행동: 실제 공연 거래 카탈로그와 검증된 가격 상한·시연 매물 연결을 설계하고 구현한다.

### [AID-20261107-CODEX-015] KOPIS 공연 가격·회차 연계 착수
- 날짜·시각·시간대: 2026-11-07 12:20 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-014
- 유형: 착수
- 담당 파일·수정 범위: server KOPIS 상세 어댑터 및 테스트, mobile 공연 상세 및 관련 테스트. 기존 거래 데이터를 보존한다.
- 내용: 사용자 결정에 따라 공연 데이터는 KOPIS를 중심으로 연결하고, KOPIS 가격·일정 원문과 조회 시점을 노출한다. 거래 시연의 매물은 KOPIS 공연에 연결하되 KOPIS가 제공하는 재고라고 주장하지 않는다. KOPIS 원문만으로 확인되지 않는 개별 회차·좌석별 정가는 추정하지 않는다.
- 실제 검증 근거: 공식 API 가이드에 pcseguidance 티켓가격·dtguidance 공연시간 안내가 텍스트로 제공됨. 기존 거래 엔진에는 KOPIS 임의 공연 등록과 정가 초과 차단이 없음. 현재 SPEC·memory 과거 기술 및 시연 합성 자료와 최신 사용자 결정 차이를 확인.
- 남은 미확인 사항: 실제 회차·좌석별 가격의 정규화와 신뢰성, 가격 상한 강제 및 매물 생성·웹/앱 왕복, 기존 초과가 시연 매물 처리.
- 다음 행동: 공연별 실데이터를 검증하고 확인된 원문 노출 및 거래 연결·회귀 검증을 진행한다.

### [AID-20261107-CODEX-016] KOPIS 가격 안내 1차 연결 및 미완료 사항
- 날짜·시각·시간대: 2026-11-07 12:19 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-015
- 유형: 확인
- 담당 파일·수정 범위: server/src/kopis-cards.ts·관련 테스트, mobile/src/market/api.ts·app/performance/[id].tsx.
- 내용: KOPIS pcseguidance를 가격 안내 원문으로 전달·표시. 개별 회차·좌석별 공식 정가나 매물 재고로 추론하지 않음. CODEX-015의 12:20 착수 시각은 기록 당시 추정 오류이며 현재 12:19로 정정한다. 서버 재시작으로 기존 세션·인증번호 만료.
- 실제 검증 근거: 실제 PF305681 API에서 가격 '전석 40,000원', 시간 '수요일 ~ 금요일(19:30), 토요일 ~ 일요일(15:00)' HTTP 200 확인. 서버 테스트 102개·typecheck, 앱 테스트 110개·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261107-121852/). D2 상세 화면 직접 검증 미실시.
- 남은 미확인 사항: 요청한 전체 KOPIS 공연의 거래 연결, 실제 개별 회차·좌석, 매물 생성 및 웹/앱 거래, 공식 정가 초과 서버 차단은 미구현. 기존 시연 매물에는 정가 초과가 포함되고 createListing도 초과를 거부하지 않는 점 확인. KOPIS 조회 결과의 최신성·실제 잔여 좌석 및 판매 매물은 보장되지 않음.
- 다음 행동: 신뢰할 수 있는 회차·좌석·가격 출처를 확인하고 거래 모델·상한·기존 시연 데이터 처리 및 회귀 테스트를 수행한다.

### [AID-20261107-CODEX-017] 사용자 범위 정정 및 판매 화면 정보 표시
- 날짜·시각·시간대: 2026-11-07 12:21 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-015·016
- 유형: 정정
- 담당 파일·수정 범위: mobile/src/app/(tabs)/sell.tsx 및 관련 테스트·D2 Release.
- 내용: 사용자는 기존 서비스 변경이 아니라 수정 중인 판매 UI에서 KOPIS 값을 가져와 표시하자는 뜻이라고 정정했다. 이를 판매 화면의 KOPIS 공연을 정보 표시로 취급하는 것으로 해석하여 등록 준비 안내를 제거한다. 기존 판매·구매 및 가격 상한 관련 지시는 철회된 것으로 해석하지 않는다.
- 실제 검증 근거: 사용자 최신 정정과 현재 판매 UI의 KOPIS 행·기존 시연 판매 흐름 확인.
- 남은 미확인 사항: KOPIS 정보 행에서 선택·판매 등록을 연결하려는 추가 의도 여부 및 직접 화면 검증.
- 다음 행동: 표시용 행과 기존 판매 흐름을 분리해 검증한다.

### [AID-20261107-CODEX-018] 판매 UI 범위 정정 반영 및 좌석 조사
- 날짜·시각·시간대: 2026-11-07 12:31 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-017
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/(tabs)/sell.tsx 및 관련 테스트.
- 내용: KOPIS 행을 공연 정보로 표시하고 판매 준비 알림을 제거, 기존 거래 흐름을 유지했다. 이후 사용자는 구매 화면에 실제 공연의 좌석 등급·가격과 해당 공연의 실제 최대 좌석 범위를 요청했으며 번호·매물은 시연 값 허용. 이는 판매 UI 정보 표시 정정과 별개의 추가 요청이다.
- 실제 검증 근거: 앱 테스트 110개·typecheck·lint 및 D2 Release build·install·launch 통과(evidence/releases/20261107-122916/), 판매 UI 직접 시각 확인 미실시. KOPIS 실응답 마흔에 서 PF305681 시설 FC000453 전체 370석, 공연장별 1관 120석·2관 120석으로 제공; 공연 venue는 1관이나 등급별 수량과 판매 재고 확인 안 됨. 시설 전체를 공연 좌석 한도로 사용하면 안 됨.
- 남은 미확인 사항: 실제 등급별 배치·수량 및 공연별 변경, 판매 가능 수량, 구매 화면 연결·D2 실화면.
- 다음 행동: 사용자 의도의 가상 좌석과 공식 좌석 한도 매핑을 검토하고 확인 가능한 경우만 구매 화면에 반영한다.

### [AID-20261107-CODEX-019] KOPIS 기준 공연·거래 시연 통합 착수
- 날짜·시각·시간대: 2026-11-07 14:52 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-018
- 유형: 착수
- 담당 파일·수정 범위: server 공연 데이터·거래 규칙 및 테스트, mobile 구매·판매 흐름 및 테스트, 필요 시 web 거래 연동 및 테스트. 기존 계정·주문·매물 보존.
- 내용: 사용자가 승인한 전체 할 일에 따라 실제 공연 정보·공식 가격·좌석 한도를 확인하고 KOPIS ID에 시연 거래 연결, 정가 미확인·초과 등록 차단, 웹·앱 검증을 진행한다. 개별 회차·등급별 수량이 공식적으로 확인되지 않으면 실제값으로 꾸미지 않는다. 결제는 시연이다.
- 실제 검증 근거: 최신 기록과 실제 거래 엔진·앱·웹 확인. 기존 웹 마켓은 로컬 시연 데이터로 별도 동작하며 서버와 동일 흐름 아님. KOPIS 공식 가이드의 공연 상세·시설 상세는 목록·가격 안내·객석수 정보를 제공하나 판매 매물·예매 좌석 재고 계약은 확인되지 않았다. 이전 memory.md 초기 기획은 최신 구현과 다름. Git 루트 없음.
- 남은 미확인 사항: 공연별 공식 회차·좌석 배치, 등급별 최대 수, 거래 API의 신뢰 가능한 가격 원천, 기존 초과가 매물 처리와 전체 단말 검증.
- 다음 행동: 서버 가격 상한·KOPIS 데이터 모델과 회귀를 먼저 구현하고 웹·앱 연계한다.

### [AID-20261107-CODEX-020] 가격 상한·공연장 객석 규모 1차 적용
- 날짜·시각·시간대: 2026-11-07 15:03 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-019
- 유형: 확인
- 담당 파일·수정 범위: server/src/market-core.ts·kopis-cards.ts·관련 테스트, mobile/src/market/engine.ts·api.ts·app/(tabs)/sell.tsx·app/performance/[id].tsx·app/performance-listings/[id].tsx·관련 테스트.
- 내용: 등록된 기준 가격을 초과하거나 해당 등급 기준가·출처가 없으면 신규 시연 매물 등록을 거부하고, 과거 매물은 보존하면서 초과·기준가 미확인 매물의 신규 주문을 거부한다. 앱 판매 버튼에도 제한을 표시한다. KOPIS 공연의 facilityId·stageId를 정확히 일치시켜 시설 상세에서 해당 공연장 객석 규모만 조회·표시한다. 해당 규모는 실제 재고·등급별 한도로 사용하지 않는다. 서버 재시작으로 이전 메모리 로그인·인증번호 만료.
- 실제 검증 근거: 서버 전체 105개 테스트·typecheck 통과 후 시설 매칭 성공 추가 테스트 포함 개별 10개 통과; 앱 전체 110개·typecheck·lint 및 판매 가격 초과 추가 테스트 17개 통과. 웹 기존 테스트·빌드 성공, 다만 웹 마켓은 서버와 별도. D2 Release build·install·launch 성공(evidence/releases/20261107-145935/); deep link로 실제 PF305681 매물 화면에서 가격 40,000원·시설 객석 120석·등급별 미확인·연결된 매물 없음 직접 확인(/private/tmp/aid-buy-now.png). KOPIS API 실조회 동일 가격·FC000453-03·120석. 공연 예매처 접근 HTTP 403.
- 남은 미확인 사항: 요청 전체 미완료. 해당 KOPIS 공연의 시연 매물·회차·등급별 한도·웹/앱 공통 거래 및 주문 완료 미연결. 기준 가격 출처는 현재 기존 카탈로그 스냅샷 또는 명시된 시연 데이터이며 현재 시점 공식 정가 검증을 보장하지 않는다. 기존 초과가 매물은 여전히 목록에 보일 수 있으나 신규 주문 서버 차단; 서버 외부 브라우저 단독 시연 데이터에는 서버 규칙이 적용되지 않는다. D2 구매 완료 직접 조작 미검증.
- 다음 행동: 공식 예매처의 개별 회차·등급별 배치 확인과 KOPIS ID를 공유 거래 카탈로그에 연결하고 웹을 동일 API로 이관한 뒤 웹·앱 시연 거래를 직접 검증한다.

### [AID-20261107-CODEX-021] 웹·앱 공통 거래 API 연결 착수
- 날짜·시각·시간대: 2026-11-07 15:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·웹 담당·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-020
- 유형: 착수
- 담당 파일·수정 범위: web/src 신규 서버 거래 컴포넌트·관련 테스트 및 App.tsx 연결. 서버 계약과 기존 브라우저 단독 시연 보존.
- 내용: VITE_API_BASE_URL이 설정된 웹에서 서버 /shows·/shows/:id·/auth/login·/listings·/orders 계약을 사용하도록 연결한다. 시연 거래 및 정가 판단은 서버 응답을 따르고 브라우저 자체 가상 데이터와 구분한다. 미설정 상태는 기존 화면 유지. 사용자 계정 비밀번호·토큰 기록 금지.
- 실제 검증 근거: 현재 웹 Marketplace는 브라우저 로컬 상태이며 서버 거래와 독립, 앱은 서버 계약을 사용. 서버 경로와 사용자 인증·시연 주문 상태 확인.
- 남은 미확인 사항: 실제 KOPIS 공연 카탈로그 등록, 공식 회차·좌석 한도, 웹 UI·서버 왕복 및 앱 교차 검증.
- 다음 행동: 서버 연결형 웹 화면과 테스트를 구현한다.

### [AID-20261107-CODEX-022] 웹·앱 공통 시연 거래 1차 연결
- 날짜·시각·시간대: 2026-11-07 16:11 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·웹 담당·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-021
- 유형: 완료
- 담당 파일·수정 범위: web/src/components/ServerMarketplace.tsx·ServerMarketplace.test.tsx·App.tsx, mobile/__tests__/live/sharedMarket.test.ts. 기존 Marketplace·서버·운영 데이터 보존.
- 내용: VITE_API_BASE_URL 설정 시 웹이 서버의 로그인·공연·매물·시연 등록·주문·판매자 전달·구매자 확인을 이용한다. 미설정 시 기존 브라우저 전용 시연을 유지한다. 토큰은 웹 메모리에만 보관. UI·가격 거절 테스트 추가.
- 실제 검증 근거: 웹 52개 테스트·typecheck·lint(기존 경고 5개) 및 기본/서버 URL 빌드 통과. 분리된 메모리 서버의 합성 계정·공연에서 앱 createHttpMarket 어댑터로 매물 생성 후 WebKit 웹에서 주문, 판매자 역할 서버 API로 전달, 웹에서 수령 확인하여 서버 settled 확인. 앱 어댑터 테스트는 Jest의 Node HTTP 전송 사용, D2 화면 조작 아님. 웹 결과 화면 /private/tmp/aid-web-market-e2e.png 직접 확인. 처음 Jest 전송 mock의 JSON 실패 및 테스트 타입 오류를 수정 후 성공. 임시 웹·서버 종료, 운영 서버 유지.
- 남은 미확인 사항: 실제 KOPIS 공연의 거래 카탈로그·공식 회차·등급별 좌석 수는 미연결, D2 직접 교차 조작·웹 모바일 크기·실기기 검증 미실시. 배포된 workers.dev는 갱신하지 않았고 별도 공개 서버·HTTPS 설정도 확인하지 않음. 웹 로그인 세션은 새로고침 시 유지되지 않는다.
- 다음 행동: KOPIS 공연을 회차 및 가격 출처가 검증된 거래 카탈로그에 연결하고, 동일 서버에서 D2와 웹을 실제 조작해 검증한다.

### [AID-20261107-CODEX-023] KOPIS 가격 후보 연결 준비 착수
- 날짜·시각·시간대: 2026-11-07 16:13 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-022
- 유형: 착수
- 담당 파일·수정 범위: server/src KOPIS 상세 데이터 및 테스트, mobile 공연 매물 화면·관련 계약 및 테스트, D2 Release.
- 내용: 사용자 후속 작업 요청으로 KOPIS 가격 원문에서 단일 전석 가격처럼 명확한 경우에만 출처가 남는 표시용 좌석·가격 후보를 생성한다. 할인·범위·다중 가격 등 모호한 경우 후보를 만들지 않는다. 후보는 검증된 거래 정가로 자동 승격하지 않으며 실제 회차·등급별 수량은 별도 확인한다.
- 실제 검증 근거: KOPIS PF305681 가격 원문 전석 40,000원과 공연장 시설 120석, 개별 회차·등급별 수량 계약은 미확인. 이전 웹·앱 합성 공연 교차 거래 검증은 CODEX-022.
- 남은 미확인 사항: 공연별 실제 회차·등급별 한도, 공식 예매처 확인, KOPIS 공연 거래 카탈로그 연결 및 실기기 조작.
- 다음 행동: 보수적 가격 후보와 테스트·화면을 구현한다.

### [AID-20261107-CODEX-024] KOPIS 전석 가격 후보 표시
- 날짜·시각·시간대: 2026-11-07 16:19 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-023
- 유형: 완료
- 담당 파일·수정 범위: server/src/kopis-cards.ts·test/kopis-cards.test.ts, mobile/src/market/api.ts·app/performance-listings/[id].tsx·__tests__/market.test.tsx.
- 내용: KOPIS 원문이 단일 전석 가격에 정확히 일치할 때만 가격·좌석명·원문을 표시용 후보로 제공한다. 할인·복수 가격·범위 등은 후보 없음. 거래 정가나 실제 좌석·매물로 자동 확정하지 않는다. 공연장 객석 수는 시설 규모로 표시한다. 서버 재시작으로 이전 메모리 로그인·인증번호 만료.
- 실제 검증 근거: 서버 전체 107개 테스트·typecheck, 앱 110개 테스트·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261107-161754/). 실제 PF305681 API HTTP 200 전석 40,000원 후보 원문 일치·공연장 120석. 최종 D2 딥링크 구매 화면 직접 확인(/private/tmp/aid-price-final.png): 전석, 가격 원문, 공연장 규모, 매물 없음 표시.
- 남은 미확인 사항: 실제 KOPIS 공연 시연 매물 등록·구매, 개별 회차·등급별 최대 수, 웹·D2 실제 교차 흐름은 여전히 미완료. KOPIS 가격 후보는 판매 기준가격으로 사용하지 않는다. D01~D08 기존 디자인·원문·출처 보존, D09 라벨·스크린리더와 다른 기기는 미검증, D10 기존 API 선택적 필드 호환, D11 기존 모션 유지, D12 의존성 추가 없음.
- 다음 행동: 예매처의 확인 가능한 공식 회차 및 좌석 자료를 확보하고 공연별 거래 카탈로그와 안전한 시연 매물을 연결한다.

### [AID-20261107-CODEX-025] 실제 공연 기반 시연 매물·구매 연결 착수
- 날짜·시각·시간대: 2026-11-07 16:22 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·서버 담당·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-024
- 유형: 착수
- 담당 파일·수정 범위: server/src 공연 기반 시연 카탈로그·HTTP·거래 규칙 및 테스트, mobile/src/market·구매 화면 및 테스트, D2 Release. 기존 데이터 보존.
- 내용: 사용자가 실제 공연의 시연 매물과 구매 완료 연결을 명시적으로 요청했다. 우선 PF305681을 대상으로 최신 KOPIS 공연·가격·시설 데이터 일치 여부를 확인하고 사용자의 명시적 준비 동작으로 시연 매물 1매를 연결한다. 실제 개별 회차가 미확인이라 회차는 시연·미확인으로 표시하며 날짜나 좌석번호를 임의로 확정하지 않는다. 결제·전달도 시연이다. 반복 요청은 중복 매물 없이 기존 상태를 보존한다.
- 실제 검증 근거: KOPIS 실응답 전석 40,000원·1관 120석·요일별 시간 안내, 공식 예매처 HTTP 403. 기존 서버의 주문·시연 결제 상태 흐름과 사용자 계정 보존 방식 확인.
- 남은 미확인 사항: 실제 회차·좌석 배치 및 실제 재고, KOPIS 자료의 최신성·권리, 앱 화면·교차 거래 테스트.
- 다음 행동: 검증 실패 시 명시적으로 보류하는 시연 연결 및 회귀 테스트.

### [AID-20261107-CODEX-026] 마흔에 서 시연 매물·구매 완료 1차 연결
- 날짜·시각·시간대: 2026-11-07 16:40 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·서버 담당·앱 담당·웹 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-025
- 유형: 완료
- 담당 파일·수정 범위: server/src/market.ts·market-core.ts·http.ts·test/kopis-demo-market.test.ts, mobile/src/market/api.ts·engine.ts·ui/ShowArt.tsx·app/(tabs)/index.tsx·sell.tsx·app/performance-listings/[id].tsx·item/[id].tsx·checkout/[id].tsx·관련 테스트, web/src/components/ServerMarketplace.tsx. 기존 계정·주문·매물 데이터 보존.
- 내용: 사용자가 로그인 후 PF305681 매물 화면에서 시연 준비를 누르면 최신 KOPIS 제목·기간·가격 원문·공연장 ID·시설 120석·시간 안내를 엄격 대조하고 시연용 전석 1매를 생성한다. 회차는 '시연 회차 · 실제 일정 미확인', startsAt=null, 좌석번호 없음, 실제 예약·금전 이동 없음. 시연 기준가는 KOPIS 가격 안내 기반으로 표시하며 실제 판매 정가로 확정하지 않는다. 동일 시점 반복 요청은 기존 진행 매물 반환, 거래 완료 후 명시적 재요청에만 새 시연 생성. 기존 주문 이력 보존. 사용자 서버에는 아직 시연 생성 동작을 실행하지 않았음.
- 실제 검증 근거: 서버 전체 110개 테스트·typecheck, 앱 111개 테스트·typecheck·lint, 웹 52개 테스트·typecheck·lint·build 통과(웹 기존 경고·대형 청크 경고 유지). 격리 메모리 서버에서 실제 KOPIS 응답으로 준비 200 → 시연 주문 201 → 수령 확인 200/settled → 재준비 200·새 매물 확인, 실제 돈 이동 없음. 서버 테스트에서 인증·변경/오래된 자료 거절·중복·저장 실패 롤백·실제 시연 주문 확인. D2 Release build·install·launch 성공(evidence/releases/20261107-163555/); 비로그인 시연 진입 화면 직접 확인(demo-entry.png), 로그인 후 D2 실제 준비·결제 터치 및 웹·D2 실제 교차 조작은 미검증. 서버 재시작으로 메모리 세션·인증번호 만료. 초기 포스터 타입 위치 오류는 수정 후 전체 검사 통과.
- 남은 미확인 사항: 실제 회차·좌석배치·등급별 실제 수량·재고, KOPIS 정보 권리·변경, 실제 결제/양도, 다른 공연 일반화, 배포. 예매처가 변경되거나 KOPIS 응답이 사전 확인 조건과 다르면 시연 준비를 거부한다. 앱 UI 실제 거래 조작 및 독립 검토 미수행. D01~D08 출처·시연 표시 유지, D09 실제 기기 접근성 미검증, D10 신규 API 및 미설정 오류·회귀 확인, D11 기존 모션 축소 유지, D12 새 의존성 없음.
- 다음 행동: 사용자가 D2 로그인 후 해당 공연 매물 화면에서 시연 준비와 구매 완료를 확인하고, 공식 회차 자료를 확보해 실제 일정으로 대체할지 별도 검증한다.

### [AID-20261107-CODEX-027] 공연 매물 목록·상세 시각 위계 개선 착수
- 날짜·시각·시간대: 2026-11-07 18:30 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-026
- 유형: 착수
- 담당 파일·수정 범위: mobile 공연 매물 목록과 매물 상세 화면, 관련 테스트 및 D2 Release. 데이터·결제·서버 계약은 유지.
- 내용: 사용자 스크린샷에서 정보가 텍스트 중심이며 매물 상세 포스터·제목이 너무 작다는 피드백 확인. 실제 KOPIS 포스터와 공연명·가격·시설 객석을 명확히 구분하고 시연·좌석 미확인·오류·빈 상태를 보존한다. 모션은 기존 Reduce Motion 대응 컴포넌트 사용.
- 실제 검증 근거: 사용자가 시연 매물 상세까지 진입한 화면을 제공해 해당 단계 표시 확인. 결제 완료까지 사용자 실조작은 미확인. Expo 58·React Native 이미지 문서, Apple 접근성 지침 및 프로젝트 디자인 토큰 확인.
- 남은 미확인 사항: 변경 후 D2 화면·스크롤·큰 글자, 이미지 실패 상태와 구매 동작 유지.
- 다음 행동: 화면 위계 구현·테스트·D2 설치·시각 점검.

### [AID-20261107-CODEX-028] 공연 매물 목록·상세 시각 위계 개선
- 날짜·시각·시간대: 2026-11-07 18:35 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-027
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/app/performance-listings/[id].tsx·app/item/[id].tsx·__tests__/market.test.tsx. API·서버·거래 데이터는 변경하지 않음.
- 내용: 목록에 KOPIS 포스터·공연명·장소와 가격·안내 좌석·공연장 객석 규모를 묶고 매물 영역·시연 준비 CTA를 분리했다. 상세 포스터를 36pt에서 96×128pt로 늘리고 공연명·장소·시연 회차·좌석을 별도 행으로 표시했다. KOPIS 시설 좌석과 실제 매물·시연의 의미, 불명확한 회차와 결제 안내 유지.
- 실제 검증 근거: 앱 테스트 111개·typecheck·lint 및 D2 Release build·install·launch 통과(evidence/releases/20261107-183346/). 실제 로컬 시연 매물의 목록·상세를 D2 딥링크로 열어 포스터·공연 정보·가격·시연 표기 직접 확인(listings.png·item.png). 구매 버튼 터치·거래 완료는 이번에 재검증하지 않음. 서버 재시작 없음.
- 남은 미확인 사항: 구매 완료 실조작, 빈 목록·오류의 D2 실제 화면, 큰 글자·스크린리더·다른 기기. D01~D08 기존 토큰·KOPIS 출처·시연 표기 유지, D09 레이아웃 확장 및 라벨 유지하나 접근성 기기 검증 미실시, D10 기존 API·회귀 유지, D11 Appear의 ReduceMotion.System 적용, D12 새 의존성 없음.
- 다음 행동: 사용자가 D2 화면을 확인하고 시연 구매를 진행할 수 있다.

### [AID-20261107-CODEX-029] GitHub 저장소 연결 준비
- 날짜·시각·시간대: 2026-11-07 19:10 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·앱/웹/서버 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-028
- 유형: 착수
- 담당 파일·수정 범위: 로컬 Git 메타데이터·.gitignore·업로드 후보, GitHub 저장소 공개 범위. 기존 소스·계정·서버 데이터 보존.
- 내용: 사용자 생성 daoulee/ticket-radar 연결 요청. GitHub에서 빈 public 저장소임을 확인했고 사용자는 비공개 전환 후 업로드를 선택했다. 키·개인정보·생성 파일을 점검하고 업로드 후보를 준비한다.
- 실제 검증 근거: GitHub 연결 도구에서 저장소 비어 있음·소유자 권한 확인, Git CLI는 미초기화, 로컬 gh 인증 토큰 만료. 환경 설정에서 찾은 비밀값의 코드 및 문서 내 일치 파일 0건(값 출력하지 않음). GitHub 설정 화면은 비공개 전환 시 Advanced Security 비활성화 및 기타 영향을 안내함.
- 남은 미확인 사항: 비공개 전환 최종 상태, 실제 인증 방식·업로드, 이진 자료와 협업 로그의 업로드 적합성.
- 다음 행동: 로컬 업로드 목록과 제외 규칙 검토 후 비공개 전환 및 푸시를 검증한다.

### [AID-20261107-CODEX-030] 비공개 GitHub 저장소 첫 업로드
- 날짜·시각·시간대: 2026-11-07 19:18 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·Astra·앱/웹/서버 담당 (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-029
- 유형: 완료
- 담당 파일·수정 범위: .gitignore·로컬 Git 메타데이터·GitHub main. 기존 프로젝트 파일 보존.
- 내용: 사용자 선택에 따라 GitHub 설정에서 private 확인 후 로컬 main을 초기화하고 origin을 사용자 지정 저장소로 연결했다. 웹·앱·서버·공유 코드와 기획·디자인 문서 328개를 첫 커밋으로 올렸다. 환경변수·인증서·서버 사용자 데이터·시연 캡처·실행 기록·평가 결과는 Git 제외이며 로컬에는 보존했다. 기존 mobile/ios·android 제외 규칙도 유지했다.
- 실제 검증 근거: GitHub 설정 화면에서 currently private 확인, 초기 커밋 ba64d4c를 origin/main으로 푸시하고 git ls-remote의 일치 확인. 로컬 환경 비밀값 대조 시 후보 코드·문서 일치 0건, 제외 경로 check-ignore 확인. gh CLI 인증은 실패했으나 Git credential helper의 dry-run 및 실제 push 성공. Github 전환 화면은 Advanced Security 비활성화 가능성을 안내했으며 세부 설정은 재확인 필요.
- 남은 미확인 사항: 자동 비밀 검색은 완전 검토가 아님, GitHub Actions 및 다른 팀원 clone·빌드·iOS 재생성 미검증, 저장소 보안 기능의 현재 상태와 팀원 접근 초대 미확인.
- 다음 행동: 팀원에게 비공개 저장소 접근 권한을 설정하고 새 환경에서 설치·실행을 확인한다.

### [AID-20261107-CODEX-031] 거래 완료 체크 모션 개선 착수
- 날짜·시각·시간대: 2026-11-07 19:40 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-030
- 유형: 착수
- 담당 파일·수정 범위: mobile/src/ui/motion.tsx·app/order/[id].tsx 및 관련 검증·D2 Release. 거래 상태·계정·서버 유지.
- 내용: 사용자 실제 D2 화면에서 시연 거래 수령 확인 후 거래 완료가 표시됨을 확인. 체크의 스프링과 중첩 진입 모션을 줄이고 동작 줄이기 지원을 유지한다. 사용자가 주최 측 시연 계정 설정을 질문했으며 비밀값을 기록하지 않는다.
- 실제 검증 근거: CheckDraw의 스프링(damping 10)과 상위 Appear 중첩 확인. server/.env에 담당 계정 설정 항목이 존재하며 앱은 실제 서버 모드, 기본 내장 fixture 자격증명과 일치하지 않음(비밀값 비노출).
- 남은 미확인 사항: 수정 후 D2 애니메이션·접근성, 현재 서버의 담당 계정 실제 로그인 및 담당 공연 범위.
- 다음 행동: 완료 모션 개선·테스트·D2 설치, 계정 확인 방법 안내.

### [AID-20261107-CODEX-032] 거래 완료 체크 모션 및 담당 계정 확인
- 날짜·시각·시간대: 2026-11-07 19:45 KST (UTC+09:00)
- 작성자 / 실제 모델: Codex / GPT-6 기반, 세부 모델 ID 미확인
- 수신 대상: 사용자·앱 담당·서버 담당·Astra (수신 확인 없음)
- 작업 ID / 참조 기록: CODEX-031
- 유형: 완료
- 담당 파일·수정 범위: mobile/src/ui/motion.tsx·app/order/[id].tsx. 서버 설정·계정·거래 데이터 변경 없음.
- 내용: 거래 화면의 체크에 한해 0.96→1.0의 200ms 타이밍과 260ms 체크 그리기를 적용하고 중첩 Appear 이동을 제거. ReduceMotion.System 유지. 사용자 스크린샷으로 PF305681 시연 수령 확인 후 완료 화면이 표시된 것 확인. 시연 담당 계정은 AKMU 및 별도 가상 공연에 배정되어 PF305681 배정 없음. 거래 화면의 문제 신고 행이 담당자 로그인 화면으로 이동하는 현 상태도 확인했다. 비밀 코드 기록 없음.
- 실제 검증 근거: 앱 전체 111개 테스트·typecheck·lint, D2 Release build·install·launch 통과(evidence/releases/20261107-194146/). 기존 완료된 시연 거래를 D2 딥링크로 열고 녹화·샘플 프레임 확인(order-motion.mp4); 체크가 최종 상태로 표시되고 지속적인 튀기는 움직임은 샘플에서 보이지 않았다. 버튼을 눌러 sent→settled 전환하는 실제 모션 재실행은 하지 않았다.
- 남은 미확인 사항: 수령 버튼 직후 전환과 동작 줄이기 실조작, 주최 계정 실제 로그인·PF305681 제보 처리, 사용자 지시가 필요한 해당 경로 수정. 자동 테스트·기기 영상 확인은 독립 검토를 뜻하지 않음.
- 다음 행동: 사용자에게 D2에서 체크 모션 확인을 안내하고, 로컬 담당 코드 확인 방법과 해당 공연 미배정을 설명한다.
