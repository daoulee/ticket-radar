# KOPIS 공연 검색 Worker

`GET /api/performances?q=공연명`은 KOPIS의 현재 공연 중 목록(앞으로 30일을 포함한 조회 기간, 최대 30건)을 반환합니다. 항목은 공연명·공연장·공연 기간·상태·KOPIS 출처·조회 시각만 포함합니다. 회차나 좌석 등급별 가격, 입장·양도 규정을 검증한 결과가 아닙니다.

서버 전용 `KOPIS_API_KEY` Worker secret이 필요하며 키가 없으면 `KOPIS_NOT_CONFIGURED` 오류를 반환합니다. 오류에는 외부 API URL·원문·키를 넣지 않습니다. 지금까지의 모형은 가격·규정이 없는 공연의 비교 가능 여부를 보장하지 않으며 API 연결 또는 배포 완료의 근거가 아닙니다.

같은 출처의 GET 요청만 처리하고 이외 요청은 거절합니다. 같은 isolate·IP에 분당 30회 제한을 적용하지만, Workers의 여러 isolate와 지역에 걸친 전역 한도가 아니므로 운영 시 Cloudflare의 별도 전역 요청 제어 및 KOPIS 이용 조건 검토가 필요합니다.

`worker.ts`는 `server/src/kopis.ts`와 그 패키지 의존성을 가져와 Wrangler로 번들됩니다. `run_worker_first`는 `/api/*`에만 적용하고, 그 밖의 경로는 기존 정적 에셋/SPA 설정을 유지합니다. 검증 명령은 `node --test worker.test.ts`와 `wrangler deploy --dry-run`입니다. 실제 공개 Worker secret은 코드·Git·클라이언트에 넣지 않습니다.
