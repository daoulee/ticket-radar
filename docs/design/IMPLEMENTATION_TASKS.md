# 디자인 작업 배정 · Astra → Sol / Opus Web / Opus App

공통 선행 읽기: AGENTS.md → Communicate.md 최신 → DESIGN_SPEC.md → REFERENCE_GUIDE.md → tokens.json → 각 담당 현재 코드. 사용자는 네이비·민트의 검사 도구 인상과 Splash부터 일관된 UX 기획을 요청했습니다. 원래 앱의 파란 테두리·큰 노란 안내·반복 카드를 그대로 색만 바꾸는 것으로 전체 완료 처리하지 않습니다.

## 소유권과 인계

- Astra: 본 문서/공통 지침/토큰·레퍼런스, 패치 검수·통합·독립 화면 검사.
- Sol: shared/server는 그대로 유지, 데이터·표시 의미 감사. 디자인 변경을 이유로 API를 조용히 수정하지 않음.
- Web: web/의 Vite React TS, DOM/CSS·반응형·웹 모션·상태 화면.
- App: mobile/의 Expo58 RN TS, native/JS 시작 화면 구분·모션·터치·키보드·앱 접근성.
- 팀 실행기의 작업자는 읽기 전용으로 최소 patch를 반환. Astra가 소유 경로를 검토·적용합니다. 기존 별도 대화 세션과 중복 수정하지 않음.

## D0 · Sol · 표시 의미 검토

입력: DESIGN_SPEC D01~D12, shared/index.ts, 웹/앱 모드·결과 표시 코드.
출력: 시연/API/AI/수동/비교 보류/공식 scope가 새 설계에서 왜곡될 수 있는 곳과 필수 회귀 사례. REF-F의 색상이나 상태 용어를 티켓 안전 판정으로 쓰지 못하게 확인. 우선순위별 blocker와 권고 구분.
완료: 계약 변경 없음, 정확한 필드→화면 의미 표, 실 AI 미검증 명시.

## D1 · Web · 공통 토큰·브랜드 모션

참고: REF-L Linear Mobile https://linear.app/mobile, REF-F Flighty https://flighty.com/.
코드: 기존 index.css/App.tsx/common.tsx + CODE-D prefers-reduced-motion. 타사 앱 코드 복제 아님.
입력: tokens.json, DESIGN_SPEC 2~4.
출력: 토큰/밝은 테마 일관화, 작은 레이더 브랜드 진입 1회, no-preference만 모션. 폼/요청을 지연하지 않고 pointer-events로 방해하지 않음.
범위: web/만, API/계약·이전 응답 무효화는 유지. 새 dependency 없음.
검증: 기본/축소모션, 컴포넌트·빌드, before/after 스크린샷. D1만으로 전체 리디자인 완료 아님.

## D1 · App · 토큰·브랜드 진입

참고: 같은 REF-L/F. 코드: theme.ts/common.tsx/_layout.tsx/index.tsx, CODE-A/B Animated/AccessibilityInfo, CODE-C Expo SplashScreen.
출력: 토큰 매핑, 작고 정적인 기본 레이더 심벌+최대700ms 장식 모션. 설정 조회 전/실패/축소모션은 정적. 첫 화면/입력/공연 조회 즉시 사용 가능. unmount·설정 변경 시 animation/listener 정리.
이번 D1은 JS 브랜드 진입. 네이티브 launch 구성과 Release 영상은 D3에서 별도. 미설치 expo-splash-screen을 임의 import하지 않음.
검증: 타입·lint·Jest, 축소모션/정리/첫 화면 즉시 사용. 설치/의존성 변경 없음.

## D2 · Web/App 각 담당 · 4단계 핵심 화면과 상태

D1 검수 후 진행합니다. DESIGN_SPEC S01~S07 전부를 준수.
- S01: 작은 모드 배지, 짧은 제목, 행 중심 공연 선택. 시연 도구는 접기.
- S02: 선택 공연 요약+입력 영역+개인정보 안내+1개 CTA. 모드/합성 여부 노출.
- S03: 12개 입력 필드의 의미·원문 근거를 유지하면서 행/그룹으로 정돈. manual 문구 분기. 원문/후보/수정값 구분.
- S04: 핵심 금액 또는 보류 이유→확인 사항→원문/공식 근거→수정 행동. 공식/입력/AI 출처를 서로 혼동하지 않음.
- S05~07: 전체 원문·출처 세부 접기, 입력 보존 오류/409 복구, 예시·실패 시연 도구 메뉴.
완료: 디자인 D01~D12 표와 각 화면 정상/보류/오류 증거. UI 레이블 변경으로 테스트 선택자를 바꿀 수 있지만 검증 의미를 낮추지 않습니다.

## D3 · App · 네이티브 시작 화면/Release

설치된 SDK·직접 dependency·현재 native launch 자산부터 확인. expo-splash-screen 추가가 필요하면 필요한 변경을 Astra에게 인계하고 기존 네이티브 폴더를 임의 초기화하지 않음. 정적 네이티브 launch→JS 첫 화면의 배경/심벌이 이어지는지 실제 D2 Release 녹화로 검증. D2는 iOS27 시뮬레이터이며 실기기 결과로 보고 금지. 앱 전체 동작은 Metro가 없는 Release에서도 확인.

## D4 · Astra · 최종 디자인 검수

웹 360/390/768/1280 + reduced motion + 키보드, 앱 D2 Release + 큰 글자/키보드/모션 축소. 현재 실제 AI 미설정 수동 경로와 fixture 경로를 분리합니다. 출처 정확성·조건 보류·수정 적용·늦은 응답 방지 회귀. 구현/단위/빌드/시각/실기기/배포를 분리 보고. 이전 D2 설치본은 새 빌드 설치 전까지 구 디자인입니다.

## 담당자 보고 형식

1. 작업 ID, 실제 모델 근거, 읽은 REF/CODE ID.
2. 변경 파일과 이번 단계 범위.
3. D01~D12 준수표 (확인된 근거/미확인 포함).
4. 실행한 명령·결과·화면 경로. 실행하지 않은 결과는 ‘미실행’.
5. 남은 blocker와 다음 인계. 외부 세션 수신/작업 시작은 실제 실행 결과가 있을 때만 기록.
