import { render } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';
import { RadarBrand } from '../src/components/RadarBrand';

const flush = () => new Promise((r) => setTimeout(r, 0));

function mockA11y(query: () => Promise<boolean>) {
  const remove = jest.fn();
  let listener: ((v: boolean) => void) | undefined;
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockImplementation(query);
  jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((_e: string, h: (v: boolean) => void) => {
    listener = h;
    return { remove };
  }) as never);
  return { remove, change: (v: boolean) => listener?.(v) };
}

describe('RadarBrand (S01 장식 모션)', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['축소 모션 켜짐', () => Promise.resolve(true)],
    ['설정 조회 실패', () => Promise.reject(new Error('unavailable'))],
  ])('%s이면 재생하지 않고 정적으로 둔다', async (_name, query) => {
    mockA11y(query);
    const timing = jest.spyOn(Animated, 'timing');
    await render(<RadarBrand />);
    await flush();
    expect(timing).not.toHaveBeenCalled();
  });

  it('조회 전 설정이 켜지면 재생하지 않고, 사라질 때 구독을 정리한다', async () => {
    let resolve!: (v: boolean) => void;
    const a11y = mockA11y(() => new Promise((r) => (resolve = r)));
    const timing = jest.spyOn(Animated, 'timing');
    const view = await render(<RadarBrand />);
    a11y.change(true);
    resolve(false);
    await flush();
    expect(timing).not.toHaveBeenCalled();
    await view.unmount();
    expect(a11y.remove).toHaveBeenCalledTimes(1);
  });

  it('축소 모션이 꺼져 있으면 1회만 재생하고 총 700ms 이하다', async () => {
    mockA11y(() => Promise.resolve(false));
    const timing = jest.spyOn(Animated, 'timing');
    await render(<RadarBrand />);
    await flush();
    expect(timing).toHaveBeenCalledTimes(2);
    const total = timing.mock.calls.reduce((sum, [, cfg]) => sum + (cfg.duration ?? 0), 0);
    expect(total).toBeLessThanOrEqual(700);
  });
});
