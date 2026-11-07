import { CONTRACT_VERSION, CheckResponseSchema, EventListSchema, OfficialContextSchema } from '@ticket-radar/shared';

// Jest 에서 ../shared 를 패키지 이름으로 불러오고 Zod 스키마가 동작하는지 확인한다.
// Sol 이 저장한 예시 JSON(shared/examples, 읽기 전용)을 앱 쪽에서 그대로 파싱한다.
const examples = (name: string) => require(`../../shared/examples/${name}.json`);

describe('공통 계약 연결 (@ticket-radar/shared)', () => {
  it('계약 버전 0.1.0', () => {
    expect(CONTRACT_VERSION).toBe('0.1.0');
  });

  it('Sol 예시 응답을 앱에서 파싱할 수 있다', () => {
    expect(EventListSchema.safeParse(examples('events')).success).toBe(true);
    expect(OfficialContextSchema.safeParse(examples('official-context')).success).toBe(true);
    expect(CheckResponseSchema.safeParse(examples('manual-response')).success).toBe(true);
  });
});
