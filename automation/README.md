# AID 팀 실행기

Astra가 작업 등록·담당 실행·결과 검수·재작업을 관리한다. 사용자에게 프롬프트 복사를 요구하지 않는다.

## 실제 실행 역할

- Terra 6.1: gpt-6.1-terra. 2026-11-02 사용자 지시로 기존 Sol 담당을 대체. 원본 대화 `AID 해커톤 준비해야해`의 ID/모델을 team.json에 기록. 원본을 변경하거나 동시에 재개하지 않고 자동 작업용 세션을 별도로 만든다.
- Web/App: Claude Code `opus` 요청. 연결 시험의 런타임 modelUsage는 claude-opus-5-5. 향후 alias가 다른 모델을 가리키면 각 실행 증거에서 확인한다.
- Astra: 이 대화에서 최종 검수. CLI 작업의 성공 종료를 제품 최종 승인으로 처리하지 않는다.

## 현재 동작과 경계

- 실제 CLI 실행, 담당별 자동 세션 재개, 순차 큐, 선행 작업 승인 의존성, 프로세스 잠금, 작업별 360초 한도, 최대 2회 시도, 한 번에 최대 3건.
- 작업 상태: queued → running → review_pending → verified 또는 changes_requested. 실패/시간 초과는 failed/interrupted. 자동 무한 재시도 없음.
- 검수 완료한 선행 작업만 후속 작업을 연다. 에이전트 자체 완료 주장은 review_pending이다.
- **현재 작업자는 읽기 전용이다.** Claude 도구를 Read/Glob/Grep으로 제한하고 권한 자동 우회를 사용하지 않는다. Codex는 read-only sandbox. 구현 요청에는 unified diff를 반환하게 하고 Astra가 담당 경로/변경 충돌을 확인한 뒤 반영·테스트한다. 자동으로 저장소에 패치를 적용하지 않는다.
- 역할 paths는 패치 검수 기준이다. OS 읽기 접근 제한을 뜻하지 않는다. 기존 외부 세션은 실행기 잠금에 참여하지 않는다. 같은 파일의 적용은 기존 작업이 끝난 뒤 Astra가 수행한다.
- 기존 작업 대화는 자동 가져오지 않는다. 공통 문서와 작업 지시를 읽고 별도 자동 세션에서 이어간다. CLI 기본 hooks/설정까지 완전히 격리했다고 주장하지 않는다.
- 상주 데몬·예약 실행은 설치하지 않았다. Astra가 이 대화에서 run을 시작해야 실행한다. 대화가 끝나도 계속 감시한다고 주장하지 않는다.
- 모델 로그인 실패·실행 권한 부족은 failed로 기록. 권한 우회 플래그 없이 필요한 승인을 정상 경로로 처리한다.
- 360초/시도 제한은 금액 상한이 아니다. 기존 CLI 인증/사용량을 사용하며 임의 요금제·API 키 설정 변경 없음.

## Astra가 사용하는 명령

프로젝트 루트에서 실행한다. 사용자가 직접 실행할 필요는 없다.

```sh
python3 scripts/aid_team.py add web --prompt '작업 내용과 완료 기준'
python3 scripts/aid_team.py add app --prompt '작업 내용' --after 선행작업ID
python3 scripts/aid_team.py run --limit 3
python3 scripts/aid_team.py status
python3 scripts/aid_team.py review 작업ID --decision verified --evidence '실행 로그와 파일 경로, 실제 확인 범위'
python3 scripts/aid_team.py review 작업ID --decision changes_requested --evidence '재현·수정 완료 기준'
python3 scripts/aid_team.py retry 작업ID --feedback '구체적인 수정 요청'
```

run 도중에는 큐 변경/중복 실행을 잠금으로 거부한다. 중단된 running 기록은 자동 재실행하지 않는다. 프로세스가 없는 것을 확인하고 Astra가 기록을 복구한다. 작업 ID는 상태 파일과 연결되며 `--after`에는 실제 존재하는 ID만 허용한다.

`automation/runs/<작업ID>/<시도>/`에 요청·실제 argv·CLI 출력·오류·세션 ID·확인 가능한 모델·최종 답변을 저장한다. 키·토큰을 작업 프롬프트에 넣지 않는다. 로그는 로컬 보관하며 외부 게시하지 않는다.

## 검증

```sh
python3 -m unittest discover -s tests/automation -v
```

의존성 검토 게이트, 모델 근거 추출, CLI 오류 판별, 빈 응답 실패, Codex 이벤트 해석, 권한 우회 부재 검증. 실제 최초 연결 시험의 READY 응답은 제품 코드 구현/성능 검증이 아니다.

설치된 `claude --help`, `codex exec --help`와 [공식 Codex 비대화형 실행 문서](https://learn.chatgpt.com/docs/non-interactive-mode)를 기준으로 구성했다.

## 터미널 모니터

루트의 `AID 팀 모니터.command`를 더블클릭하거나 `python3 scripts/aid_monitor.py` 실행. 2초마다 역할별 최신 작업·상태·경과 시간·모델·최근 응답·실패 이유를 표시한다. `--once`는 한 번 출력한다. 실행기 잠금을 잡지 않으므로 작업 중에도 볼 수 있다. Ctrl+C는 모니터만 종료하며 담당 작업을 멈추지 않는다. 기존 수동 CLI 대화는 표시 대상이 아니다. Claude JSON 응답은 완료 후 기록될 수 있어 타이핑 단위 스트리밍은 제공하지 않는다. running은 상태 파일의 기록이며 프로세스 생존을 보증하지 않는다.

2026-11-02: UI 코드 제안 작업의 180초 제한 중단 후 작업당 360초로 조정. Claude 출력은 stream-json/verbose로 저장하며 최종 result 이벤트로 성공을 판별한다. 무제한 실행은 하지 않는다.

## Terra 전환 · 2026-11-02
서버/shared 담당은 Terra 6.1로 변경. 내부 키 sol은 이전 작업 기록 호환을 위해 유지하며 `add terra`도 지원한다. 과거 Sol 실행 기록은 수정하지 않는다. 모델이 다르면 기존 Sol 자동 세션은 재사용하지 않고 Terra 세션을 새로 생성한다. Opus Web/App과 Astra 역할은 유지. 제품의 AI 추출 제공자를 설정한 것은 아니다.
