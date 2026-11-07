import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { FlowProvider, useFlow } from '../src/state/FlowContext';
import { createDemoApi } from '../src/api/demoApi';
import { DEMO_EVENTS, DEMO_SCENARIOS } from '../src/demo/fixtures';
import type { CheckResponse } from '../src/contract/types';

it.each(['success', 'failure'] as const)('원문 변경 후 늦은 추출 %s는 화면 이동을 요청하지 않는다', async (outcome) => {
  const api = createDemoApi({ latencyMs: 0 });
  const response = await api.createCheck({ eventId: DEMO_EVENTS[0].id, listingText: DEMO_SCENARIOS[0].listingText });
  let resolve!: (r: CheckResponse) => void;
  let reject!: (e: Error) => void;
  api.createCheck = () => new Promise((yes, no) => { resolve = yes; reject = no; });
  const { result } = await renderHook(useFlow, { wrapper: ({ children }: { children: ReactNode }) => <FlowProvider api={api}>{children}</FlowProvider> });
  await act(async () => { result.current.selectEvent(DEMO_EVENTS[0]); });
  await act(async () => { result.current.setListingText(DEMO_SCENARIOS[0].listingText); });
  let pending!: Promise<boolean>;
  await act(async () => { pending = result.current.extract(); });
  await act(async () => { result.current.setListingText('변경된 판매글'); });
  let proceed = true;
  await act(async () => { if (outcome === 'success') resolve(response); else reject(new Error('late error')); proceed = await pending; });
  expect(proceed).toBe(false);
  expect(result.current.listingText).toBe('변경된 판매글');
  expect(result.current.extraction.status).toBe('idle');
});

it('새 확인 시작은 진행 중 대조 결과와 선택 공연을 무효화한다', async () => {
  const api = createDemoApi({ latencyMs: 0 });
  const response = await api.createCheck({ eventId: DEMO_EVENTS[0].id, listingText: DEMO_SCENARIOS[0].listingText });
  let resolve!: (r: CheckResponse) => void;
  api.createCheck = () => new Promise(yes => { resolve = yes; });
  const { result } = await renderHook(useFlow, { wrapper: ({ children }: { children: ReactNode }) => <FlowProvider api={api}>{children}</FlowProvider> });
  await act(async () => { result.current.selectEvent(DEMO_EVENTS[0]); });
  await act(async () => { result.current.setListingText('수동 판매글'); });
  await act(async () => { result.current.startManualEntry(); });
  let pending!: Promise<boolean>;
  await act(async () => { pending = result.current.compare(); });
  await act(async () => { result.current.resetFlow(); });
  let proceed = true;
  await act(async () => { resolve(response); proceed = await pending; });
  expect(proceed).toBe(false);
  expect(result.current.event).toBeNull();
  expect(result.current.listingText).toBe('');
  expect(result.current.result.status).toBe('idle');
});
