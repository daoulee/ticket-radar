import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { PerformancePoster } from '../src/components/PerformancePoster';

it('포스터 원본 비율을 유지하고 로드 실패 시 안내한다', async () => {
  await render(<PerformancePoster uri="https://example.test/poster.png" />);
  const poster = screen.getByLabelText('공연 포스터');
  await fireEvent(poster, 'load', { nativeEvent: { source: { width: 600, height: 900 } } });
  const portrait = StyleSheet.flatten(screen.getByLabelText('공연 포스터').props.style);
  expect(portrait.width / portrait.height).toBeCloseTo(2 / 3);
  expect(portrait.height).toBeLessThanOrEqual(440);
  await fireEvent(poster, 'load', { nativeEvent: { source: { width: 1200, height: 600 } } });
  const landscape = StyleSheet.flatten(screen.getByLabelText('공연 포스터').props.style);
  expect(landscape.width / landscape.height).toBeCloseTo(2);
  await fireEvent.press(screen.getByRole('button', { name: '공연 포스터 확대 보기' }));
  expect(screen.getByLabelText('확대한 공연 포스터')).toBeOnTheScreen();
  expect(StyleSheet.flatten(screen.getByTestId('poster-viewer-safe-area').props.style).paddingTop).toBeGreaterThan(0);
  await fireEvent.press(screen.getByRole('button', { name: '포스터 확대' }));
  expect(screen.getByText('150%')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: '포스터 닫기' }));
  await fireEvent.press(screen.getByRole('button', { name: '공연 포스터 확대 보기' }));
  expect(screen.getByText('100%')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: '포스터 닫기' }));
  await fireEvent(poster, 'error');
  expect(screen.getByText('포스터를 불러올 수 없어요')).toBeOnTheScreen();
});

it('별도의 공연 상세 이미지를 열고 원본 비율로 확인한다', async () => {
  await render(<PerformancePoster uri="https://example.test/intro.png" intro />);
  await fireEvent.press(screen.getByRole('button', { name: '공연 상세 이미지 보기' }));
  const image = screen.getByLabelText('확대한 공연 상세 이미지');
  await fireEvent(image, 'load', { nativeEvent: { source: { width: 700, height: 7200 } } });
  const dimensions = StyleSheet.flatten(screen.getByLabelText('확대한 공연 상세 이미지').props.style);
  expect(dimensions.width / dimensions.height).toBeCloseTo(700 / 7200);
});
