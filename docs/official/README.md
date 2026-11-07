# 시연 공연 공식 근거 관리

2026-11-01 Astra 독립 재검토: YES24 공식 공지의 가격 문구가 `server/data/akmu-price-evidence.json`에 저장된 문구와 일치함을 웹 도구로 확인했다. 가격 근거 파일은 이 경로를 공식 등록 위치로 유지하며 중복 사본을 만들지 않는다.

- 원문 출처: https://m.ticket.yes24.com/Notice/18447?order=1&type=1
- 공연·회차·선예매 정책 스냅샷: `docs/official/demo-event-akmu.json` (2026-10-29 확인)
- 가격 원문 보완 근거: `server/data/akmu-price-evidence.json` (2026-11-01 확인)
- 서버는 두 파일의 바이트를 결합한 SHA-256으로 sourceVersion을 제공한다.
- 가격 원문과 서비스의 수수료/할인 제외 비교 설명을 분리한다. 확인일은 날짜 단위이며 서버 처리 시각으로 대체하지 않는다.
- 기존 JSON의 status/missingBeforeLiveDemo는 최초 작성 당시 체크리스트다. 현재 서버 연결 여부는 Communicate.md 최신 기록을 기준으로 한다. 이 문서 추가만으로 기존 스냅샷이나 서버 해시를 바꾸지 않는다.
- 실제 AI 추출, 최신 상품 상세의 모든 입장/양도 예외 검증 완료를 뜻하지 않는다.
