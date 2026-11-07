import { Redirect, router, Stack } from 'expo-router';
import { StepTabs } from '../components/StepTabs';
import { View } from 'react-native';
import { Button, ModeBanner, Screen } from '../components/common';
import { ResultView } from '../components/ResultView';
import { FooterNote } from '../components/ui';
import { useFlow } from '../state/FlowContext';
import { space } from '../ui/theme';

// ③ 확인사항 결과(조원 목업 b3zFf9 구조 + 웹 테마, APP-015). 판매글 원문·공식 출처·확인 시각을 함께 보여준다.
// 하단: 값 수정하고 다시 대조 / 제보 근거 정리(④, PDF) / 다른 판매글 확인.
export default function ResultScreen() {
  const { api, event, listingText, result } = useFlow();

  if (!event || result.status !== 'success') return <Redirect href="/review" />;

  return (
    <Screen
      footer={
        <>
          <Button label="값 수정하고 다시 대조" onPress={() => router.back()} />
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="제보 근거 정리" icon="file" variant="secondary" onPress={() => router.push('/report')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="다른 판매글 확인" variant="secondary" onPress={() => router.navigate('/listing')} />
            </View>
          </View>
        </>
      }
    >
      <Stack.Screen options={{ title: '확인사항 결과' }} />
      <ModeBanner mode={api.mode} label={api.label} />
      <StepTabs current={4} />
      <ResultView result={result.data} event={event} listingText={listingText} />
      <FooterNote />
    </Screen>
  );
}
