import { render, screen } from '@testing-library/react-native';
import { PerformanceCast, splitCast } from '../src/components/PerformanceCast';

describe('공연 출연진', () => {
  it('이름을 순서대로 표시하며 사진이 없고 원문이 유지됨을 알린다', async () => {
    await render(<PerformanceCast cast="김하나, 이둘 (게스트, 배우), 박셋 등" />);
    expect(screen.getByLabelText('김하나, 프로필 사진 미제공')).toBeOnTheScreen();
    expect(screen.getByLabelText('이둘 (게스트, 배우), 프로필 사진 미제공')).toBeOnTheScreen();
    expect(screen.getByLabelText('박셋 등, 프로필 사진 미제공')).toBeOnTheScreen();
    expect(screen.getByText('원문: 김하나, 이둘 (게스트, 배우), 박셋 등')).toBeOnTheScreen();
  });

  it('정보가 없거나 공백일 때 빈 상태를 표시한다', async () => {
    await render(<PerformanceCast cast={null} />);
    expect(screen.getByText('제공된 출연진 정보가 없어요.')).toBeOnTheScreen();
    expect(splitCast(' ,  , ')).toEqual([]);
  });
});
