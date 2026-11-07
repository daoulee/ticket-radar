# Astra 통합 응답 검토 도구

소유: Astra / AID-INTEGRATION-001. Python 표준 라이브러리만 사용한다.
WEB-001의 **계약 제안**과 SPEC의 Astra 계약 결정을 검토하기 위한 도구이며 Sol의 확정 계약·Zod 스키마를 대신하지 않는다. `needs_check`와 근거가 없는 `unknown`의 `evidenceQuote: null`을 허용한다. Sol 초안이 도착하면 필드·상태·응답 래퍼를 먼저 대조하고 차이를 기록한다.

```sh
cd /Users/daoule/Desktop/AID
python3 -m unittest discover -s tests/integration -p 'test_*.py' -v
python3 tests/integration/check_api.py --response tests/integration/demo-check.json
```

샘플은 모두 합성이다. `example.invalid`는 검증용 주소로 실제 공식 출처가 아니며 `checkedAt`도 합성 시각이다. 샘플 통과는 검증기 자체의 동작 확인일 뿐 제품·AI·API·공연 출처 검증이 아니다.

서버가 준비되면 JSON 요청 파일을 작성해 다음 형태로 실행한다. 이 명령은 아직 서버 대상으로 실행하지 않았다.

```sh
python3 tests/integration/check_api.py \
  --base-url http://127.0.0.1:3001 \
  --request /path/to/reviewed-request.json
```

HTTP 모드는 `POST /checks`만 확인한다. 공연 검색·컨텍스트 조회·오류 응답·사용자 수정 전후 왕복·화면/기기는 후속 통합 검증 대상이다. 원문·응답은 자동 저장하거나 출력하지 않는다. 응답 검토 오류만 필드 위치로 표시한다.

`--expected /path/to/expected.json`은 사람이 동일 공연·회차·등급·매수·수수료를 확인한 사례에만 사용한다. 예: `{"facePrice":100000,"salePrice":150000}` 또는 보류 기대값 `{"held":true}`. 이 도구는 조건의 동일성을 추론하거나 AI의 추출 정확도를 판정하지 않는다.
