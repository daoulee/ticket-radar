import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space, type } from '../ui/theme';
import { FooterNote, Icon, Pill, type IconName } from './ui';

// 목업 부속 공통 상태 화면(404·500·401): 가운데 아이콘 → 제목 → 설명 → 행동 → 하단 참고 문구.
export function StatusScreen({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <SafeAreaView style={s.safe}>
      <Text style={[type.title, { textAlign: 'center', fontWeight: '700' }]}>티켓레이더</Text>
      <View style={s.center}>
        <Icon name={icon} size={22} color={colors.muted} />
        <Text accessibilityRole="header" style={[type.h2, { textAlign: 'center' }]}>
          {title}
        </Text>
        <Text style={[type.sub, { textAlign: 'center' }]}>{body}</Text>
        <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
          {children ?? <Pill label="홈으로 가기" icon="arrowLeft" tone="dark" onPress={() => router.replace('/')} />}
        </View>
      </View>
      <FooterNote />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: space.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.lg },
});
