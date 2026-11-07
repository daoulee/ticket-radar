# WEB-005 Astra 검토 · 2026-11-01

판정: AI 미설정 상태에서 웹과 Sol 실서버의 수동 대조 흐름은 독립 재검증 통과. 실제 AI 및 제품 전체 최종 승인은 아님.

## 직접 실행한 검증
- web `npm test`: 35/35 통과.
- web `npm run build`: TypeScript + Vite 통과.
- web `npm run e2e -- --project=server-chrome --project=server-webkit-iphone --output=../evidence/astra-web-20261101`: 2/2 통과(7.6초). 실제 Chrome 및 iPhone 크기 WebKit, 물리 iPhone/Safari 앱 아님.
- 최초 E2E는 샌드박스 localhost:5179 listen EPERM으로 시작 실패. 권한 승인 후 동일 명령 성공. 제품 실패와 구분.
- 공연/공식 자료 조회, AI_NOT_CONFIGURED, 명시적 수동 입력, 조건 누락 보류, +74000원 비교, 200000원 수정 후 +24000원 재대조, 회차 누락·공연 불일치 보류 검증.
- 현재 웹 App/HTTP 어댑터/공통 스키마 추가 검사/실서버 테스트 소스 검토. 재생성된 모바일 결과 PNG를 직접 열어 화면 확인.
- 산출물: evidence/astra-web-20261101/ 브라우저 영상과 web/evidence/screens/server-*/ 화면. 기존 E2E의 화면 경로는 재실행으로 갱신됨.

## 웹 담당 후속 요청
1. W1(P2): web/src/components/common.tsx DemoBadge의 isDemo=true title이 '실제 공연·가격·규정이 아닌 시연용 합성 데이터'로 고정됨. 실제 공식 자료 + 합성 판매글에도 해당 문구가 붙어 출처를 오해하게 함. '합성 판매글 또는 시연 자료가 포함된 결과'처럼 정확히 고치거나 provenance에 따라 구분. 완료 기준: 공식 출처+합성 판매글에서 공식 가격/규정까지 가상이라고 설명하지 않으며 순수 fixture 표시는 유지.
2. Sol R2 수정 후 e2e/server.spec.ts의 코드 생성 문구 기대값도 실제 원문 인용에 맞춰 갱신하고 브라우저 재검증. 기존 테스트 통과는 원문 정확성 증명이 아님.
3. 실제 AI 새 문장·이전 추출 재사용·409 복구의 실서버 브라우저 검증은 남음. 현재 수동 경로의 통과로 대체하지 말 것.

## 인계
앱은 WEB-005D와 이번 검증을 기준으로 실서버 연동 진행 가능. Sol은 ASTRA-016 R1~R4 수정 착수 기록이 확인됐으며 수정 완료는 아직 별도 검토 필요. 웹/앱 담당에게 자동 전달됐다고 주장하지 않음. 제품 파일은 수정하지 않음.


## 후속 판정
2026-11-01 자동 팀 검토와 Astra 통합으로 기존 요청 및 추가 재현 결함을 보완했다. 최신 결과와 제한은 [팀 통합 기록](TEAM_INTEGRATION_20261101.md)을 따른다. 실제 AI/제품 전체 최종 승인과 구분한다.
