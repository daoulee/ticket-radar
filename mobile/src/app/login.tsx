import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { toApiError } from '../api/client';
import { BrandMark } from '../brand/BrandMark';
import { useMarket } from '../market/MarketContext';
import { CTA, Tabs, t, TScreen, tt } from '../ui/toss';
import { isValidNewPassword, PASSWORD_RULE_MESSAGE } from '../../../shared/password-policy';

// 로그인·가입(즐겨찾기·알림·거래를 계정에 저장, 사용자 결정 2026-11-03). 비밀번호는 서버가 해시로만 저장한다.
export default function LoginScreen() {
  const { api, signIn } = useMarket();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailCheck, setEmailCheck] = useState<{ value: string; available: boolean } | null>(null);
  const [nameCheck, setNameCheck] = useState<{ value: string; available: boolean } | null>(null);
  function updateEmail(value: string) {
    setEmail(value); setEmailCheck(null); setSentEmail(''); setVerificationCode('');
  }
  function chooseDomain(domain: string) {
    const local = email.trim().split('@')[0];
    setDomainsOpen(false);
    if (!local) { setError('이메일 아이디를 먼저 입력해 주세요.'); return; }
    updateEmail(`${local}@${domain}`);
    setError(null);
  }
  async function submit() {
    if (mode === 'signup' && !email.trim()) { setError('이메일을 입력해 주세요.'); return; }
    if (mode === 'signup' && api.mode === 'live' && sentEmail !== email.trim()) { setError('이메일 인증번호를 먼저 요청해 주세요.'); return; }
    if (mode === 'signup' && api.mode === 'live' && !/^\d{6}$/.test(verificationCode)) { setError('인증번호 6자리를 입력해 주세요.'); return; }
    if (name.trim().length < 2) { setError(mode === 'signup' ? '닉네임을 2자 이상 입력해 주세요.' : '아이디 또는 이메일을 입력해 주세요.'); return; }
    if (mode === 'signup' && !isValidNewPassword(password)) { setError(PASSWORD_RULE_MESSAGE); return; }
    if (mode === 'login' && !password) { setError('비밀번호를 입력해 주세요.'); return; }
    if (mode === 'signup' && (!emailCheck || emailCheck.value !== email.trim() || !emailCheck.available)) { setError('이메일 중복 확인을 완료해 주세요.'); return; }
    if (mode === 'signup' && (!nameCheck || nameCheck.value !== name.trim() || !nameCheck.available)) { setError('닉네임 중복 확인을 완료해 주세요.'); return; }
    if (mode === 'signup' && emailCheck?.value === email.trim() && !emailCheck.available) { setError('이미 사용 중인 이메일이에요.'); return; }
    if (mode === 'signup' && nameCheck?.value === name.trim() && !nameCheck.available) { setError('이미 쓰는 닉네임이에요.'); return; }
    setBusy(true);
    setError(null);
    try {
      const s = mode === 'login' ? await api.login(name, password) : await api.signup(name, password, email.trim(), api.mode === 'live' ? verificationCode : undefined);
      signIn(s, mode === 'login');
      if (router.canGoBack()) router.back();
      else router.replace('/');
      if (mode === 'signup') Alert.alert('가입을 환영합니다!', '티켓레이더에서 좋아하는 공연을 찾아보세요.');
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  }
  async function sendCode() {
    setBusy(true);
    setError(null);
    try { await api.sendVerification(email.trim()); setSentEmail(email.trim()); setVerificationCode(''); }
    catch (e) { setSentEmail(''); setError(toApiError(e).message); }
    finally { setBusy(false); }
  }
  async function check(kind: 'email' | 'name') {
    const value = (kind === 'email' ? email : name).trim();
    setBusy(true); setError(null);
    try {
      const result = await api.checkAvailability(kind, value);
      (kind === 'email' ? setEmailCheck : setNameCheck)({ value, available: result.available });
    } catch (e) { setError(toApiError(e).message); }
    finally { setBusy(false); }
  }
  return (
    <TScreen top={<View accessible accessibilityLabel="티켓레이더" style={{ paddingTop: insets.top + 40, paddingBottom: 20, alignItems: 'center' }}><BrandMark width={100} /></View>} footer={<>{error ? <Text accessibilityLiveRegion="polite" style={[tt.body, { color: t.red }]}>{error}</Text> : null}<CTA label={mode === 'login' ? '로그인' : '가입하고 시작하기'} busy={busy} onPress={submit} /></>}>
      <Animated.View key={`heading-${mode}`} entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} style={{ paddingHorizontal: 24, paddingTop: 12, gap: 6 }}>
        <Text accessibilityRole="header" style={tt.hero}>{mode === 'login' ? '오늘은 어떤 공연을\n보실 건가요?' : '즐겨찾기와 거래를\n계정에 남겨 둘게요'}</Text>
        {api.mode === 'demo' ? <Text style={tt.desc}>시연 모드 계정은 앱을 끄면 사라져요</Text> : null}
      </Animated.View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 24 }}>
        <Tabs items={[{ key: 'login', label: '로그인' }, { key: 'signup', label: '가입' }]} value={mode} onChange={(m) => { setMode(m); setError(null); }} />
        <Animated.View key={`fields-${mode}`} entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} layout={LinearTransition.duration(220).reduceMotion(ReduceMotion.System)} style={{ gap: 24 }}>
        {mode === 'signup' ? <Animated.View layout={LinearTransition.duration(220).reduceMotion(ReduceMotion.System)} style={{ gap: 12 }}>
          <Field label="이메일" value={email} onChange={updateEmail} placeholder="이메일 주소 또는 아이디" contentType="emailAddress" right={<Pressable accessibilityRole="button" accessibilityLabel="이메일 도메인 선택" accessibilityState={{ expanded: domainsOpen, disabled: busy }} disabled={busy} onPress={() => { Keyboard.dismiss(); setDomainsOpen((open) => !open); }} style={{ minHeight: 48, paddingLeft: 10, justifyContent: 'center' }}>
            <Text style={{ color: t.primary, fontSize: 13, fontWeight: '600' }}>@ 선택 {domainsOpen ? '▴' : '▾'}</Text>
          </Pressable>} />
          {domainsOpen ? <Animated.View entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)} accessibilityLabel="이메일 도메인 목록" style={{ backgroundColor: t.g1, borderRadius: 12, paddingHorizontal: 14 }}>
            {['gmail.com', 'naver.com', 'daum.net', 'kakao.com'].map((domain) => <Pressable key={domain} accessibilityRole="button" accessibilityLabel={domain} disabled={busy} onPress={() => chooseDomain(domain)} style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Text style={[tt.body, { color: t.ink }]}>{domain}</Text></Pressable>)}
            <Pressable accessibilityRole="button" accessibilityLabel="직접 입력" disabled={busy} onPress={() => setDomainsOpen(false)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={[tt.body, { color: t.g7 }]}>직접 입력</Text></Pressable>
          </Animated.View> : null}
          {emailCheck?.value === email.trim() ? <AvailabilityStatus available={emailCheck.available} text={emailCheck.available ? '사용할 수 있는 이메일이에요.' : '이미 사용 중인 이메일이에요.'} /> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <ActionButton label="이메일 중복 확인" disabled={busy || !email.trim()} onPress={() => void check('email')} />
            {api.mode === 'live' ? <ActionButton label={sentEmail ? '인증번호 다시 받기' : '인증번호 받기'} primary disabled={busy || !email.trim()} onPress={sendCode} /> : null}
          </View>
          {api.mode === 'live' && sentEmail ? <Field label="인증번호" value={verificationCode} onChange={(value) => setVerificationCode(value.replace(/\s/g, ''))} placeholder="6자리 숫자" contentType="oneTimeCode" /> : null}
        </Animated.View> : null}
        <Animated.View layout={LinearTransition.duration(220).reduceMotion(ReduceMotion.System)} style={{ gap: 12 }}>
          <Field label={mode === 'login' ? '아이디 또는 이메일' : '닉네임'} value={name} onChange={(value) => { setName(value); setNameCheck(null); }} placeholder={mode === 'login' ? '아이디 또는 이메일 입력' : '2~20자'} contentType="username" />
          {mode === 'signup' && nameCheck?.value === name.trim() ? <AvailabilityStatus available={nameCheck.available} text={nameCheck.available ? '사용할 수 있는 닉네임이에요.' : '이미 쓰는 닉네임이에요.'} /> : null}
          {mode === 'signup' ? <View style={{ alignItems: 'flex-start' }}><ActionButton label="닉네임 중복 확인" disabled={busy || !name.trim()} onPress={() => void check('name')} /></View> : null}
        </Animated.View>
        <Field label="비밀번호" value={password} onChange={setPassword} placeholder={mode === 'signup' ? '영문 대·소문자, 특수문자 포함 8자 이상' : '비밀번호 입력'} secure contentType="password" />
        </Animated.View>
      </View>
    </TScreen>
  );
}

function ActionButton({ label, disabled, onPress, primary = false }: { label: string; disabled: boolean; onPress: () => void; primary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 48, justifyContent: 'center', alignItems: 'center', opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>
    <View style={{ minHeight: 34, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 8, borderWidth: 1, borderColor: primary ? t.primary : t.g2, backgroundColor: primary ? t.primary : t.white }}>
      <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '600', color: primary ? t.white : t.g7 }}>{label}</Text>
    </View>
  </Pressable>;
}

function AvailabilityStatus({ available, text }: { available: boolean; text: string }) {
  return <Animated.View entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)} accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
    <Text accessible={false} style={{ color: available ? t.ok : t.red, fontSize: 15, fontWeight: '700' }}>{available ? '✓' : '!'}</Text>
    <Text style={{ color: available ? t.ok : t.red, fontSize: 14, lineHeight: 20, fontWeight: '600', flexShrink: 1 }}>{text}</Text>
  </Animated.View>;
}

function Field({ label, value, onChange, placeholder, secure, contentType, right }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; secure?: boolean; contentType?: 'username' | 'password' | 'newPassword' | 'emailAddress' | 'oneTimeCode'; right?: ReactNode }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: focus ? t.primary : t.g5 }}>{label}</Text>
      <View style={right ? { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: focus ? t.primary : t.g2 } : undefined}>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.g4}
        secureTextEntry={secure}
        // iOS 암호 자동완성·저장 제안이 올바른 칸에 붙도록 종류를 알린다(로컬 서명 빌드부터 실제로 뜸).
        textContentType={contentType}
        keyboardType={contentType === 'emailAddress' ? 'email-address' : contentType === 'oneTimeCode' ? 'number-pad' : 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ fontSize: 22, fontWeight: '600', color: t.ink, paddingVertical: 8, ...(right ? { flex: 1, minWidth: 0 } : { borderBottomWidth: 2, borderBottomColor: focus ? t.primary : t.g2 }) }}
      />
      {right}
      </View>
    </View>
  );
}
