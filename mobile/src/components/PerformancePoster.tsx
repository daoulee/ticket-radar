import { useContext, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { Icon } from './ui';
import { t, tt } from '../ui/toss';

export function PerformancePoster({ uri, intro = false }: { uri: string | null; intro?: boolean }) {
  const { width: screenWidth } = useWindowDimensions();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const reduceMotion = useReducedMotion();
  const insets = useContext(SafeAreaInsetsContext);
  const ratio = size ? size.width / size.height : 0.7;
  const width = Math.min(Math.max(screenWidth - 48, 1), 320, 440 * ratio);
  const height = width / ratio;
  if (!uri || failed) return <View style={{ height: 120, borderRadius: 12, backgroundColor: t.g1, justifyContent: 'center', alignItems: 'center' }}><Text style={tt.desc}>포스터를 불러올 수 없어요</Text></View>;
  const close = () => { setOpen(false); setZoom(1); };
  const previewWidth = Math.max(screenWidth - 32, 1);
  return <>
  <Pressable accessibilityRole="button" accessibilityLabel={intro ? '공연 상세 이미지 보기' : '공연 포스터 확대 보기'} accessibilityHint="이미지를 크게 볼 수 있어요" onPress={() => setOpen(true)} style={intro ? { minHeight: 48, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: t.g1 } : { alignSelf: 'center' }}>
  {intro ? <Text style={[tt.body, { color: t.g7 }]}>공연 상세 이미지 보기  ›</Text> : <Image source={{ uri }} onLoad={({ nativeEvent }) => {
    const { width: imageWidth, height: imageHeight } = nativeEvent.source;
    if (Number.isFinite(imageWidth) && Number.isFinite(imageHeight) && imageWidth > 0 && imageHeight > 0) setSize({ width: imageWidth, height: imageHeight });
  }} onError={() => setFailed(true)} accessibilityLabel="공연 포스터" resizeMode="contain" style={{ width, height, alignSelf: 'center', borderRadius: 12, backgroundColor: t.g1 }} />}
  </Pressable>
  {!intro && <Text style={[tt.desc, { textAlign: 'center' }]}>포스터를 눌러 크게 보기</Text>}
  <Modal visible={open} animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={close}>
    <View testID="poster-viewer-safe-area" style={{ flex: 1, backgroundColor: '#191F28', paddingTop: Math.max(insets?.top ?? 0, Platform.OS === 'ios' ? 44 : StatusBar.currentHeight ?? 0), paddingBottom: insets?.bottom ?? 0 }} accessibilityViewIsModal>
      <View style={{ minHeight: 64, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 4 }}><Text accessibilityRole="header" style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{intro ? '공연 상세 이미지' : '공연 포스터'}</Text><Text style={{ color: '#B0B8C1', fontSize: 12 }}>KOPIS 제공 이미지</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="포스터 닫기" onPress={close} style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, backgroundColor: pressed ? '#4E5968' : '#303B49', alignItems: 'center', justifyContent: 'center' })}><Icon name="x" size={20} color="#FFFFFF" /></Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={{ uri }} onLoad={({ nativeEvent }) => { const { width: w, height: h } = nativeEvent.source; if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) setSize({ width: w, height: h }); }} onError={() => { setOpen(false); setFailed(true); }} accessibilityLabel={intro ? '확대한 공연 상세 이미지' : '확대한 공연 포스터'} resizeMode="contain" style={{ width: previewWidth * zoom, height: previewWidth * zoom / ratio }} />
        </ScrollView>
      </ScrollView>
      <View style={{ alignItems: 'center', paddingVertical: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#303B49', borderRadius: 28, paddingHorizontal: 4 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="포스터 축소" disabled={zoom <= 1} onPress={() => setZoom((value) => Math.max(1, value - 0.5))} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center', opacity: zoom <= 1 ? 0.4 : 1 }}><View style={{ width: 18, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' }} /></Pressable>
          <Text accessibilityLabel={`확대 배율 ${Math.round(zoom * 100)}퍼센트`} style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center', minWidth: 64 }}>{Math.round(zoom * 100)}%</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="포스터 확대" disabled={zoom >= 3} onPress={() => setZoom((value) => Math.min(3, value + 0.5))} style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center', opacity: zoom >= 3 ? 0.4 : 1 }}><Icon name="plus" size={20} color="#FFFFFF" /></Pressable>
        </View>
        <Text style={{ color: '#B0B8C1', fontSize: 12 }}>확대한 후 움직여서 살펴보세요</Text>
      </View>
    </View>
  </Modal>
  </>;
}
