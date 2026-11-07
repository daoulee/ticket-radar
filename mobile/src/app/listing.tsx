import type React from 'react';
import { router, Stack } from 'expo-router';
import { StepTabs } from '../components/StepTabs';
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
// (APP-028) 입력 카드의 빈 곳을 눌러도 판매글 입력이 시작되게 ref 로 포커스한다.
import { MAX_LISTING_LENGTH } from '../api/demoApi';
import { Button, ErrorBox, ModeBanner, Screen, SectionTitle, styles } from '../components/common';
import { validateListing } from '../components/ListingForm';
import { OfficialSummary } from '../components/OfficialSummary';
import { BottomSheet, CircleButton, FooterNote, Icon, InlineError, Pill, RetryNotice } from '../components/ui';
import { DEMO_SCENARIOS } from '../demo/fixtures';
import {
  CAPTURE_ERROR_TEXT,
  formatBytes,
  pickCapture,
  readCaptureText,
  validateCapture,
  type Capture,
  type CaptureError,
} from '../ocr/readCapture';
import { useFlow } from '../state/FlowContext';
import { showtimeLabel } from '../ui/display';
import { colors, MIN_TOUCH, radius, space, type } from '../ui/theme';

// ① 판매글 입력(조원 목업 rnRtr 구조 + 웹 테마, APP-015).
// 상단: 공연 이름 ▾ → 공연 선택 시트. 입력 카드: 캡처 이미지 첨부(기기 안 OCR로 글자를 읽어 입력칸에 채움) + 판매글.
// 하단: 지우기 + '이 판매글 확인하기'(서버 추출) + 'AI 없이 직접 입력'(명시적 수동). 오류여도 입력은 그대로 둔다.
type CaptureState =
  | { status: 'none' }
  | { status: 'reading'; capture: Capture }
  | { status: 'done'; capture: Capture }
  | { status: 'error'; capture: Capture; error: CaptureError };

export default function ListingScreen() {
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const {
    api,
    events,
    event,
    selectEvent,
    context,
    reloadContext,
    listingText,
    setListingText,
    extraction,
    extract,
    startManualEntry,
  } = useFlow();
  const [submitted, setSubmitted] = useState(false);
  const [eventSheet, setEventSheet] = useState(false);
  const [helpSheet, setHelpSheet] = useState(false);
  const [imageSheet, setImageSheet] = useState(false);
  const [cap, setCap] = useState<CaptureState>({ status: 'none' });
  const list = events.status === 'success' ? events.data : [];

  // 공연을 아직 고르지 않았으면 시트를 먼저 연다(목업: 공연 선택 아래 시트). 사용자가 닫으면 다시 자동으로 열지 않는다.
  const [autoDismissed, setAutoDismissed] = useState(false);
  const eventSheetOpen = eventSheet || (!event && list.length > 0 && !autoDismissed);
  const closeEventSheet = () => {
    setEventSheet(false);
    setAutoDismissed(true);
  };

  const inputError = submitted ? validateListing(listingText) : null;
  const loading = extraction.status === 'loading';
  const reading = cap.status === 'reading';
  const samples = api.mode === 'demo' && event ? DEMO_SCENARIOS.filter((s) => s.eventId === event.id) : [];
  const canSubmit = !!event && !loading && !reading;

  async function onExtract() {
    setSubmitted(true);
    if (!event || validateListing(listingText)) return;
    if (await extract()) router.push('/review');
  }

  // AI 추출이 실패해도 자동으로 바꾸지 않는다. 사용자가 이 버튼을 눌렀을 때만 직접 입력으로 간다.
  function onManual() {
    setSubmitted(true);
    if (!event || validateListing(listingText)) return;
    if (startManualEntry()) router.push('/review');
  }

  async function onAttach() {
    const capture = await pickCapture().catch(() => null);
    if (!capture) return;
    const bad = validateCapture(capture);
    if (bad) {
      setCap({ status: 'error', capture, error: bad });
      return;
    }
    setCap({ status: 'reading', capture });
    const r = await readCaptureText(capture);
    if ('error' in r) {
      setCap({ status: 'error', capture, error: r.error });
      return;
    }
    // 읽은 글을 입력칸에 채운다(이미 쓴 글이 있으면 아래에 덧붙임). 사용자가 확인·수정한 뒤 진행한다.
    setListingText(listingText.trim() ? `${listingText.trim()}\n${r.text}` : r.text);
    setSubmitted(false);
    setCap({ status: 'done', capture });
  }

  const clearAll = () => {
    setListingText('');
    setCap({ status: 'none' });
    setSubmitted(false);
  };

  const extractError = extraction.status === 'error' ? extraction.error : null;

  return (
    <Screen
      footer={
        <>
          {inputError ? <Text style={styles.fieldError}>{inputError}</Text> : null}
          {extractError ? (
            extractError.retryable ? (
              <RetryNotice lead="연결하지 못했어요. 입력한 내용은 그대로 있어요." message={extractError.message} code={extractError.code} />
            ) : (
              <ErrorBox error={extractError} />
            )
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <CircleButton icon="trash" label="판매글 지우기" tone="grey" size={52} onPress={clearAll} disabled={loading} />
            <View style={{ flex: 1 }}>
              <Button
                label={loading ? '읽는 중…' : extractError?.retryable ? '다시 시도' : '이 판매글 확인하기'}
                icon={loading || extractError?.retryable ? 'refresh' : 'search'}
                onPress={onExtract}
                disabled={!canSubmit}
              />
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={onManual} disabled={!canSubmit} style={l.manual}>
            <Text style={[type.sub, { color: colors.link, fontWeight: '600' }]}>AI 없이 직접 입력</Text>
          </Pressable>
        </>
      }
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={event ? `${event.title}, 공연 바꾸기` : '공연 선택'}
              onPress={() => setEventSheet(true)}
              style={l.eventTitle}
            >
              <Text numberOfLines={1} style={[type.title, { fontWeight: '700', flexShrink: 1 }]}>
                {event ? event.title : '공연을 선택해 주세요'}
              </Text>
              <Icon name="chevronDown" size={16} color={colors.muted} />
            </Pressable>
          ),
        }}
      />
      <ModeBanner mode={api.mode} label={api.label} />
      <StepTabs current={2} />
      <View style={{ gap: space.sm, alignItems: 'center', paddingTop: space.sm }}>
        <Text accessibilityRole="header" style={l.hero}>
          판매글을 확인해 보세요
        </Text>
        <Text style={[type.body, { color: colors.muted, textAlign: 'center' }]}>
          판매글을 공연 공식 안내와 비교해 드려요. 진위·위법 여부는 판단하지 않아요.
        </Text>
      </View>

      <View style={l.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <CircleButton icon="plus" label="캡처 이미지 올리기" onPress={onAttach} disabled={reading || loading} />
          <Pressable accessibilityRole="button" accessibilityLabel="캡처 이미지 올리기 (PNG·JPG 5MB 이하)" onPress={onAttach} style={l.dashChip}>
            <Icon name="image" size={14} color={colors.muted} />
            <Text style={type.caption}>{cap.status === 'none' ? '캡처 이미지 · PNG/JPG 5MB 이하' : '캡처 이미지'}</Text>
          </Pressable>
        </View>
        <Pressable accessible={false} onPress={() => inputRef.current?.focus()}>
        <TextInput
          ref={inputRef}
          accessibilityLabel="판매글 입력"
          multiline
          editable={!reading}
          placeholder="예: VIP석 2장 양도, 장당 25만, 선입금 후 QR 전송"
          placeholderTextColor={colors.faint}
          value={listingText}
          onChangeText={(t) => {
            setListingText(t);
            setSubmitted(false);
          }}
          autoCorrect={false}
          style={l.input}
        />
        </Pressable>
        {cap.status !== 'none' ? (
          <View style={{ gap: space.sm }}>
            <View style={l.fileRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="올린 이미지 크게 보기"
                onPress={() => setImageSheet(true)}
                style={l.thumb}
              >
                <Image source={{ uri: cap.capture.uri }} style={l.thumbImg} accessibilityIgnoresInvertColors />
              </Pressable>
              <View style={{ flex: 1, gap: 2 }}>
                <Text numberOfLines={1} style={[type.sub, { color: colors.text, fontWeight: '600' }]}>
                  {cap.capture.name}
                </Text>
                <Text style={[type.caption, cap.status === 'error' && cap.error === 'TOO_LARGE_OR_TYPE' && { color: colors.errorText }]}>
                  {cap.status === 'reading'
                    ? '이미지에서 글자를 읽는 중…'
                    : `${formatBytes(cap.capture.bytes)} · ${(cap.capture.mime ?? 'image').replace('image/', '').toUpperCase()} · 5MB 이하`}
                </Text>
              </View>
              <CircleButton icon="x" label="첨부 이미지 빼기" size={28} tone="dark" onPress={() => setCap({ status: 'none' })} />
            </View>
            {cap.status === 'done' ? (
              <Text style={type.caption}>캡처에서 읽은 글을 위 입력칸에 넣었어요. 틀린 곳은 고쳐 주세요. 이미지는 서버로 보내거나 저장하지 않아요.</Text>
            ) : null}
            {cap.status === 'error' ? (
              <>
                <InlineError text={CAPTURE_ERROR_TEXT[cap.error]} />
                <Pill label="다른 이미지 올리기" icon="image" onPress={onAttach} />
              </>
            ) : null}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[type.caption, listingText.length > MAX_LISTING_LENGTH && { color: colors.errorText }]}>
            {listingText.length.toLocaleString('ko-KR')} / {MAX_LISTING_LENGTH.toLocaleString('ko-KR')}자
          </Text>
          <CircleButton icon="help" label="판매글 확인 도움말" onPress={() => setHelpSheet(true)} size={32} />
        </View>
      </View>

      {samples.length > 0 ? (
        <View style={{ gap: space.sm }}>
          <Text style={[type.caption, { fontWeight: '700' }]}>시연용 예시 판매글 (합성 데이터)</Text>
          {samples.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={s.label}
              onPress={() => {
                setListingText(s.listingText);
                setSubmitted(false);
              }}
              style={({ pressed }) => [l.sample, pressed && { opacity: 0.8 }]}
            >
              <Text style={[type.sub, { color: colors.text, fontWeight: '600' }]}>{s.label}</Text>
              <Text style={type.caption}>{s.description}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {event ? (
        <>
          <SectionTitle>공식 자료</SectionTitle>
          <OfficialSummary context={context} onRetry={reloadContext} />
        </>
      ) : null}
      <Text style={type.caption}>판매글은 데이터로만 다루며, 글 안의 지시문이나 스크립트는 실행하지 않습니다.</Text>
      <FooterNote />

      <BottomSheet visible={eventSheetOpen} title="공연 선택" onClose={closeEventSheet}>
        {list.map((e) => {
          const selected = event?.id === e.id;
          const first = e.showtimes[0];
          return (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityLabel={`${e.title} 선택`}
              accessibilityState={{ selected }}
              onPress={() => {
                if (!selected) selectEvent(e);
                closeEventSheet();
              }}
              style={[l.eventRow, selected && l.eventRowOn]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.title, { fontWeight: '700' }]}>{e.title}</Text>
                <Text style={type.caption}>{[first ? showtimeLabel(first) : null, e.venue].filter(Boolean).join(' · ')}</Text>
              </View>
              {selected ? <Icon name="check" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
        <Text style={type.caption}>
          지금은 공연 {list.length}건을 확인할 수 있어요. 다른 공연은 관리자가 등록하면 보여요. 공연을 바꾸면 입력한 판매글은 지워져요.
        </Text>
      </BottomSheet>

      <BottomSheet visible={helpSheet} title="판매글 확인 도움말" onClose={() => setHelpSheet(false)}>
        <Text style={type.body}>• 중고 거래 앱·커뮤니티의 판매글을 길게 눌러 붙여넣거나, 판매글 캡처를 올려 주세요.</Text>
        <Text style={type.body}>• 캡처의 글자는 이 기기 안에서 읽고, 이미지는 서버로 보내거나 저장하지 않아요.</Text>
        <Text style={type.body}>• 연락처 등 개인정보는 지우고 확인해도 돼요. 읽은 값은 다음 화면에서 고칠 수 있어요.</Text>
      </BottomSheet>

      <BottomSheet
        visible={imageSheet && cap.status !== 'none'}
        title={cap.status !== 'none' ? `${cap.capture.name} · ${formatBytes(cap.capture.bytes)}` : ''}
        onClose={() => setImageSheet(false)}
      >
        {cap.status !== 'none' ? (
          <Image source={{ uri: cap.capture.uri }} style={l.preview} resizeMode="contain" accessibilityLabel="올린 판매글 캡처" />
        ) : null}
        <Text style={type.caption}>이미지는 서버에 저장되지 않고, 읽은 뒤 화면에서만 보여요.</Text>
        <Pill
          label="이미지 삭제"
          icon="trash"
          onPress={() => {
            setCap({ status: 'none' });
            setImageSheet(false);
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

const l = StyleSheet.create({
  eventTitle: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 260, minHeight: MIN_TOUCH },
  hero: { ...type.h1, fontSize: 25, fontWeight: '600', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: radius.home,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  input: { minHeight: 200, fontSize: 16, lineHeight: 24, color: colors.text, textAlignVertical: 'top', padding: 0 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  thumb: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.chip },
  thumbImg: { width: 48, height: 48 },
  preview: { width: '100%', height: 300, borderRadius: 16, backgroundColor: colors.chip },
  sample: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  manual: { minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  eventRowOn: { borderColor: colors.primary, backgroundColor: colors.liveBg },
});
