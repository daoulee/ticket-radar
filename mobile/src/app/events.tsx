import { router, useLocalSearchParams } from 'expo-router';
import { StepTabs } from '../components/StepTabs';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { isDemoApi } from '../api';
import { Button, Disclaimer, ModeBanner, Screen, styles, Title } from '../components/common';
import { EventList } from '../components/EventList';
import { useFlow } from '../state/FlowContext';
import { colors, MIN_TOUCH, space } from '../ui/theme';

// 1단계: 공연 선택(홈 다음). 기존 index 의 동작을 그대로 옮겼다.
export default function EventsScreen() {
  const { api, events, searchEvents, selectEvent, loadDemoScenario, runDevLiveCheck } = useFlow();
  const [query, setQuery] = useState('');
  const [failArmed, setFailArmed] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { demoScenario, demoStep, demoConfirm, devLive, devEvent, devText, devFields } = useLocalSearchParams<{
    demoScenario?: string;
    demoStep?: string;
    demoConfirm?: string;
    devLive?: string;
    devEvent?: string;
    devText?: string;
    devFields?: string;
  }>();

  useEffect(() => {
    void searchEvents('');
  }, [searchEvents]);

  // 개발 빌드·시연 모드 전용 바로가기: ticketradar:///events?demoScenario=A&demoStep=result(&demoConfirm=1)
  // demoConfirm=1 은 비교 전제 조건(공연 일치·티켓 금액만·기본가)을 사용자가 고른 상태를 재현한다.
  // 화면 표시 확인용이며 배포 빌드(__DEV__=false)와 실제 API 모드에서는 무시된다.
  useEffect(() => {
    if (!__DEV__ || api.mode !== 'demo' || !demoScenario) return;
    const step = demoStep === 'listing' || demoStep === 'review' ? demoStep : 'result';
    void loadDemoScenario(demoScenario, step, demoConfirm === '1').then((ok) => {
      if (!ok) return;
      router.push('/listing');
      if (step !== 'listing') router.push('/review');
      if (step === 'result') router.push('/result');
    });
  }, [api.mode, demoScenario, demoStep, demoConfirm, loadDemoScenario]);

  // 개발 빌드·실제 API 모드 전용 바로가기(시뮬레이터 화면 확인용):
  // ticketradar:///events?devLive=extract|manual&devEvent=<id>&devText=<판매글>&devFields=<확인값 JSON>
  // 배포 빌드(__DEV__=false)와 시연 모드에서는 무시된다.
  useEffect(() => {
    if (!__DEV__ || api.mode !== 'live' || (devLive !== 'extract' && devLive !== 'manual') || !devEvent || !devText) return;
    let fields;
    try {
      fields = devFields ? JSON.parse(devFields) : undefined;
    } catch {
      return;
    }
    void runDevLiveCheck({ eventId: devEvent, listingText: devText, mode: devLive, fields }).then((to) => {
      if (!to) return;
      router.push('/listing');
      if (to !== 'listing') router.push('/review');
      if (to === 'result') router.push('/result');
    });
  }, [api.mode, devLive, devEvent, devText, devFields, runDevLiveCheck]);

  return (
    <Screen>
      <ModeBanner mode={api.mode} label={api.label} />
      <StepTabs current={1} />
      <Title sub="판매글에 적힌 공연을 고르세요. 공식 가격·입장 규정과 나란히 비교합니다.">어떤 공연의 티켓인가요?</Title>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          accessibilityLabel="공연명 검색"
          style={[styles.input, { flex: 1 }]}
          placeholder="공연명 검색"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => void searchEvents(query)}
        />
        <Button label="검색" variant="secondary" onPress={() => void searchEvents(query)} />
      </View>
      <EventList
        events={events}
        onRetry={() => void searchEvents(query)}
        onSelect={(event) => {
          selectEvent(event);
          router.push('/listing');
        }}
      />
      {/* 개발 빌드 + 시연 모드 전용. 배포 빌드에는 보이지 않는다. */}
      {__DEV__ && isDemoApi(api) ? (
        <View style={{ gap: space.sm }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: toolsOpen }}
            onPress={() => setToolsOpen((o) => !o)}
            style={{ minHeight: MIN_TOUCH, justifyContent: 'center' }}
          >
            <Text style={styles.small}>{toolsOpen ? '▾' : '▸'} 개발용 시연 도구</Text>
          </Pressable>
          {toolsOpen ? (
            <>
              <Text style={styles.small}>네트워크 실패 화면을 보여줄 때만 사용합니다. 다음 대조 요청 1회가 실패합니다.</Text>
              <Button
                label={failArmed ? '다음 요청 실패 예약됨' : '다음 대조 요청을 실패시키기'}
                variant="secondary"
                disabled={failArmed}
                onPress={() => {
                  api.failNext('checks');
                  setFailArmed(true);
                }}
              />
            </>
          ) : null}
        </View>
      ) : null}
      <Disclaimer />
    </Screen>
  );
}
