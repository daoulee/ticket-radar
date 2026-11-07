import { router, Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createApiFromEnvironment } from '../api';
import { BrandSplash } from '../brand/BrandSplash';
import { SplashDoneContext } from '../brand/SplashGate';
import { StatusScreen } from '../components/StatusScreen';
import { Pill } from '../components/ui';
import { FlowProvider } from '../state/FlowContext';
import { createMarketFromEnvironment } from '../market/api';
import { MarketProvider } from '../market/MarketContext';
import { colors } from '../ui/theme';

// 네이티브 시작 화면(흰 배경, app.json expo-splash-screen)을 JS 브랜드 연출의 첫 프레임까지 유지해 색 튐을 막는다.
// 숨기기 실패는 무시한다(앱 진입을 막지 않음).
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 180 });

// 앱 전체에서 API 인스턴스 하나와 흐름 상태 하나를 공유한다.
// 시작 브랜드 연출(BrandSplash)은 앱을 켤 때 한 번만, 첫 화면 위에 덮어 재생한다. 첫 화면과 공연 조회는 그 아래에서 이미 실행된다.
export default function RootLayout() {
  const [api] = useState(createApiFromEnvironment);
  const [market] = useState(createMarketFromEnvironment);
  const [splash, setSplash] = useState(true);
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SplashDoneContext.Provider value={!splash}>
      <MarketProvider api={market}>
      <FlowProvider api={api}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerBackTitle: '이전',
            headerShadowVisible: false,
            headerTitleStyle: { fontSize: 16, fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
            // 화면 이동: iOS 기본 밀어내기 전환(제스처 뒤로가기 유지)
            animation: 'default',
            animationDuration: 320,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* 화면 전환(APP-028): 탐색은 옆으로 밀기, 결제·로그인은 아래에서 올라오는 시트, 결제 후 거래 화면은 페이드. 제스처 뒤로가기 유지. */}
          {(
            [
              ['about', 'slide_from_right'],
              ['show/[id]', 'slide_from_right'],
              ['performance/[id]', 'slide_from_right'],
              ['performance-listings/[id]', 'slide_from_right'],
              ['item/[id]', 'slide_from_right'],
              ['checkout/[id]', 'slide_from_bottom'],
              ['order/[id]', 'fade'],
              ['login', 'slide_from_bottom'],
              ['notifications', 'slide_from_right'],
            ] as const
          ).map(([name, animation]) => (
            <Stack.Screen
              key={name}
              name={name}
              options={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                animation,
                animationDuration: animation === 'fade' ? 260 : 340,
                gestureEnabled: true,
                ...(animation === 'slide_from_bottom' ? { gestureDirection: 'vertical' as const } : null),
              }}
            />
          ))}
          <Stack.Screen name="events" options={{ title: '공연 선택' }} />
          <Stack.Screen name="listing" options={{ title: '판매글 입력' }} />
          <Stack.Screen name="review" options={{ title: '추출값 확인' }} />
          <Stack.Screen name="result" options={{ title: '확인사항 결과' }} />
          <Stack.Screen name="report" options={{ title: '제보 근거 정리' }} />
          <Stack.Screen name="admin" options={{ title: '주최 측 제보함' }} />
        </Stack>
      </FlowProvider>
      </MarketProvider>
      </SplashDoneContext.Provider>
      {splash ? (
        <BrandSplash onFirstFrame={() => SplashScreen.hide()} onDone={() => setSplash(false)} />
      ) : null}
      </View>
    </SafeAreaProvider>
  );
}

// 공통 · 잠시 문제가 생겼어요(500에 해당하는 앱 오류 경계) — 조원 목업 부속 화면.
// 입력 내용은 이 화면(기기)에만 있고 서버에 저장되지 않는다.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <StatusScreen icon="info" title="잠시 문제가 생겼어요" body="입력한 내용은 이 화면에만 있고 서버에 저장되지 않아요. 잠시 후 다시 시도해 주세요.">
      <Pill label="다시 시도" icon="refresh" onPress={() => void retry()} />
      <Pill label="홈으로 가기" icon="arrowLeft" tone="dark" onPress={() => router.replace('/')} />
    </StatusScreen>
  );
}
