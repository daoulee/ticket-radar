import type { ExtractionMetadata } from '../src/contract/types';
import { displayValue, extractionText, parsePositiveInt, provenanceLines, showtimeLabel } from '../src/ui/display';
import { formatKst } from '../src/ui/format';
import { DEMO_EVENTS } from '../src/demo/fixtures';

describe('입력 숫자 해석', () => {
  it.each([
    ['', null],
    ['230000', 230000],
    ['230,000원', 230000],
    [' 2 매', 2],
    ['0', 'invalid'],
    ['-5', 'invalid'],
    ['12.5', 'invalid'],
    ['abc', 'invalid'],
  ])('%p → %p', (input, expected) => {
    expect(parsePositiveInt(input)).toBe(expected);
  });
});

describe('표시 문구', () => {
  it('미확인 값은 "미확인"으로 표시한다', () => {
    expect(displayValue('price', null, null)).toBe('미확인');
  });
  it('회차 label 이 ISO 시각이면 한국 시간으로 읽기 쉽게 표시한다', () => {
    const iso = { id: 's1', startsAt: '2026-11-21T17:00:00+09:00', label: '2026-11-21T17:00:00+09:00' };
    expect(showtimeLabel(iso)).toBe('11월 21일 (토) 17:00');
    expect(showtimeLabel({ ...iso, label: '토요일 공연' })).toBe('토요일 공연');
  });
  it('회차 ID는 공연의 회차 이름으로 바꾼다', () => {
    expect(displayValue('showtimeId', 'demo-st-sat', DEMO_EVENTS[0])).toBe('11월 21일(토) 19:00');
  });
});

describe('추출 방식·출처 표시 (AI 결과로 오인하지 않게)', () => {
  const meta = (m: Partial<ExtractionMetadata>): ExtractionMetadata => ({
    method: 'model', provider: 'p', model: 'm', actualModelCall: false, reused: false, ...m,
  });
  it('fixture·manual 은 AI 호출 없음으로 표시한다', () => {
    expect(extractionText(meta({ method: 'fixture', provider: null, model: null }))).toBe('시연 fixture 조회 · AI 호출 없음');
    expect(extractionText(meta({ method: 'manual', provider: null, model: null }))).toBe('AI 추출 없음 · 사용자가 직접 입력');
  });
  it('model 은 이번 요청의 호출 여부와 재사용을 구분한다', () => {
    expect(extractionText(meta({ actualModelCall: true }))).toBe('AI 모델 추출 · p m · 추출값은 후보입니다');
    expect(extractionText(meta({ reused: true }))).toBe('AI 모델 추출 결과 재사용 · p m · 이번 요청에서는 모델 호출 없음');
  });
  it('응답에 없으면 정보 없음', () => {
    expect(extractionText(undefined)).toBe('추출 방식 정보 없음 (서버 응답에 없음)');
  });
  it('출처: 합성 판매글과 공식 스냅샷을 따로 표시하고 sha256은 줄여 쓴다', () => {
    expect(provenanceLines({ syntheticListing: true, officialSourceType: 'official', sourceVersion: 'sha256:0cc6fcf796962cfaa3af' })).toEqual([
      '판매글: 시연용 합성 문장',
      '공식 자료: 공식 공지 스냅샷',
      '자료 버전: sha256:0cc6fcf79696…',
    ]);
  });
  it('날짜 단위 확인일에는 시각을 만들어 붙이지 않는다', () => {
    expect(formatKst('2026-10-29')).toBe('2026. 10. 29. (날짜 단위)');
  });
});
