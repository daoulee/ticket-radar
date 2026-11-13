# 공통 계약 v0.1.0 · Sol / CORE-002

`index.ts`가 요청·응답 타입과 Zod 런타임 스키마의 단일 소유 위치다. 루트 SPEC/CORE_DEMO_HANDOFF의 최신 결정에 맞춘 **Astra 검토용 구현**입니다. 웹/앱 파일은 수정하지 않았습니다.

SOL-005 이후 실행·sourceVersion·원문 표시·AI 미설정 검증 순서는 [서버 최신 인계](../server/README.md#sol-005-이후-웹앱-검증-인계)를 따릅니다. 추가 기능과 실제 모델 호출은 보류합니다.

## 설치·소비

```sh
cd /Users/daoule/Desktop/AID/shared
npm ci --ignore-scripts
```

화면 담당자는 자신의 프로젝트에서 로컬 패키지 `@ticket-radar/shared` (`file:../shared`)를 연결하거나 소스 경로로 import할 수 있습니다. 패키지 엔트리는 TypeScript다. Vite/Metro의 실제 소비·번들 검증은 각 담당자가 수행합니다. 이 작업에서 웹/앱 의존성을 바꾸거나 공통 패키지 연동 성공을 주장하지 않습니다.

```ts
import { CheckResponseSchema, EventListSchema, OfficialContextSchema,
  type CheckRequestInput, type CheckResponse } from '@ticket-radar/shared';

const response: CheckResponse = CheckResponseSchema.parse(await fetchResponse.json());
```

`parse`는 중첩 필드·상태·숫자·근거·모드 일관성을 확인합니다. 화면은 실패 시 오류·재시도를 보여주고 성공 결과로 캐스팅하지 않습니다. `.safeParse`도 사용 가능합니다. 요청에는 `CheckRequestInput`, 파싱 후 서버 내부에는 `CheckRequest`를 사용합니다.

## 엔드포인트

| 요청 | 성공 본문 / 스키마 |
| --- | --- |
| `GET /events?q=` | 배열 / `EventListSchema` |
| `GET /events/:id/official-context` | 객체 / `OfficialContextSchema` |
| `POST /checks` | 객체 / `CheckResponseSchema` |
| 오류 | `{code,message,retryable}` / `ApiErrorBodySchema` |

응답 래퍼는 없다. 성공 JSON에 `contractVersion: "0.1.0"`를 포함한다(검사 응답). 404/400/413/415/429/502/503/504 등 HTTP 상태와 오류 본문을 함께 처리한다.

## 화면 임시 타입에서 바뀐 부분

- 기존 6개 필드 `showtimeId`, `seatGrade`, `price`, `quantity`, `deliveryMethod`, `prepaymentRequested` 유지.
- `ListingFields`에 `listingEventId`, `bookingType`, `priceBasis`, `feeBasis`, `discountStatus`, `buyerIsBooker` 추가. 누락 입력은 null로 파싱하며 **값을 추측하지 않는다**. `ExtractedFields`는 이 12개 필드를 모두 제공합니다.
- `bookingType`: fanclub_presale/general/null, `priceBasis`: per_ticket/total/null, `feeBasis`: ticket_only/includes_fees/null, `discountStatus`: standard/discounted/null.
- 확인값의 `listingEventId`는 판매글이 선택한 공연에 관한 것인지 사용자가 확인한 값입니다. 서버는 요청 공연 ID와 비교합니다. 화면이 자동으로 선택 공연 ID를 채워 ‘확인됨’으로 처리하지 않습니다.
- `unknown`은 `{status:"unknown", value:null, evidenceQuote:null}`. `extracted`에는 실제 인용과 값이 필요하다. `ambiguous`는 value=null, 실제 인용과 후보 2개 이상이다.
- 가격은 1매 원화 단가. `confirmedFields`가 없으면 비교 보류. 공연·회차·좌석·단가·수수료·할인 중 불명확/불일치가 있으면 숫자를 제공하지 않습니다. 조건이 다를 때 단순히 ‘확인’ 체크로 덮어쓰지 않습니다.
- `confirmedFields`는 **전체 스냅샷**입니다. 부분 패치로 서버가 과거 값을 합치지 않습니다. 수정 후 적용값은 `appliedFields`로 그대로 반환합니다. 원래 `extracted`와 구분해 표시합니다.
- `PriceTier`에 기본가 조건, `TicketPolicy`에 적용 범위 `scope` 추가. 선예매 규정을 일반예매에 적용하지 않습니다. 예매 유형 미확인은 `needs_check`다.

## 추출·재대조

1. 최초 `{eventId,listingText,syntheticListing:true}` 요청은 기본 model 모드다. AI 미설정이면 503 `AI_NOT_CONFIGURED`다. fixture 결과로 대체하지 않습니다.
2. 사용자 수정 후 최초 응답의 `checkId`를 `previousCheckId`에 넣고 동일 원문/공연/합성 여부와 `confirmedFields`를 보낸다. 이전 후보는 보존하고 새 확인값으로 재대조합니다. 이 단계에서 모델을 재호출하지 않습니다.
3. 재사용은 메모리 15분·최대 100건입니다. 서버 재시작·만료·원문 변경 시 409 `CHECK_EXPIRED_OR_MISMATCH`로 재추출을 요청합니다. 장기 저장·계정 서비스가 아닙니다.
4. AI 없이 사용자가 직접 입력하려면 **명시적으로** `extractionMode:"manual"`과 `confirmedFields`를 보낸다. 응답 후보는 unknown이고 `extraction.method=manual`이다. 첫 추출 실패 뒤 자동 전환하지 않는다.

## 모드·출처 표시

- `syntheticListing` 생략 기본값은 true. 현재 시연 문장은 항상 true다. `dataMode`는 HTTP 연결 상태나 AI 사용 여부가 아니라 **데이터 합성 여부**다.
- 합성 매물·합성 공식 자료·fixture 중 하나라도 포함되면 `isDemo=true`, `dataMode=demo`다. 실제 자료에 명시적 수동 입력이면 live 데이터일 수 있지만 AI 호출로 표시하지 않습니다.
- `extraction.method`: model/fixture/manual. `provider`·`model`은 제품 추출 제공자이며 개발 담당 AI와 별개다. `actualModelCall`은 **이번 요청**에서 실제 모델 어댑터 호출 성공 여부, `reused`는 이전 추출 재사용 여부다. 재사용 응답은 method=model이어도 actualModelCall=false일 수 있습니다.
- `provenance`는 합성 판매글·공식 출처 유형·공식 자료 버전을 분리합니다. `sourceVersion`은 기존 공식 스냅샷과 `server/data/akmu-price-evidence.json`을 결합한 SHA-256입니다. 공연·정책의 기존 확인일과 재확인한 가격의 확인일은 각 필드에 유지하며 `sourceDatePrecision=date`다. 응답 `checkedAt`은 서버 처리 시각입니다.
- 실제 인용인지 검사는 서버의 추가 단계다. Zod만으로 인용 의미·모델 정확성·공식 자료 최신성이 증명되지는 않습니다.

## 예시

`examples/`의 manual-request/response는 **합성 문장·명시적인 수동 확인값**입니다. AI 성능 증거가 아닙니다. 누락된 할인 조건을 AI가 추정한 예시가 아니라, 테스트를 위해 사용자가 확인한 조건으로 설정했습니다. `ai-not-configured.json`은 기본 오류 예시다. `events.json`/`official-context.json`은 검토된 공지 스냅샷에서 생성됩니다. `server`에서 `npm run examples`로 재생성합니다.

## ASTRA-016 수정 반영 · 2026-11-01

와이어 형태와 버전 0.1.0은 유지하고 근거 검증 결함을 수정했습니다. `conflict`/`matched`/`needs_check`는 비어 있지 않은 `listingQuote`가 필수다. 수동 입력도 실제 전체 원문을 유지하며 수정값은 `appliedFields`와 설명으로 구분합니다. 화면에서 원문은 접어 볼 수 있지만 null로 지우지 않습니다.

`PriceTier.sourceText`와 finding의 `officialExcerpt`는 실제 공지 인용만 제공합니다. 정규화 가격은 `facePrice`, 비교 범위는 `priceBasis`/`feeBasis`/`discountStatus`와 finding의 `reason`·`notices`로 분리합니다. 회차별로 계산에 사용한 동일 tier에서 인용·URL·확인일을 가져온다. 기존 자료와 다른 `sourceVersion`을 예상해야 합니다. 웹·앱 소비/화면 재검증은 각 담당자와 Astra가 별도로 수행합니다.
