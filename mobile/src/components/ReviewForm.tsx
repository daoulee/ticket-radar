import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  DeliveryMethod,
  EventSummary,
  ExtractedField,
  ExtractedFields,
  FieldKey,
  ListingFields,
  OfficialContext,
} from '../contract/types';
import {
  displayValue,
  EXTRACTION_STATUS_TEXT,
  FIELD_LABELS,
  FIELD_ORDER,
  parsePositiveInt,
  showtimeLabel,
} from '../ui/display';
import {
  BOOKING_TYPE_LABELS,
  DELIVERY_LABELS,
  DISCOUNT_LABELS,
  FEE_BASIS_LABELS,
  PRICE_BASIS_LABELS,
} from '../ui/format';
import { colors } from '../ui/theme';
import { Chip, SectionTitle, styles } from './common';
import * as Haptics from 'expo-haptics';
import { BottomSheet, EvidenceChip, Icon, NUMPAD_DONE_ID, NumpadDone } from './ui';

type NumberKey = 'price' | 'quantity';

// AI(또는 시연 데이터) 추출 후보를 보여주고 사용자가 확인·수정하게 한다.
// 여기서는 입력 형식만 검사하고, 가격 비교·규정 판단은 하지 않는다.
// 공통 계약 v0.1.0의 비교 전제 조건 6개(공연 일치·예매 유형·가격 기준·수수료·할인·예매자 본인)는
// 앱이 자동으로 채우지 않는다. 사용자가 직접 고르지 않으면 null(모름)로 보내고 서버가 비교를 보류한다.
export function ReviewForm({
  event,
  context,
  extracted,
  fields,
  manual = false,
  onChange,
}: {
  event: EventSummary;
  context: OfficialContext | null;
  extracted: ExtractedFields;
  fields: ListingFields;
  // 'AI 없이 직접 입력' 경로. 추출을 하지 않았으므로 추출 상태 대신 입력 여부만 표시한다(APP-011 발견 ⓑ).
  manual?: boolean;
  // invalidKeys: 형식이 잘못된 숫자 입력. 비어 있지 않으면 대조 버튼을 막는다.
  onChange: (fields: ListingFields, invalidKeys: FieldKey[]) => void;
}) {
  // 숫자 칸은 입력 중인 글자를 따로 들고 있어야 "230,0" 같은 중간 상태를 지우지 않는다.
  const [drafts, setDrafts] = useState<Record<NumberKey, string>>({
    price: fields.price === null ? '' : String(fields.price),
    quantity: fields.quantity === null ? '' : String(fields.quantity),
  });
  const [invalid, setInvalid] = useState<FieldKey[]>([]);

  function update<K extends FieldKey>(key: K, value: ListingFields[K], nextInvalid = invalid) {
    onChange({ ...fields, [key]: value }, nextInvalid);
  }

  function updateNumber(key: NumberKey, text: string) {
    setDrafts((d) => ({ ...d, [key]: text }));
    const parsed = parsePositiveInt(text);
    const nextInvalid = parsed === 'invalid' ? [...invalid.filter((k) => k !== key), key] : invalid.filter((k) => k !== key);
    setInvalid(nextInvalid);
    update(key, parsed === 'invalid' ? fields[key] : parsed, nextInvalid);
  }

  // 공식 자료의 좌석 등급 + 추출 후보를 선택지로 보여준다(중복 제거).
  const seatOptions = Array.from(
    new Set([...(context?.priceTiers.map((t) => t.seatGrade) ?? []), ...candidatesOf(extracted.seatGrade)]),
  );

  function editor(key: FieldKey) {
    switch (key) {
      case 'showtimeId':
        return (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={event.showtimes.map((s) => ({ value: s.id, label: showtimeLabel(s) }))}
            value={fields.showtimeId}
            onSelect={(v) => update('showtimeId', v)}
          />
        );
      case 'seatGrade':
        return seatOptions.length > 0 ? (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={seatOptions.map((g) => ({ value: g, label: `${g}석` }))}
            value={fields.seatGrade}
            onSelect={(v) => update('seatGrade', v)}
          />
        ) : (
          <TextInput
            accessibilityLabel="좌석 등급 입력"
            style={styles.input}
            value={fields.seatGrade ?? ''}
            placeholder="예: R"
            placeholderTextColor={colors.muted}
            onChangeText={(t) => update('seatGrade', t.trim() === '' ? null : t.trim())}
          />
        );
      case 'price':
      case 'quantity':
        return (
          <View style={{ gap: 6 }}>
            <TextInput
              accessibilityLabel={`${FIELD_LABELS[key]} 입력`}
              style={[styles.input, invalid.includes(key) && { borderColor: colors.errorText }]}
              keyboardType="number-pad"
              inputAccessoryViewID={NUMPAD_DONE_ID}
              value={key === 'price' && /^\d[\d,]*$/.test(drafts.price) ? drafts.price.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') : drafts[key]}
              placeholder={key === 'price' ? '예: 125000 (원)' : '예: 1'}
              placeholderTextColor={colors.muted}
              onChangeText={(t) => updateNumber(key, t)}
            />
            {key === 'price' && candidatesOf(extracted.price).length ? (
              <View style={styles.chipRow}>
                {candidatesOf(extracted.price).map((c) => (
                  <Chip
                    key={c}
                    label={`후보 ${displayValue('price', c, event)} 사용`}
                    selected={fields.price === c}
                    onPress={() => updateNumber('price', String(c))}
                  />
                ))}
              </View>
            ) : null}
            {invalid.includes(key) ? (
              <Text style={styles.fieldError}>1 이상의 숫자만 입력하세요. 모르면 비워 두세요.</Text>
            ) : null}
          </View>
        );
      case 'deliveryMethod':
        return (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={(Object.keys(DELIVERY_LABELS) as DeliveryMethod[]).map((m) => ({ value: m, label: DELIVERY_LABELS[m] }))}
            value={fields.deliveryMethod}
            onSelect={(v) => update('deliveryMethod', v)}
          />
        );
      case 'prepaymentRequested':
        return (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={[
              { value: true, label: '있음' },
              { value: false, label: '없음' },
            ]}
            value={fields.prepaymentRequested}
            onSelect={(v) => update('prepaymentRequested', v)}
          />
        );
      case 'listingEventId':
        // '다른 공연' 값을 앱이 지어내지 않는다. 맞지 않거나 모르면 '모름'으로 두면 서버가 비교를 보류한다.
        return (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={[{ value: event.id, label: '예, 선택한 공연의 판매글' }]}
            value={fields.listingEventId}
            onSelect={(v) => update('listingEventId', v)}
            unknownLabel="아니거나 모름"
          />
        );
      case 'bookingType':
        return <EnumChips fieldLabel={FIELD_LABELS[key]} labels={BOOKING_TYPE_LABELS} value={fields.bookingType} onSelect={(v) => update('bookingType', v)} />;
      case 'priceBasis':
        return <EnumChips fieldLabel={FIELD_LABELS[key]} labels={PRICE_BASIS_LABELS} value={fields.priceBasis} onSelect={(v) => update('priceBasis', v)} />;
      case 'feeBasis':
        return <EnumChips fieldLabel={FIELD_LABELS[key]} labels={FEE_BASIS_LABELS} value={fields.feeBasis} onSelect={(v) => update('feeBasis', v)} />;
      case 'discountStatus':
        return <EnumChips fieldLabel={FIELD_LABELS[key]} labels={DISCOUNT_LABELS} value={fields.discountStatus} onSelect={(v) => update('discountStatus', v)} />;
      case 'buyerIsBooker':
        return (
          <ChipGroup
            fieldLabel={FIELD_LABELS[key]}
            options={[
              { value: true, label: '예' },
              { value: false, label: '아니요' },
            ]}
            value={fields.buyerIsBooker}
            onSelect={(v) => update('buyerIsBooker', v)}
          />
        );
    }
  }

  // 웹 추출값 확인과 같은 행 구성(APP-018): 항목 이름 + 오른쪽 상태 표시 → 입력/선택 칸 → 근거 문구.
  function card(key: FieldKey, index: number) {
    const field = extracted[key] as ExtractedField;
    // 직접 입력에는 추출값이 없으므로 '찾지 못함'·'사용자 수정'·'추출값'을 보이지 않는다.
    const missing = fields[key] === null;
    const needsCheck = manual ? missing : field.status !== 'extracted';
    // AI가 읽은 값을 바꿨으면 '사용자 수정', AI가 못 찾은 빈칸을 채웠으면 '직접 채움'(TODO 이월 APP-017).
    const edited = !manual && field.value !== null && fields[key] !== field.value;
    const filled = !manual && field.value === null && fields[key] !== null;
    const candidates = candidatesOf(field);
    return (
      <View key={key} style={[rowStyle.row, index > 0 && rowStyle.divider]}>
        <View style={rowStyle.head}>
          <Text style={[styles.body, { fontWeight: '700', flexShrink: 1 }]}>{FIELD_LABELS[key]}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {edited ? <StatusPill text="사용자 수정" /> : null}
            {filled ? <StatusPill text="직접 채움" /> : null}
            <StatusPill
              text={manual ? (missing ? '직접 입력 · 미확인' : '직접 입력') : EXTRACTION_STATUS_TEXT[field.status]}
              warn={needsCheck}
            />
          </View>
        </View>
        {editor(key)}
        {!manual && candidates.length ? (
          <Text style={styles.small}>
            후보: {candidates.map((c) => displayValue(key, c as ListingFields[typeof key], event)).join(', ')}
          </Text>
        ) : null}
        {!manual && field.status !== 'unknown' ? (
          <Text style={styles.small}>추출값: {displayValue(key, field.value as ListingFields[typeof key], event)}</Text>
        ) : null}
        {field.evidenceQuote ? <EvidenceChip quote={field.evidenceQuote} prefix="판매글 근거" /> : null}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <NumpadDone />
      <View style={{ gap: 2 }}>
        <SectionTitle>판매글 정보</SectionTitle>
        <Text style={styles.small}>읽은 내용을 확인하고 고쳐 주세요.</Text>
      </View>
      <View style={rowStyle.group}>{LISTING_KEYS.map(card)}</View>
      <View style={{ gap: 2 }}>
        <SectionTitle>가격 비교 조건</SectionTitle>
        <Text style={styles.small}>
          같은 조건인지 확인해야 가격을 비교할 수 있어요. 자동으로 채우지 않으며, 확인하지 않은 항목이 있으면 가격 비교를 보류해요.
        </Text>
      </View>
      <View style={rowStyle.group}>{CONDITION_KEYS.map(card)}</View>
    </View>
  );
}

const rowStyle = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: { gap: 8, paddingVertical: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});

// 웹과 같은 순서: 판매글 정보(앞 6개) → 가격 비교 조건(뒤 6개, 공통 계약 필드 순서).
const LISTING_KEYS = FIELD_ORDER.slice(0, 6);
const CONDITION_KEYS = FIELD_ORDER.slice(6);

type Candidates<F> = F extends { candidates: infer C } ? C : never;

function candidatesOf<F extends ExtractedField>(field: F): Candidates<F> | [] {
  return (field.status === 'ambiguous' ? field.candidates : []) as Candidates<F> | [];
}

function EnumChips<T extends string>({
  fieldLabel,
  labels,
  value,
  onSelect,
}: {
  fieldLabel: string;
  labels: Record<T, string>;
  value: T | null;
  onSelect: (value: T | null) => void;
}) {
  return (
    <ChipGroup
      fieldLabel={fieldLabel}
      options={(Object.keys(labels) as T[]).map((v) => ({ value: v, label: labels[v] }))}
      value={value}
      onSelect={onSelect}
    />
  );
}

function StatusPill({ text, warn }: { text: string; warn?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        backgroundColor: warn ? colors.checkBg : colors.okBg,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: warn ? colors.checkText : colors.okText }}>{text}</Text>
    </View>
  );
}

// 웹 선택 칸(select)과 같은 모양: 현재 값 + ▾. 누르면 아래 시트에서 고른다('모름'은 미확인 = null).
function ChipGroup<T extends string | boolean>({
  fieldLabel,
  options,
  value,
  onSelect,
  unknownLabel = '모름',
}: {
  fieldLabel: string;
  options: { value: T; label: string }[];
  value: T | null;
  onSelect: (value: T | null) => void;
  unknownLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? unknownLabel;
  const all: { value: T | null; label: string }[] = [...options, { value: null, label: unknownLabel }];
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${fieldLabel} 선택, 현재 ${current}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [selectStyle.field, pressed && { backgroundColor: colors.chipSelected }]}
      >
        <Text style={[styles.body, value === null && { color: colors.muted }]}>{current}</Text>
        <Icon name="chevronDown" size={16} color={colors.muted} />
      </Pressable>
      <BottomSheet visible={open} title={fieldLabel} onClose={() => setOpen(false)}>
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {all.map((o) => {
            const selected = value === o.value;
            return (
              <Pressable
                key={String(o.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onSelect(o.value);
                  setOpen(false);
                }}
                style={[selectStyle.option, selected && selectStyle.optionOn]}
              >
                <Text style={[styles.body, selected && { color: colors.primary, fontWeight: '700' }]}>{o.label}</Text>
                {selected ? <Icon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

const selectStyle = StyleSheet.create({
  field: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.chip,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  option: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.liveBg },
});
