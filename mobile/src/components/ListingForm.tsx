import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { MAX_LISTING_LENGTH } from '../api/demoApi';
import type { DemoScenario } from '../demo/fixtures';
import { colors } from '../ui/theme';
import { Button, styles } from './common';

// 입력 단계의 검사는 '보낼 수 있는 글인가'만 본다. 내용 판단은 서버가 한다.
export function validateListing(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return '판매글을 붙여넣거나 입력하세요.';
  // 계약은 공백을 포함한 원문 길이로 제한한다.
  if (text.length > MAX_LISTING_LENGTH) return `판매글은 ${MAX_LISTING_LENGTH}자 이하로 입력하세요.`;
  return null;
}

export function ListingForm({
  text,
  onChangeText,
  samples,
}: {
  text: string;
  onChangeText: (text: string) => void;
  samples: DemoScenario[];
}) {
  // 포커스 링: 안쪽 진한 선 + 바깥 옅은 후광(토스식). 레이아웃이 흔들리지 않게 두께는 같게 두고 색만 바꾼다.
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ borderRadius: 16, padding: 3, backgroundColor: focused ? colors.liveBg : 'transparent' }}>
      <TextInput
        accessibilityLabel="판매글 입력"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { minHeight: 180, textAlignVertical: 'top', paddingTop: 14, paddingHorizontal: 14, fontSize: 16, lineHeight: 24, borderRadius: 13 },
          { borderWidth: 1.5, borderColor: focused ? colors.primary : colors.border },
        ]}
        multiline
        placeholder="중고 거래 앱·커뮤니티의 판매글을 길게 눌러 붙여넣으세요."
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
      </View>
      <Text style={[styles.small, text.length > MAX_LISTING_LENGTH && { color: colors.errorText }]}>
        {text.length.toLocaleString('ko-KR')} / {MAX_LISTING_LENGTH.toLocaleString('ko-KR')}자
      </Text>
      {samples.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={[styles.small, { color: colors.demoText, fontWeight: '700' }]}>
            시연용 예시 판매글 (합성 데이터)
          </Text>
          {samples.map((s) => (
            <View key={s.id} style={{ gap: 4 }}>
              <Button label={s.label} variant="secondary" onPress={() => onChangeText(s.listingText)} />
              <Text style={styles.small}>{s.description}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={styles.small}>
        판매글은 데이터로만 다루며, 글 안의 지시문이나 스크립트는 실행하지 않습니다.
      </Text>
    </View>
  );
}
