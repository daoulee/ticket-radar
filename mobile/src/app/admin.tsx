import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { toApiError } from '../api/client';
import { DEMO_ORGANIZER_HINT } from '../api/demoReports';
import { Button, DemoBadge, Screen } from '../components/common';
import { FooterNote, Frost, Icon, InlineError, Pill, Skeleton } from '../components/ui';
import {
  REPORT_STATUS_TEXT,
  REPORT_STATUSES,
  type OrganizerSession,
  type ReportDetail,
  type ReportStatus,
  type ReportSummary,
} from '../contract/reports';
import { useFlow } from '../state/FlowContext';
import { formatKst, formatWon } from '../ui/format';
import { colors, MIN_TOUCH, radius, space, type } from '../ui/theme';

// ⑤ 주최 측 제보함(기획 명세 P0, APP-021). 시연용 담당 계정으로 로그인하면 배정된 공연의 제보만 본다.
// 처리 상태·메모 변경은 서버 감사 기록(history)에 남는다. 로그인 토큰은 화면 메모리에만 두고 저장하지 않는다.
// 실제 주최 측 인증이 아니라 '시연 계정'임을 항상 표시한다.
type Load<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T };

export default function OrganizerScreen() {
  const { api, events } = useFlow();
  const [session, setSession] = useState<OrganizerSession | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const titleOf = (id: string) => (events.status === 'success' ? events.data.find((e) => e.id === id)?.title : undefined) ?? id;

  async function logout() {
    if (session) await api.organizer.logout(session.token).catch(() => undefined);
    setSession(null);
    setEventId(null);
    setOpenId(null);
  }

  if (!session)
    return (
      <Login
        demo={api.mode === 'demo'}
        onLogin={async (id, code) => {
          const s = await api.organizer.login(id, code);
          setSession(s);
          setEventId(s.eventIds[0] ?? null);
        }}
      />
    );
  if (openId)
    return <Detail token={session.token} id={openId} title={titleOf} onBack={() => setOpenId(null)} onExpired={logout} />;
  return (
    <Inbox
      session={session}
      eventId={eventId}
      setEventId={setEventId}
      title={titleOf}
      onOpen={setOpenId}
      onLogout={logout}
    />
  );
}

function Login({ demo, onLogin }: { demo: boolean; onLogin: (id: string, code: string) => Promise<void> }) {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState<{ status: 'idle' | 'busy' } | { status: 'error'; message: string }>({ status: 'idle' });
  async function submit() {
    setState({ status: 'busy' });
    try {
      await onLogin(id.trim(), code);
    } catch (e) {
      setState({ status: 'error', message: toApiError(e).message });
      setCode('');
    }
  }
  return (
    <Screen
      footer={
        <Button
          label={state.status === 'busy' ? '확인하는 중…' : '주최 측 로그인'}
          icon="lock"
          onPress={submit}
          disabled={!id.trim() || !code || state.status === 'busy'}
        />
      }
    >
      <Stack.Screen options={{ title: '주최 측 제보함' }} />
      <View style={{ alignItems: 'center', gap: space.sm, paddingTop: space.lg }}>
        <Icon name="lock" size={22} color={colors.muted} />
        <Text accessibilityRole="header" style={[type.h2, { textAlign: 'center' }]}>
          담당 공연의 제보만 볼 수 있어요
        </Text>
        <Text style={[type.sub, { textAlign: 'center' }]}>팬이 확인해 보낸 제보를 검토하고 처리 상태를 남기는 화면이에요.</Text>
      </View>
      <TextInput
        accessibilityLabel="담당자 계정"
        value={id}
        onChangeText={setId}
        placeholder="담당자 계정"
        placeholderTextColor={colors.faint}
        autoCapitalize="none"
        autoCorrect={false}
        style={a.input}
      />
      <TextInput
        accessibilityLabel="접속 코드"
        secureTextEntry
        value={code}
        onChangeText={setCode}
        placeholder="접속 코드"
        placeholderTextColor={colors.faint}
        style={a.input}
      />
      {state.status === 'error' ? <InlineError text={state.message} /> : null}
      <Frost>
        <Text style={[type.caption, { fontWeight: '700' }]}>시연 계정 안내</Text>
        {demo ? (
          <Text style={type.sub}>
            시연 모드예요. 계정 {DEMO_ORGANIZER_HINT.accountId} · 코드 {DEMO_ORGANIZER_HINT.code} 로 들어갈 수 있어요(가상 계정).
          </Text>
        ) : (
          <Text style={type.sub}>
            서버에 설정된 시연용 담당 계정으로 들어가요. 실제 주최 측 인증이 아니에요. 코드는 앱에 저장하지 않아요.
          </Text>
        )}
      </Frost>
      <FooterNote />
    </Screen>
  );
}

function Inbox({
  session,
  eventId,
  setEventId,
  title,
  onOpen,
  onLogout,
}: {
  session: OrganizerSession;
  eventId: string | null;
  setEventId: (id: string) => void;
  title: (id: string) => string;
  onOpen: (id: string) => void;
  onLogout: () => void;
}) {
  const { api } = useFlow();
  const [list, setList] = useState<Load<ReportSummary[]>>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  // 부모가 다시 그려져도 목록을 다시 부르지 않도록 콜백은 ref 로 둔다.
  const logoutRef = useRef(onLogout);
  useEffect(() => {
    logoutRef.current = onLogout;
  });
  // 효과 안에서는 응답이 온 뒤에만 상태를 바꾼다. '불러오는 중' 표시는 누른 쪽(load)에서 먼저 바꾼다.
  useEffect(() => {
    if (!eventId) return;
    let alive = true;
    api.organizer.list(session.token, eventId).then(
      (data) => alive && setList({ status: 'success', data }),
      (e) => {
        if (!alive) return;
        const err = toApiError(e);
        if (err.code === 'UNAUTHORIZED') logoutRef.current();
        else setList({ status: 'error', message: err.message });
      },
    );
    return () => {
      alive = false;
    };
  }, [api, eventId, session.token, reload]);
  const load = () => {
    setList({ status: 'loading' });
    setReload((n) => n + 1);
  };

  return (
    <Screen footer={<Pill label="로그아웃" icon="arrowLeft" onPress={onLogout} />}>
      <Stack.Screen options={{ title: '주최 측 제보함' }} />
      <View style={{ gap: 4 }}>
        <Text style={type.caption}>
          {session.accountId} · 시연 계정 · {formatKst(session.expiresAt)}까지
        </Text>
        <Text accessibilityRole="header" style={type.h2}>
          {eventId ? title(eventId) : '배정된 공연이 없어요'}
        </Text>
      </View>
      {session.eventIds.length > 1 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {session.eventIds.map((id) => (
            <Pill key={id} label={title(id)} tone={id === eventId ? 'link' : 'grey'} onPress={() => setEventId(id)} />
          ))}
        </View>
      ) : null}
      {!eventId ? null : list.status === 'loading' ? (
        <Skeleton lines={3} />
      ) : list.status === 'error' ? (
        <View style={{ gap: space.sm }}>
          <InlineError text={list.message} />
          <Pill label="다시 시도" icon="refresh" onPress={load} />
        </View>
      ) : list.data.length === 0 ? (
        <Frost>
          <Text style={type.sub}>아직 들어온 제보가 없어요.</Text>
        </Frost>
      ) : (
        <View style={{ gap: space.sm }}>
          <Text style={type.caption}>제보 {list.data.length}건 · 최신순</Text>
          {list.data.map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityLabel={`제보 ${r.id.slice(0, 8)}, ${REPORT_STATUS_TEXT[r.status]}, 열기`}
              onPress={() => onOpen(r.id)}
              style={a.row}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <StatusChip status={r.status} />
                <Text style={type.caption}>
                  {formatKst(r.createdAt)} · 확인 {r.findingCount}건{r.listingPrice ? ` · ${formatWon(r.listingPrice)}` : ''}
                </Text>
                {r.isDemo ? <DemoBadge isDemo /> : null}
              </View>
              <Text numberOfLines={2} style={[type.sub, { color: colors.text }]}>
                {r.preview}
              </Text>
            </Pressable>
          ))}
          <Pill label="새로고침" icon="refresh" onPress={load} />
        </View>
      )}
      <FooterNote />
    </Screen>
  );
}

function Detail({
  token,
  id,
  title,
  onBack,
  onExpired,
}: {
  token: string;
  id: string;
  title: (id: string) => string;
  onBack: () => void;
  onExpired: () => void;
}) {
  const { api } = useFlow();
  const [r, setR] = useState<Load<ReportDetail>>({ status: 'loading' });
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const expiredRef = useRef(onExpired);
  useEffect(() => {
    expiredRef.current = onExpired;
  });
  useEffect(() => {
    let alive = true;
    api.organizer.get(token, id).then(
      (d) => {
        if (!alive) return;
        setR({ status: 'success', data: d });
        setMemo(d.memo);
      },
      (e) => {
        if (!alive) return;
        const err = toApiError(e);
        if (err.code === 'UNAUTHORIZED') expiredRef.current();
        else setR({ status: 'error', message: err.message });
      },
    );
    return () => {
      alive = false;
    };
  }, [api, id, token, reload]);
  const load = () => {
    setR({ status: 'loading' });
    setReload((n) => n + 1);
  };

  async function update(patch: { status?: ReportStatus; memo?: string }, what: string) {
    setSaving(what);
    setSaveError(null);
    try {
      const d = await api.organizer.update(token, id, patch);
      setR({ status: 'success', data: d });
      setMemo(d.memo);
    } catch (e) {
      setSaveError(toApiError(e).message);
    } finally {
      setSaving(null);
    }
  }
  async function exportIt() {
    try {
      await Share.share({ message: await api.organizer.exportText(token, id) });
    } catch (e) {
      setSaveError(toApiError(e).message);
    }
  }

  return (
    <Screen footer={<Pill label="목록으로" icon="arrowLeft" onPress={onBack} />}>
      <Stack.Screen options={{ title: '제보 상세' }} />
      {r.status === 'loading' ? (
        <Skeleton lines={4} />
      ) : r.status === 'error' ? (
        <View style={{ gap: space.sm }}>
          <InlineError text={r.message} />
          <Pill label="다시 시도" icon="refresh" onPress={load} />
        </View>
      ) : (
        <>
          <View style={{ gap: 4 }}>
            <Text style={type.caption}>
              {title(r.data.eventId)} · 접수 {formatKst(r.data.createdAt)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text accessibilityRole="header" style={type.h2}>
                제보 {r.data.id.slice(0, 8)}
              </Text>
              <StatusChip status={r.data.status} />
              {r.data.isDemo ? <DemoBadge isDemo /> : null}
            </View>
          </View>
          <View style={a.card}>
            <Text style={[type.caption, { fontWeight: '700' }]}>판매글 (연락처 가림)</Text>
            <Text style={type.body}>{r.data.listingExcerpt}</Text>
            {r.data.listingUrl ? <Text style={type.caption}>판매글 주소(열어 보지 않음): {r.data.listingUrl}</Text> : null}
            {r.data.listingPrice ? <Text style={type.caption}>판매가(제보자 확인): {formatWon(r.data.listingPrice)}</Text> : null}
            {r.data.description ? <Text style={type.sub}>제보자 설명: {r.data.description}</Text> : null}
          </View>
          {r.data.findings.map((f, i) => (
            <View key={i} style={a.card}>
              <Text style={[type.sub, { fontWeight: '700', color: colors.text }]}>{f.title}</Text>
              <Text style={type.sub}>판매글 “{f.listingQuote ?? '해당 문구 없음'}”</Text>
              <Text style={type.sub}>공식 {f.officialExcerpt ?? '공식 자료 없음'}</Text>
            </View>
          ))}
          <View style={a.card}>
            <Text style={[type.caption, { fontWeight: '700' }]}>처리 상태</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {REPORT_STATUSES.map((s) => (
                <Pressable
                  key={s}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: r.data.status === s, disabled: saving !== null }}
                  accessibilityLabel={`처리 상태 ${REPORT_STATUS_TEXT[s]}`}
                  disabled={saving !== null}
                  onPress={() => void update({ status: s }, 'status')}
                  style={[a.statusBtn, r.data.status === s && a.statusOn]}
                >
                  <Text style={[type.sub, { fontWeight: '700', color: r.data.status === s ? '#fff' : colors.text }]}>
                    {REPORT_STATUS_TEXT[s]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              accessibilityLabel="담당자 메모"
              value={memo}
              onChangeText={setMemo}
              placeholder="담당자 메모 (내보내기에는 포함되지 않아요)"
              placeholderTextColor={colors.faint}
              multiline
              maxLength={1000}
              style={[a.input, { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' }]}
            />
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}>
                <Pill
                  label={saving === 'memo' ? '저장하는 중…' : '메모 저장'}
                  icon="pencil"
                  onPress={() => void update({ memo }, 'memo')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Pill label="요약 내보내기" icon="external" onPress={() => void exportIt()} />
              </View>
            </View>
            {saveError ? <InlineError text={saveError} /> : null}
          </View>
          <View style={a.card}>
            <Text style={[type.caption, { fontWeight: '700' }]}>처리 기록</Text>
            {r.data.history.map((h, i) => (
              <Text key={i} style={type.caption}>
                {formatKst(h.at)} · {h.actor === 'reporter' ? '제보자' : h.actor} ·{' '}
                {h.action === 'created'
                  ? '접수'
                  : h.action === 'memo'
                    ? '메모 수정'
                    : `상태 ${REPORT_STATUS_TEXT[h.from as ReportStatus] ?? h.from} → ${REPORT_STATUS_TEXT[h.to as ReportStatus] ?? h.to}`}
              </Text>
            ))}
          </View>
          <Text style={type.caption}>티켓 진위·사기·불법 여부는 확정하지 않아요. 정부 신고센터나 플랫폼에 자동으로 보내지 않아요.</Text>
        </>
      )}
    </Screen>
  );
}

function StatusChip({ status }: { status: ReportStatus }) {
  const strong = status === 'received';
  return (
    <View style={[a.chip, strong && { backgroundColor: colors.peachBg }]}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: strong ? colors.checkText : colors.demoText }}>{REPORT_STATUS_TEXT[status]}</Text>
    </View>
  );
}

const a = StyleSheet.create({
  input: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: MIN_TOUCH,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.home,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chip: { backgroundColor: colors.chip, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statusBtn: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
    justifyContent: 'center',
  },
  statusOn: { backgroundColor: colors.primary },
});
