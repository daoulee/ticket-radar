import { Stack } from 'expo-router';
import { StatusScreen } from '../components/StatusScreen';

// 공통 · 주소를 찾지 못했어요(404) — 조원 목업 부속 화면.
export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusScreen icon="help" title="주소를 찾지 못했어요" body="주소가 바뀌었거나 잘못 입력했을 수 있어요." />
    </>
  );
}
