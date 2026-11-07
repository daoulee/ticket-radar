# AID 해커톤 · 티켓레이더 준비

공식 최초 예매와 원구매가 동일 개인 양도를 중심으로 하는 티켓 플랫폼이다. 현재 대회용 구현은 가상 공연·좌석·매물을 사용하고 결제 직전까지 시연한다. 판매글과 공식 안내 대조는 부가 기능이다. [최신 방향과 범위](docs/MARKETPLACE_DIRECTION.md).

## 시작 위치와 현재 상태

```sh
cd /Users/daoule/Desktop/AID
```

사용자가 지정한 개발 작업 루트다. 웹·앱 담당의 착수 기록과 `web/`, `mobile/`의 프로젝트 파일 생성을 확인했다. 제품 구현은 진행 중이며 완료 여부는 아직 독립 검증하지 않았다. 웹 Vite/React/TypeScript와 앱 Expo/React Native/TypeScript의 분리 개발 방향을 [PLAN](PLAN.md)에 기록했다. 설치·실행 명령은 실제 검증한 뒤 추가한다. Git 초기화·배포·제출은 이번 Astra 작업에서 수행하지 않았다. 각 담당자의 패키지 설치·빌드 상태는 해당 기록으로 확인한다.

## 디렉터리

```text
AID/
├── README.md
├── AGENTS.md
├── PLAN.md
├── SPEC.md
├── RESEARCH.md
├── memory.md
├── Communicate.md
├── src/
│   ├── ui/             # 화면·상호작용
│   ├── domain/         # 핵심 규칙·계산
│   └── data/           # 외부 API·저장소 접근
├── tests/              # 검증 코드 예약
├── assets/             # 제품 이미지·아이콘
├── data/fixtures/      # 표시된 합성 테스트 입력
├── scripts/            # 반복 실행 도구 예약
├── docs/
│   ├── reference/      # 기존 기획·포스터 사본
│   └── official/       # 공식 대회 자료 안내
├── evidence/
│   ├── screenshots/   # 실제 확인한 화면
│   └── logs/          # 실제 실행 결과
└── submission/         # 최종 제출 후보
```

코드 디렉터리는 책임 분리용 예약 구조다. 프레임워크가 확정되면 조정할 수 있다. `.gitkeep`은 빈 폴더 보존용 파일이다.

## 작업 전 읽기

[AGENTS](AGENTS.md) → [최신 협업 기록](Communicate.md) → [인계](memory.md) → 작업 관련 [기획](PLAN.md)·[명세](SPEC.md)·[근거](RESEARCH.md) 순서로 읽는다.

상세 기획은 [기존 명세](docs/reference/티켓레이더_팀공유_기획기술명세.md)를 재사용한다. 기존 [PDF 포스터](docs/reference/티켓레이더_아이디어_포스터.pdf)·[PNG 포스터](docs/reference/티켓레이더_아이디어_포스터.png)는 아이디어 자료다. 원본은 바탕화면의 `AID_해커톤_티켓레이더_공유자료`에 보존했다. 신규 결정·변경은 이 AID 폴더에서 관리한다.

## 다음 단계

Sol의 공통 입력·출력 계약 합의와 실제 데모 공연 확정 → 웹 핵심 흐름 검증 → 같은 사례로 앱 검증 → 통합·제출물 확인. 각 담당은 계약 전 합성 fixture 기반 독립 작업을 시작할 수 있다. 최종 제출 일정·평가 기준·AI 세부 규칙은 RESEARCH의 미확인 항목을 확인한다.

## 검증 상태

| 항목 | 상태 |
| --- | --- |
| 디렉터리·문서 | 세팅, 실제 검사 결과는 Communicate 기록 참조 |
| 제품 코드 | 웹·앱 스캐폴딩 진행 중, 완성 동작 미확인 |
| 테스트·빌드 | Astra 응답 검증기 자체 테스트 12개 통과; 제품 테스트·빌드는 미확인 |
| 화면·실기기 | 미검증 |
| 배포·대회 제출 | 미수행; 이전 신청 접수 여부는 미확인 |

## 통합 응답 검토 도구

[사용 방법과 범위](tests/integration/README.md). 설치 없이 Python 표준 라이브러리로 실행한다.

```sh
python3 -m unittest discover -s tests/integration -p 'test_*.py' -v
python3 tests/integration/check_api.py --response tests/integration/demo-check.json
```

합성 응답을 대상으로 검증 도구 자체를 확인한 단계다. 실제 서버 연동·AI 추출·공식 출처·화면·실기기 성공을 뜻하지 않는다.

## 검토용 목업

- [Pen 편집형 전체 화면](docs/mockups/티켓레이더_전체흐름.pen): 모바일 6개·팬 웹 4개·운영 웹 4개·공통 상태 4개의 독립 화면과 화면 지도를 담은 정적 목업. 실제 제품 API와 연결되지 않는다.
- [화면 지도 PNG](docs/mockups/티켓레이더_화면지도_미리보기.png), [화면 목록](docs/mockups/SCREEN_MAP.md): MVP와 후속 시안 구분.
- [모바일 4단계와 웹 대조 화면 전체 흐름](docs/mockups/ticket-radar-full-flow.html): 로컬 HTML 목업. 단계 버튼은 다음 화면 위치로 이동한다. 가상 공연·합성 판매글을 사용하며 제품 API와 연결되지 않는다.
- [Figma 첫 시안](https://www.figma.com/design/yowOBv5AJHxweH2dFt0YUT): 판매글 입력·대조 결과 두 화면을 편집 가능한 레이어로 제작한 초기 시안.

## AI 팀 실행

[Astra가 관리하는 팀 실행기](automation/README.md): Sol·Opus Web·Opus App 작업 배정, 세션 재개, 결과 검토. 초기 모드는 읽기 전용/패치 제안 방식.

## 디자인 지침

[전체 UI/UX·Splash 지침](docs/design/DESIGN_SPEC.md) · [앱/사이트·공식 코드 레퍼런스](docs/design/REFERENCE_GUIDE.md) · [담당자 작업 순서](docs/design/IMPLEMENTATION_TASKS.md)

## 공개 웹 시연

[Ticket Radar — 공개 시연 사이트](https://ticketradar.daoule-6b5.workers.dev)

2026-11-02 Cloudflare 정적 배포. 실제 AI/API 미연결, 합성 fixture 시연. 최신 앱 목업의 웹 이식은 별도 남음. 배포·공개검증 기록은 web/evidence/deployment/ 및 web/README.md 참고.

- [할 일 목록(TODO.md)](TODO.md) — 남은 작업·사용자 결정 항목 (2026-11-03~)
