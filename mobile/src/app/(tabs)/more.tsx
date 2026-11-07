import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFlow } from '../../state/FlowContext';
import { useMarket } from '../../market/MarketContext';
import { Band, Row, Section, t, tt } from '../../ui/toss';

// 전체: 계정 · 안심 도구(외부 판매글 확인=기존 암표 방지 흐름) · 주최 측 제보함 · 서비스 소개.
export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { me, signOut, api } = useMarket();
  const { resetFlow } = useFlow();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.white }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}>
        <Text accessibilityRole="header" style={tt.hero}>전체</Text>
      </View>
      <Section>
        {me ? (
          <Row title={me.name} desc={`${api.mode === 'demo' ? '시연 계정' : '계정'} · 알림 ${me.alertsOn ? '켜짐' : '꺼짐'}`} icon="user" end="chevronRight" onPress={() => router.push('/favorites')} />
        ) : (
          <Row title="로그인하기" desc="즐겨찾기·알림·거래를 계정에 저장해요" icon="user" end="chevronRight" onPress={() => router.push('/login')} />
        )}
      </Section>
      <Band />
      <Section title="안심 도구">
        <Row title="다른 곳 판매글 확인하기" desc="중고 거래 글을 붙여넣으면 공식 자료와 대조해요" icon="search" end="chevronRight" onPress={() => { resetFlow(); router.push('/events'); }} />
        <Row title="주최 측 제보함" desc="담당자 시연 계정 전용" icon="lock" end="chevronRight" onPress={() => router.push('/admin')} />
      </Section>
      <Band />
      <Section title="티켓레이더">
        <Row title="서비스 소개" desc="판매글 속 단서를 공식 안내와 나란히 보는 법" icon="info" end="chevronRight" onPress={() => router.push('/about')} />
        {me ? <Row title="로그아웃" onPress={() => void signOut()} /> : null}
      </Section>
      <Text style={[tt.desc, { paddingHorizontal: 24, paddingTop: 12 }]}>
        결제는 시연이며 실제 돈이 오가지 않아요. 안심 확인은 공식 자료와의 비교이며 티켓 진위·입장을 보증하지 않아요.
      </Text>
    </ScrollView>
  );
}
