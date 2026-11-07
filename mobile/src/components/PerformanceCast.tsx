import { ScrollView, Text, View } from 'react-native';
import { Icon } from './ui';
import { t, tt } from '../ui/toss';

// KOPIS provides a display string, not stable person identifiers. Preserve the
// original string and split only commas outside parentheses for presentation.
export function splitCast(cast: string): string[] {
  const items: string[] = [];
  let start = 0;
  let depth = 0;
  for (let i = 0; i < cast.length; i++) {
    if (cast[i] === '(' || cast[i] === '（') depth++;
    else if (cast[i] === ')' || cast[i] === '）') depth = Math.max(0, depth - 1);
    else if (cast[i] === ',' && depth === 0) {
      const item = cast.slice(start, i).trim();
      if (item) items.push(item);
      start = i + 1;
    }
  }
  const last = cast.slice(start).trim();
  if (last) items.push(last);
  return items;
}

export function PerformanceCast({ cast }: { cast: string | null }) {
  const entries = cast ? splitCast(cast) : [];
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={tt.h2}>출연진</Text>
    {entries.length ? <>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 16, paddingVertical: 4 }}>
        {entries.map((entry, index) => <View key={`${index}-${entry}`} style={{ width: 88, alignItems: 'center', gap: 8 }}>
          <View accessible accessibilityLabel={`${entry}, 프로필 사진 미제공`} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: t.g1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={32} color={t.g5} stroke={1.4} />
          </View>
          <Text style={[tt.desc, { color: t.g7, textAlign: 'center' }]}>{entry}</Text>
        </View>)}
      </ScrollView>
      <Text style={tt.desc}>KOPIS 제공 출연진 · 프로필 사진 미제공</Text>
      <Text style={tt.desc}>원문: {cast}</Text>
    </> : <Text style={tt.desc}>제공된 출연진 정보가 없어요.</Text>}
  </View>;
}
