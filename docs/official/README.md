# 시연 공연의 공식 근거

2026년 11월 1일 독립 재검토에서 YES24 공식 공지의 가격 문구가 `server/data/akmu-price-evidence.json`에 저장된 문구와 일치하는 것을 확인했습니다. 가격 근거는 이 파일을 기준으로 관리하며 중복 사본은 만들지 않습니다.

- [YES24 공식 공지](https://m.ticket.yes24.com/Notice/18447?order=1&type=1)
- 공연·회차·선예매 정책: `docs/official/demo-event-akmu.json` · 2026년 10월 29일 확인
- 가격 원문: `server/data/akmu-price-evidence.json` · 2026년 11월 1일 확인

서버는 두 파일의 바이트를 결합한 SHA-256을 `sourceVersion`으로 제공합니다. 공식 가격 원문과 서비스가 작성한 수수료·할인 제외 비교 설명은 구분합니다. 확인일은 날짜 단위로 기록하며 서버 처리 시각으로 바꾸지 않습니다.

기존 JSON의 `status`와 `missingBeforeLiveDemo`는 최초 작성 당시의 체크리스트입니다. 현재 서버 연결 여부는 [최신 협업 기록](../../Communicate.md)에서 확인해 주세요. 이 문서가 추가됐다고 해서 기존 스냅샷이나 서버 해시가 바뀐 것은 아닙니다. 실제 AI 추출이나 최신 상품 상세의 모든 입장·양도 예외를 검증했다는 의미도 아닙니다.
