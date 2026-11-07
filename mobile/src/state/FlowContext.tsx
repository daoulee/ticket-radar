import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { toApiError, type TicketRadarApi } from '../api/client';
import type { CheckRequestInput, CheckResponse, EventSummary, ListingFields, OfficialContext } from '../contract/types';
import type { AsyncState } from '../components/common';
import { DEMO_SCENARIOS } from '../demo/fixtures';
import { valuesOf } from '../ui/display';
import { EMPTY_FIELDS } from '../ui/fields';

// 화면 사이에서 공유하는 상태와 API 호출만 담당한다.
// 가격·규정 판단은 하지 않고 API(시연 데이터 또는 Sol 서버) 응답을 그대로 보관한다.

// 현재 시연 판매글은 모두 합성 문장이다. 실제 판매글 입력 흐름이 정해지기 전까지 항상 true로 보낸다(계약 기본값과 같음).
const SYNTHETIC_LISTING = true;

// 'model': 서버에 AI 추출을 요청한 경로. 'manual': 사용자가 명시적으로 'AI 없이 직접 입력'을 고른 경로.
// AI 추출이 실패해도 manual로 자동 전환하지 않는다(사용자가 버튼을 눌러야 한다).
export type EntryMode = 'model' | 'manual';

interface FlowValue {
  api: TicketRadarApi;
  events: AsyncState<EventSummary[]>;
  event: EventSummary | null;
  context: AsyncState<OfficialContext>;
  listingText: string;
  extraction: AsyncState<CheckResponse>;
  entryMode: EntryMode;
  fields: ListingFields;
  result: AsyncState<CheckResponse>;
  searchEvents(query: string): Promise<void>;
  selectEvent(event: EventSummary): void;
  resetFlow(): void;
  reloadContext(): void;
  setListingText(text: string): void;
  setFields(fields: ListingFields): void;
  // 성공하면 true. 화면은 true일 때만 다음 단계로 이동한다.
  extract(): Promise<boolean>;
  // AI 추출 없이 빈 확인 폼으로 이동한다. 대조 요청은 extractionMode='manual'로 보낸다.
  startManualEntry(): boolean;
  compare(): Promise<boolean>;
  // 개발 빌드 + 시연 모드 전용: 탭 자동화 도구 없이 시뮬레이터 화면을 확인하기 위한 바로가기.
  loadDemoScenario(scenarioId: string, step: DemoJumpStep, confirmConditions?: boolean): Promise<boolean>;
  // 개발 빌드 + 실제 API 모드 전용: 탭 자동화 도구 없이 실서버 응답 화면을 확인하기 위한 바로가기.
  // 화면 버튼과 같은 요청(모델 추출 또는 명시적 직접 입력 대조)을 실제로 보낸다. 도착할 화면을 돌려준다.
  runDevLiveCheck(input: DevLiveInput): Promise<'listing' | 'review' | 'result' | null>;
}

export type DemoJumpStep = 'listing' | 'review' | 'result';
export type DevLiveInput = { eventId: string; listingText: string; mode: 'extract' | 'manual'; fields?: ListingFields };

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ api, children }: { api: TicketRadarApi; children: ReactNode }) {
  const [events, setEvents] = useState<AsyncState<EventSummary[]>>({ status: 'idle' });
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [context, setContext] = useState<AsyncState<OfficialContext>>({ status: 'idle' });
  const [listingText, setListingTextState] = useState('');
  const [extraction, setExtraction] = useState<AsyncState<CheckResponse>>({ status: 'idle' });
  const [entryMode, setEntryMode] = useState<EntryMode>('model');
  const [fields, setFields] = useState<ListingFields>(EMPTY_FIELDS);
  const [result, setResult] = useState<AsyncState<CheckResponse>>({ status: 'idle' });
  // 공연을 빠르게 바꿨을 때 늦게 도착한 이전 응답이 화면을 덮어쓰지 않도록 요청 순번을 둔다.
  const contextSeq = useRef(0);
  const checkSeq = useRef(0);

  const searchEvents = useCallback(
    async (query: string) => {
      setEvents({ status: 'loading' });
      try {
        setEvents({ status: 'success', data: await api.listEvents(query) });
      } catch (error) {
        setEvents({ status: 'error', error: toApiError(error) });
      }
    },
    [api],
  );

  const loadContext = useCallback(
    async (eventId: string) => {
      const seq = ++contextSeq.current;
      setContext({ status: 'loading' });
      try {
        const data = await api.getOfficialContext(eventId);
        if (seq === contextSeq.current) setContext({ status: 'success', data });
      } catch (error) {
        if (seq === contextSeq.current) setContext({ status: 'error', error: toApiError(error) });
      }
    },
    [api],
  );

  const resetCheck = useCallback(() => {
    ++checkSeq.current;
    setExtraction({ status: 'idle' });
    setEntryMode('model');
    setResult({ status: 'idle' });
    setFields(EMPTY_FIELDS);
  }, []);

  const resetFlow = useCallback(() => {
    ++contextSeq.current;
    resetCheck();
    setEvent(null);
    setContext({ status: 'idle' });
    setListingTextState('');
  }, [resetCheck]);

  const selectEvent = useCallback(
    (next: EventSummary) => {
      setEvent(next);
      setListingTextState('');
      resetCheck();
      void loadContext(next.id);
    },
    [loadContext, resetCheck],
  );

  const reloadContext = useCallback(() => {
    if (event) void loadContext(event.id);
  }, [event, loadContext]);

  // 판매글이 바뀌면 이전 추출·결과는 더 이상 이 글의 것이 아니므로 지운다 (T05 혼동 방지).
  const setListingText = useCallback(
    (text: string) => {
      setListingTextState(text);
      resetCheck();
    },
    [resetCheck],
  );

  const extract = useCallback(async () => {
    if (!event) return false;
    const seq = ++checkSeq.current;
    setEntryMode('model');
    setExtraction({ status: 'loading' });
    setResult({ status: 'idle' });
    try {
      const data = await api.createCheck({
        eventId: event.id,
        listingText,
        syntheticListing: SYNTHETIC_LISTING,
        extractionMode: 'model',
      });
      if (seq !== checkSeq.current) return false;
      setExtraction({ status: 'success', data });
      setFields(valuesOf(data.extracted));
      return true;
    } catch (error) {
      if (seq !== checkSeq.current) return false;
      setExtraction({ status: 'error', error: toApiError(error) });
      return false;
    }
  }, [api, event, listingText]);

  const startManualEntry = useCallback(() => {
    if (!event || !listingText.trim()) return false;
    resetCheck();
    setEntryMode('manual');
    return true;
  }, [event, listingText, resetCheck]);

  const compare = useCallback(async () => {
    if (!event) return false;
    // 모델 경로의 재대조: 처음 추출 응답의 checkId를 previousCheckId로 보내고 확인값 '전체'를 보낸다(부분 수정 아님).
    let request: CheckRequestInput;
    if (entryMode === 'manual') {
      request = { eventId: event.id, listingText, syntheticListing: SYNTHETIC_LISTING, extractionMode: 'manual', confirmedFields: fields };
    } else if (extraction.status === 'success') {
      request = {
        eventId: event.id,
        listingText,
        syntheticListing: SYNTHETIC_LISTING,
        previousCheckId: extraction.data.checkId,
        confirmedFields: fields,
      };
    } else {
      return false;
    }
    const seq = ++checkSeq.current;
    setResult({ status: 'loading' });
    try {
      const data = await api.createCheck(request);
      if (seq !== checkSeq.current) return false;
      setResult({ status: 'success', data });
      return true;
    } catch (error) {
      if (seq !== checkSeq.current) return false;
      setResult({ status: 'error', error: toApiError(error) });
      return false;
    }
  }, [api, event, listingText, fields, entryMode, extraction]);

  // 화면 흐름과 같은 API 호출(createCheck 두 번)을 차례로 실행해 상태를 채운다. 판단 로직은 없다.
  // confirmConditions: 사용자가 '이 공연 맞음·티켓 금액만·할인 없는 기본가'를 누른 상태를 재현한다(화면 확인용).
  const loadDemoScenario = useCallback(
    async (scenarioId: string, step: DemoJumpStep, confirmConditions = false) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
      if (api.mode !== 'demo' || !scenario) return false;
      try {
        const target = (await api.listEvents('')).find((e) => e.id === scenario.eventId);
        if (!target) return false;
        selectEvent(target);
        setListingTextState(scenario.listingText);
        if (step === 'listing') return true;
        const extracted = await api.createCheck({ eventId: target.id, listingText: scenario.listingText, syntheticListing: SYNTHETIC_LISTING });
        const confirmed: ListingFields = confirmConditions
          ? { ...valuesOf(extracted.extracted), listingEventId: target.id, feeBasis: 'ticket_only', discountStatus: 'standard' }
          : valuesOf(extracted.extracted);
        setExtraction({ status: 'success', data: extracted });
        setFields(confirmed);
        if (step === 'review') return true;
        const checked = await api.createCheck({
          eventId: target.id,
          listingText: scenario.listingText,
          syntheticListing: SYNTHETIC_LISTING,
          previousCheckId: extracted.checkId,
          confirmedFields: confirmed,
        });
        setResult({ status: 'success', data: checked });
        return true;
      } catch {
        return false;
      }
    },
    [api, selectEvent],
  );

  const runDevLiveCheck = useCallback(
    async ({ eventId, listingText: text, mode, fields: confirmed }: DevLiveInput) => {
      if (api.mode !== 'live') return null;
      const target = (await api.listEvents('').catch(() => [])).find((e) => e.id === eventId);
      if (!target) return null;
      selectEvent(target);
      setListingTextState(text);
      if (mode === 'extract') {
        setExtraction({ status: 'loading' });
        try {
          const data = await api.createCheck({ eventId, listingText: text, syntheticListing: SYNTHETIC_LISTING, extractionMode: 'model' });
          setExtraction({ status: 'success', data });
          setFields(valuesOf(data.extracted));
          return 'review';
        } catch (error) {
          setExtraction({ status: 'error', error: toApiError(error) });
          return 'listing';
        }
      }
      const snapshot = confirmed ?? EMPTY_FIELDS;
      setEntryMode('manual');
      setFields(snapshot);
      setResult({ status: 'loading' });
      try {
        const data = await api.createCheck({
          eventId, listingText: text, syntheticListing: SYNTHETIC_LISTING, extractionMode: 'manual', confirmedFields: snapshot,
        });
        setResult({ status: 'success', data });
        return 'result';
      } catch (error) {
        setResult({ status: 'error', error: toApiError(error) });
        return 'review';
      }
    },
    [api, selectEvent],
  );

  const value = useMemo<FlowValue>(
    () => ({
      api,
      events,
      event,
      context,
      listingText,
      extraction,
      entryMode,
      fields,
      result,
      searchEvents,
      selectEvent,
      resetFlow,
      reloadContext,
      setListingText,
      setFields,
      extract,
      startManualEntry,
      compare,
      loadDemoScenario,
      runDevLiveCheck,
    }),
    [api, events, event, context, listingText, extraction, entryMode, fields, result, searchEvents, selectEvent, resetFlow, reloadContext, setListingText, extract, startManualEntry, compare, loadDemoScenario, runDevLiveCheck],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const value = useContext(FlowContext);
  if (!value) throw new Error('useFlow는 FlowProvider 안에서만 사용할 수 있습니다.');
  return value;
}
