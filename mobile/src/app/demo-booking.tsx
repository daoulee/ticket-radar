import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ShowArt } from '../ui/ShowArt';
import { Chips, CTA, TNav, TScreen, t, tt, won } from '../ui/toss';

type Stage = 'show' | 'queue' | 'seats' | 'review' | 'payment' | 'processing' | 'done';
const shows = [
  { id: 'demo-radar-live', category: 'concert' as const, title: '레이더 라이브 2026', date: '2026.11.21 19:00', seat: 'VIP석', price: 154000 },
  { id: 'demo-musical', category: 'musical' as const, title: '뮤지컬 나침반', date: '2026.12.05 14:00', seat: 'R석', price: 110000 },
];
const seats = ['A', 'B', 'C'].flatMap((row) => Array.from({ length: 8 }, (_, i) => `${row}${i + 1}`));
const unavailable = new Set(['A3', 'A6', 'B3', 'B7']);

// 웹의 가상 예매와 같은 입력을 사용하지만 서버 주문과 좌석 예약은 만들지 않는다.
export default function DemoBooking() {
  const [stage, setStage] = useState<Stage>('show');
  const [show, setShow] = useState<(typeof shows)[number]>(shows[0]);
  const [seat, setSeat] = useState('');
  const [method, setMethod] = useState('card');
  useEffect(() => {
    if (stage !== 'queue' && stage !== 'processing') return;
    const timer = setTimeout(() => setStage(stage === 'queue' ? 'seats' : 'done'), stage === 'queue' ? 2500 : 1200);
    return () => clearTimeout(timer);
  }, [stage]);
  function back() {
    if (stage === 'show') router.back();
    else if (stage === 'queue' || stage === 'seats' || stage === 'done') setStage('show');
    else if (stage === 'review') setStage('seats');
    else if (stage === 'payment') setStage('review');
    else setStage('payment');
  }
  return <TScreen top={<TNav onBack={back} />}><View style={{ paddingHorizontal: 24, paddingBottom: 32, gap: 18 }}>
    <Text style={[tt.desc, { color: t.primary }]}>가상 공연 · 예매 시연</Text>
    {stage === 'show' && <><Text accessibilityRole="header" style={tt.hero}>어떤 공연을 체험할까요?</Text><Text style={tt.desc}>가상의 공연과 좌석으로 예매 흐름을 체험해요.</Text>{shows.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title} 예매 체험`} onPress={() => { setShow(item); setSeat(''); setStage('queue'); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 }}><ShowArt id={item.id} category={item.category} size={72} /><View style={{ flex: 1, gap: 5 }}><Text style={tt.h2}>{item.title}</Text><Text style={tt.desc}>{item.date} · {item.seat}</Text><Text style={tt.body}>{won(item.price)}</Text></View></Pressable>)}</>}
    {stage === 'queue' && <><ActivityIndicator size="large" color={t.primary} /><Text accessibilityRole="header" style={tt.hero}>예매 페이지로 이동하고 있어요</Text><Text style={tt.body}>가상 대기 화면이에요. 실제 대기 인원은 표시하지 않아요.</Text><CTA label="대기 건너뛰기" onPress={() => setStage('seats')} /></>}
    {stage === 'seats' && <><Text accessibilityRole="header" style={tt.hero}>어디에서 관람할까요?</Text><Text style={tt.desc}>{show.title} · {show.date}{'\n'}가상의 {show.seat} 1석을 선택해 주세요. 실제 배치나 잔여석이 아니에요.</Text><View style={{ backgroundColor: t.g1, padding: 12, alignItems: 'center', borderRadius: 8 }}><Text style={tt.body}>무대</Text></View><View accessibilityLabel="좌석 안내" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      <Text style={tt.desc}>○ 선택 가능</Text><Text style={[tt.desc, { color: t.primary }]}>● 선택한 좌석</Text><Text style={[tt.desc, { color: t.g7 }]}>× 선택 불가</Text>
    </View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>{seats.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value} 좌석${unavailable.has(value) ? ' · 선택 불가' : ''}`} accessibilityState={{ selected: seat === value, disabled: unavailable.has(value) }} disabled={unavailable.has(value)} onPress={() => setSeat(value)} style={{ width: '11%', minWidth: 32, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: seat === value ? t.primary : unavailable.has(value) ? '#D3D8DE' : t.g1 }}><Text style={{ fontSize: 11, fontWeight: '600', color: seat === value ? t.white : unavailable.has(value) ? t.g7 : t.ink }}>{value}</Text>{unavailable.has(value) && <Text accessible={false} style={{ fontSize: 13, fontWeight: '700', color: t.g7, lineHeight: 14 }}>×</Text>}</Pressable>)}</View><Text accessibilityLiveRegion="polite" style={tt.body}>선택 {seat ? `1 / 1석 · ${seat}` : '0 / 1석'}</Text><CTA label="선택한 좌석 확인하기" disabled={!seat} onPress={() => setStage('review')} /></>}
    {stage === 'review' && <><Text accessibilityRole="header" style={tt.hero}>구매 정보를 확인해 주세요</Text><View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}><ShowArt id={show.id} category={show.category} size={92} /><View style={{ flex: 1, gap: 5 }}><Text style={tt.h2}>{show.title}</Text><Text style={tt.desc}>{show.date}</Text></View></View><Text style={tt.body}>좌석 · {show.seat} {seat} 1매</Text><Text style={tt.h2}>시연 합계 · {won(show.price)}</Text><Text style={tt.desc}>실제 결제, 좌석 예약과 티켓 양도는 진행되지 않아요.</Text><CTA label="시연 결제 계속하기" onPress={() => setStage('payment')} /></>}
    {stage === 'payment' && <><Text accessibilityRole="header" style={tt.hero}>결제 방법을 선택해 주세요</Text><Text style={tt.desc}>실제 결제 정보는 입력하지 않아요.</Text><Chips items={[{ key: 'card', label: '카드' }, { key: 'bank', label: '계좌이체' }]} value={method} onChange={setMethod} /><Text style={tt.h2}>{won(show.price)}</Text><Text style={tt.desc}>시연 결제예요. 실제 돈이 오가지 않으며 좌석이 예약되지 않아요.</Text><CTA label={`${won(show.price)} 시연 결제하기`} onPress={() => setStage('processing')} /></>}
    {stage === 'processing' && <><ActivityIndicator size="large" color={t.primary} /><Text accessibilityRole="header" style={tt.hero}>시연 결제를 처리하고 있어요</Text><Text style={tt.desc}>실제 결제 요청이나 금전 이동은 없어요.</Text></>}
    {stage === 'done' && <><Text accessibilityRole="header" style={tt.hero}>시연 결제가 완료됐어요</Text><Text style={tt.body}>{show.title} · {show.seat} {seat}</Text><Text style={tt.body}>{method === 'card' ? '카드' : '계좌이체'} · {won(show.price)}</Text><Text style={tt.desc}>실제 결제·좌석 예약·티켓 발급은 이뤄지지 않았어요. 시연 내역은 이 화면을 나가면 사라져요.</Text><CTA label="다른 공연 둘러보기" onPress={() => setStage('show')} /></>}
  </View></TScreen>;
}
