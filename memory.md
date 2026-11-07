# 프로젝트 인계

기준: 2026-10-28 10:05:05 KST (UTC+09:00)

- 작업 루트: `/Users/daoule/Desktop/AID`. 사용자 확인으로 제품은 아직 미구현. 별도 코드 위치 질문은 해소됐다.
- 완료 범위: AID-SETUP-001 디렉터리·공통 Markdown 기초 세팅. 기존 공통 문서를 재사용하고 협업 기록 2개를 이력으로 보존했다.
- 기존 명세·포스터 사본: `docs/reference/`. 원본 폴더와 원본 3개는 보존. 새 결정은 AID 루트 문서에서 관리한다.
- 구조: src/ui·domain·data, tests, assets, data/fixtures, scripts, docs/reference·official, evidence/screenshots·logs, submission. 프레임워크 종속 구성·제품 코드 없음.
- Git: 미초기화. 브랜치·원격 없음으로 추측하지 말고 필요 시 실제 조회. 설치·원격 변경·배포·제출 없음.
- 범위: 한 공연의 입력→AI 후보 확인/수정→공식 근거 대조를 추천 중. 기존 명세 P0 제보함의 후순위 전환과 AI 필수 여부는 최종 합의 전. 기술 스택도 미확정.
- 공식 조건: RESEARCH의 기존 조사 시점과 사본 한계 유지. 최종 일정·배점·AI 세부 규칙·신청 접수 여부는 미확인.
- 역할: 사용자 최종 결정, Astra 조율·통합, Sol 로직, Opus 독립 검토, Sonnet UI라는 계획. Astra 외 착수/수신 기록 없음. 실제 모델·도구는 각 담당자 자기 보고 필요.
- 실제 수행자: Codex Astra / 환경 지침상 GPT-6 기반 Codex, 세부 모델 ID 미노출. 이번 세팅은 셸·Python 표준 라이브러리만 사용, 스킬 적용·설치 없음. 이전 pdf 스킬 사용은 초기 조사 기록에만 해당.
- 검증: Communicate의 세팅 완료 기록에 실제 파일/링크/원본 동일성 검사 결과를 추가한다. 제품 테스트·빌드·화면 검증은 하지 않음.
- 다음: AID의 AGENTS→Communicate→본 문서 재독 후 PLAN/SPEC의 범위·스택·공통 계약 합의. 담당 경로가 바뀌면 먼저 기록.

## 2026-10-28 10:24 KST 갱신

- WEB-001/002와 APP-001/002 의견을 Astra가 검토했다. 사용자 지시는 웹과 앱을 모두 만들되 웹 시연을 먼저 검증하는 것.
- 웹 `web/` Vite/React/TypeScript, 앱 `mobile/` Expo/React Native/TypeScript로 진행한다. Sol의 공통 계약·서버 판단을 공유하며 정확한 계약·패키지 구조는 아직 확정 전이다. 기존 `src/ui/`은 활성 화면 담당 경로가 아니다.
- 두 화면은 계약 전 표시된 합성 fixture로 독립 작업 가능. 실제 API 연동·테스트·빌드·화면·실기기는 아직 검증되지 않았다.
- 두 Claude Code 담당은 역할명 Opus 1/2로 기록했으나 실제 모델을 `claude-sonnet-5-5`로 보고했다. 사용자가 의도한 Opus 실행 여부는 재확인 필요.
- 다음: Sol 계약 초안 및 담당 경로 기록 → Astra 계약 검토 → 웹 브라우저 검증 → 동일 사례 앱 시뮬레이터 검증. Android/실기기 환경은 현재 미확인 또는 미검증.

## 2026-10-28 12:42 KST · 웹·앱 1차 구현 검토

- WEB-004와 APP-004에서 각자 `claude-opus-5-5`로 보고했다. 웹·앱은 합성 fixture 기반 핵심 화면을 만들었으나 실제 API·AI 추출은 미연결이다.
- Astra가 웹 테스트 15개·빌드, 앱 타입 검사·테스트 32개, 임시 계약 사본 일치, 자체 검증기 16개와 저장 응답 18건을 직접 재확인했다. 결과 요약: `evidence/logs/astra-review-20261028-1240.json`.
- WEB/APP 계약 쟁점 `needs_check`와 unknown의 `evidenceQuote: null`을 SPEC에 결정하고 Astra 검증기를 맞췄다. Sol의 공통 타입·런타임 스키마·서버는 아직 없다. HTTP 어댑터의 중첩 응답 검증은 Sol 계약 이후 각 담당이 보완해야 한다.
- 실제 공연 후보는 YES24 AKMU 대구 공연 공식 공지로 RESEARCH E10에 기록했다. 사용자 선택·제품 적용 전이다. 현재 화면은 가상 공연과 예시 URL이다.
- 다음: Sol 착수·계약 v0 → 서버/실제 AI 추출 → 웹·앱 실 API 왕복 → 실제 공연 출처 적용·화면 재검증. 앱 직접 탭/키보드·Android·실기기·배포·제출은 미검증.

## 2026-10-28 10:34:59 KST (UTC+09:00) · Astra 통합 검증 준비

- AID-INTEGRATION-001: `tests/integration/`와 `evidence/logs/astra-integration-*`는 Astra 소유. Sol의 계약/서버와 web/mobile은 수정하지 않았다.
- 검토 CLI·합성 응답·자체 테스트 12개 구현. 자체 테스트 12개와 합성 JSON CLI exit 0. 검증 도구 설명은 tests/integration/README.md. 실제 API 호출·제품 테스트·UI·배포 확인은 하지 않았다.
- APP-003·WEB-003 착수 기록을 읽었다. 변경 후 각자 claude-opus-5-5라고 보고했다. web/package.json·mobile/package.json이 생긴 것을 확인했다. 담당자 착수 보고와 실제 제품 완료는 구분한다.
- Sol의 계약 초안·서버 주소·착수 기록은 이번 최종 확인 시점에 찾지 못했다. 검증기는 WEB-001 제안 기준이며 Sol 산출물에 맞춘 대조가 필요하다.
- 다음: Sol 계약과 타입/모드/에러/수정 왕복 합의 → 서버 응답 검증 → 웹 실화면 우선 검증 → 앱 동일 사례 대조.

## 2026-10-29 최신 사용자 우선순위
실제 AI 새 문장 추출과 웹 API 왕복 우선, 앱은 그다음. 제공자/키 미정이므로 교체형 어댑터와 AI_NOT_CONFIGURED 오류 준비. Sol shared/·server/ 최우선. docs/CORE_DEMO_HANDOFF.md 참조. 목업과 후속 기능 확장은 보류.
