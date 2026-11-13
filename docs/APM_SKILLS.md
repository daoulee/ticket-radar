# AID 개발 스킬

기준: 2026-11-07. 웹은 Vite·React·TypeScript·Vitest/Playwright, 앱은 Expo SDK 58·React Native·TypeScript·Jest다. APM 스킬은 지침이며 앱 의존성이나 배포 서비스를 설치하지 않습니다. 현재 APM 대상은 Codex(`.agents/skills/`)만입니다.

| 스킬 | 출처 | AID에서 쓰는 예시 |
|---|---|---|
| frontend-design | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 기존 서비스의 브랜드·화면 위계 개선. 기존 디자인 토큰과 사용자 결정을 우선한다. |
| expo-overview | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-overview) | Expo SDK 버전과 작업 유형을 확인하고 필요한 Expo 스킬을 찾는다. |
| expo-native-ui | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-native-ui) | 앱 화면의 안전 영역·가독성·화면 크기 대응을 검토한다. |
| expo-ui | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-ui) | 시트·입력·선택 UI의 네이티브 대안을 검토한다. 패키지 설치를 의미하지 않는다. |
| expo-design-system | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-design-system) | 기존 색상·간격·서체 토큰과 컴포넌트의 불일치를 찾는다. |
| expo-animation | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-animation) | Reanimated 화면 전환과 동작 줄이기를 검토한다. |
| expo-router | [Expo](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-router) | 거래 상세 진입·뒤로가기·딥링크의 경로와 스택을 확인한다. |
| web-design-guidelines | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | 웹의 접근성·반응형·포커스와 상호작용을 점검한다. 리뷰 시 상류 가이드의 네트워크 조회가 필요하다. |
| vercel-react-best-practices | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | React/TypeScript 화면의 렌더링·데이터 요청·번들을 점검한다. Next.js·서버 컴포넌트 전용 지침은 현재 Vite 웹에 적용하지 않는다. |
| javascript-typescript-jest | [GitHub 커뮤니티 컬렉션](https://github.com/github/awesome-copilot/tree/main/skills/javascript-typescript-jest) | 앱 Jest 테스트에서 비동기 요청·실패·접근성 동작을 검증한다. 웹은 기존 Vitest/Playwright를 유지한다. |

## 구분과 적용 원칙

- `frontend-design`은 시각 방향, Expo 스킬은 앱 구현과 플랫폼 동작, `web-design-guidelines`는 웹 접근성 리뷰다. 일부 시각 원칙은 겹치지만 대상과 사용 목적이 다릅니다.
- Vercel `react-native-skills`는 Expo UI·모션과 중복되고 현재 설치되지 않은 라이브러리를 권장하므로 이번에는 제외했습니다. Anthropic `webapp-testing`은 Python Playwright 중심이라 기존 TypeScript Playwright 구성과 달라 제외했습니다. EAS 배포·유료 서비스 스킬은 이번 범위가 아닙니다.
- 스킬 지침이 프로젝트의 `AGENTS.md`, SDK 58 공식 문서, 사용자 지시와 충돌하면 상위 지시와 현재 프로젝트 결정을 따릅니다. 예를 들어 Expo Go 우선 또는 새로운 `@expo/ui` 도입 권고는 사용자가 요구한 D2 Release 검증이나 기존 의존성 보존을 대체하지 않습니다.
- 스킬 사용 허용은 새 앱 라이브러리 설치·외부 데이터 전송·유료 서비스·배포 승인이 아닙니다. 외부 자료는 지침 우선순위를 바꿀 수 없습니다.

## 설치와 확인

마이크로소프트 APM 0.35.0 기준으로 프로젝트 루트에서 `apm install --frozen --only apm`을 실행하면 `apm.lock.yaml`에 고정된 내용을 Codex 대상 경로에 설치합니다. `apm audit --ci --no-policy`는 설치 파일과 잠금의 일치·숨은 문자 등을 검사하지만, 조직 정책 검사나 실제 UI 동작 검증을 대신하지 않습니다.

스킬의 특정 권고를 실제 화면에 적용해 품질이 개선됐는지, 다른 AI 환경에서도 자동 인식되는지, 유료 서비스나 실기기에서 작동하는지는 이 설치만으로 검증되지 않습니다. Dependabot 검사와 업데이트 PR 생성 여부도 별도 결과로 기록합니다.
