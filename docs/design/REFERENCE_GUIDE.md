# 티켓레이더 디자인 레퍼런스 · 2026-11-02

이 문서는 별도 Sol/Opus 세션도 사용자의 문제와 디자인 결정을 이해하도록 작성했다. 기존 D2 Release 첫 화면이 큰 파란 테두리 버튼·노란 안내 박스·반복 카드 때문에 쇼핑몰처럼 보인다는 사용자 피드백이 출발점이다. 목표는 결제 전 판매글과 공식 근거를 확인하는 차분한 도구다.

## 제품 레퍼런스: 어디에서 무엇을 볼 것인가

| ID | 앱/사이트 | 방문 URL | 실제 확인 | 티켓레이더 적용 |
|---|---|---|---|---|
| REF-L | Linear Mobile / Linear 공식 사이트 | https://linear.app/mobile | 공식 소개와 Inbox 이미지 시각 확인. https://static.linear.app/assets/web/mobile/InboxImage%402x.A21B86DC-65CB-4858-8DF5-2781284CAA0D.jpg | 상하 위계, 행 중심 목록, 절제된 강조. 첫 화면 공연 목록·검토 항목에 적용 |
| REF-F | Flighty / Flighty 공식 사이트 | https://flighty.com/ | 공식 소개의 지연 사유 화면 시각 확인. https://framerusercontent.com/images/EYRTweVcYensHCiPomDgYWfLKpw.webp?height=846&width=680 | 핵심 수치→상태 이유→세부 정보 위계. 결과 요약·비교 보류 사유에 적용 |
| REF-P | Perplexity / 공식 모바일 소개 | https://www.perplexity.ai/mobile | 소개 페이지 접근 확인. 상세 최신 앱 흐름은 직접 확인하지 않음 | 입력 중심 첫 화면의 보조 후보. 확인하지 않은 인터랙션을 복제하지 않음 |
| REF-W | Wise Design | https://wise.design/ | 랜딩은 JS 필요. docs.wise.design 및 /foundations/colour는 404로 확인 | 필수 근거에서 제외. Wise 고유 색·폰트·컴포넌트를 그대로 가져오지 않음 |
| REF-M | Mobbin | https://mobbin.com/ | 공개 소개만 확인, 로그인 뒤 전체 라이브러리 미열람 | 추후 추가 참고. 유료 흐름을 본 것처럼 보고 금지 |

위 앱의 **소스 코드를 확보한 것은 아니다**. 화면 구성 원리만 참고한다. 타사 로고·스크린샷·폰트·코드를 제품 자산으로 복사하지 않는다. 네이비/민트 토큰은 Astra의 티켓레이더 자체 제안이다. 레이더 심벌은 원·선·점으로 직접 그린다.

## 실제 코드 참조: 공식 문서와 프로젝트 파일

| ID | 문서/코드 | 가져올 개념 | 주의 |
|---|---|---|---|
| CODE-A | https://reactnative.dev/docs/animated | useRef(new Animated.Value), Animated.timing, opacity/transform, useNativeDriver | 타이머·애니메이션 정리. 결과 도착 여부를 애니메이션 콜백에 묶지 않음 |
| CODE-B | https://reactnative.dev/docs/accessibilityinfo | isReduceMotionEnabled, reduceMotionChanged | 설정 조회 전에는 정적 표시, 실패하면 정적 유지. 런타임 변경 시 정지 |
| CODE-C | https://docs.expo.dev/versions/v58.0.0/sdk/splash-screen/ | 네이티브 시작 화면과 숨김 시점, config plugin | 실제 package.json의 SDK58 기준. 네이티브 설정 변경은 Release 재빌드 필요. Expo Go/개발 빌드만 보고 완료 금지 |
| CODE-D | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion | 웹 모션 축소 | 기본 정적, no-preference에서만 장식 애니메이션 허용 |
| CODE-E | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details | 출처 세부 접기 | 원문/링크가 필요 시 키보드로 접근 가능. 핵심 경고는 접지 않음 |
| HIG-L | https://developer.apple.com/design/human-interface-guidelines/launching | 빠른 진입, 첫 화면과 이어지는 시작 화면 | 공식 Markdown /launching.md를 실제 읽음. 네이티브 시작 화면에 광고·진행률 표시하지 않음 |
| HIG-A | https://developer.apple.com/design/human-interface-guidelines/accessibility | 지각 가능성·적응성·간결한 상호작용 | 공식 Markdown /accessibility.md 실제 읽음. 색만으로 상태 표시 금지 |

0.88이 표시된 React Native 공식 문서를 확인했다. /docs/0.88/ 경로 일부는 도구에서 접근되지 않아 현재 문서 링크를 사용했다. 구현 전 설치 버전의 API 타입도 확인한다. 설치되지 않은 Reanimated/Lottie/아이콘 패키지를 추가하지 않는다.

프로젝트 읽기 순서:
1. `shared/index.ts`: provenance/extraction/held/confirmedFields 의미. 디자이너도 확인.
2. 앱 `mobile/src/ui/theme.ts`, `components/common.tsx`, `app/_layout.tsx`, `components/ReviewForm.tsx`, `components/ResultView.tsx`.
3. 웹 `web/src/index.css`, `App.tsx`, `components/ReviewStep.tsx`, `components/ResultStep.tsx`, `components/OfficialPanel.tsx`.
4. 기존 회귀 `web/e2e/server.spec.ts`, `mobile/__tests__/httpFlow.test.tsx`, `mobile/e2e-ios/TicketRadarUITests/ManualFlowUITests.swift`.

공식 예제는 API 사용법을 참고하는 자료다. 보이지 않는 타사 내부 코드나 새로운 SDK API를 추정해서 만들지 않는다.

## 자체 심벌 원본

`docs/design/radar-mark.svg`는 Astra가 이 프로젝트를 위해 원·선·점으로 작성한 64×64 원본이다. 타사 자산이 아니다. 웹은 SVG, 앱은 기존 View 기반 원/선 또는 승인된 SVG 렌더링으로 같은 비례를 유지한다. D1에서 패키지 추가 없이 심벌을 구현할 수 있으며, 최종 네이티브 launch 이미지 제작은 D3에서 이 원본을 기반으로 한다. 상표 등록/독창성 법률 검토 완료를 뜻하지 않는다.
