import { useState } from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { Category } from '../market/engine';

// 공연 썸네일(APP-028). 사용자 지시(2026-11-04): "썸네일은 우선 무작위로 갖고 오자(임시)".
// 임시 이미지: Lorem Picsum(무료 사진, Unsplash 라이선스)에서 공연 id 로 고정된 무작위 사진을 가져온다 — 실제 공연 포스터가 아니다.
// 불러오기 전·실패(오프라인) 시에는 공연 id 로 만든 그라디언트를 보여 준다. 정식 출처가 정해지면 imageUrl 만 바꾼다.
const PALETTES: [string, string][] = [
  ['#404890', '#8D95CE'],
  ['#1F2A44', '#5B6BB5'],
  ['#3B2F63', '#C08BD6'],
  ['#0F4C5C', '#5FB3B3'],
  ['#5A2A27', '#E08E6D'],
  ['#2D3A1F', '#9DBF7B'],
];
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const tempImageUrl = (id: string, px: number) => `https://picsum.photos/seed/${encodeURIComponent(id)}/${px}/${px}`;
const GLYPH: Record<Category, string> = { concert: '♪', musical: '✦', sports: '⚾︎' };

export function ShowArt({
  id,
  category,
  size,
  width,
  height,
  radius = 12,
  round,
  imageUrl,
  style,
}: {
  id: string;
  category: Category;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  round?: boolean;
  imageUrl?: string | null;
  style?: StyleProp<ViewStyle>;
}) {
  const w = width ?? size ?? 48;
  const h = height ?? size ?? 48;
  const r = round ? Math.min(w, h) / 2 : radius;
  const [c1, c2] = PALETTES[hash(id) % PALETTES.length];
  const [ok, setOk] = useState(true);
  const px = Math.min(800, Math.round(Math.max(w, h) * 2 / 50) * 50 || 100);
  const image = imageUrl === undefined ? tempImageUrl(id, px) : imageUrl;
  return (
    <View accessible={false} style={[{ width: w, height: h, borderRadius: r, overflow: 'hidden', backgroundColor: c1 }, style]}>
      <Svg width={w} height={h} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </LinearGradient>
        </Defs>
        <Rect width={w} height={h} fill={`url(#g${id})`} />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: Math.max(14, Math.min(w, h) * 0.38), fontWeight: '700' }}>{GLYPH[category]}</Text>
      </View>
      {ok && image ? (
        <Animated.View entering={FadeIn.duration(260).reduceMotion(ReduceMotion.System)} style={{ position: 'absolute', inset: 0 }}>
          <Image source={{ uri: image }} onError={() => setOk(false)} style={{ width: w, height: h }} resizeMode="cover" accessibilityIgnoresInvertColors />
        </Animated.View>
      ) : null}
    </View>
  );
}
