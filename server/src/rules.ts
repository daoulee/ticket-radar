import type { ExtractedFields, Finding, ListingFields, PriceComparison } from '../../shared/index.ts';
import type { CatalogEntry } from './catalog.ts';

function matchingPriceTier(entry: CatalogEntry, fields: ListingFields) {
  const matches = entry.context.priceTiers.filter(t => t.seatGrade === fields.seatGrade && (t.showtimeId === null || t.showtimeId === fields.showtimeId));
  return matches.length === 1 ? matches[0] : null;
}

export function comparePrice(entry: CatalogEntry, fields: ListingFields | null): PriceComparison {
  const hold = (reason: string): PriceComparison => ({ held: true, reason });
  if (!fields) return hold('추출 후보를 확인·수정한 뒤 대조를 요청하세요.');
  if (fields.listingEventId !== entry.event.id) return hold('판매글의 공연 일치 여부를 확인하세요.');
  if (!entry.event.showtimes.some(s => s.id === fields.showtimeId)) return hold('회차가 없거나 선택한 공연의 회차와 일치하지 않습니다.');
  if (fields.price === null || fields.quantity === null) return hold('판매 단가와 수량을 확인하세요.');
  if (fields.priceBasis !== 'per_ticket') return hold('1매 가격이 확인되지 않았습니다. 묶음 총액은 비교하지 않습니다.');
  if (fields.feeBasis !== 'ticket_only' || fields.discountStatus !== 'standard') return hold('수수료·할인 조건이 불명확하거나 공지 기본가와 다릅니다. 티켓 기본가 조건을 확인하세요.');
  const tier = matchingPriceTier(entry, fields);
  if (!tier) return hold('해당 회차·좌석 등급의 기준가격을 하나로 확인할 수 없습니다.');
  return { held: false, seatGrade: tier.seatGrade, showtimeId: fields.showtimeId!, facePrice: tier.facePrice,
    listingPrice: fields.price, diff: fields.price - tier.facePrice,
    ratePercent: Math.round((fields.price / tier.facePrice - 1) * 10000) / 100,
    sourceUrl: tier.sourceUrl, verifiedAt: tier.verifiedAt };
}

export function createFindings(entry: CatalogEntry, fields: ListingFields | null, extracted: ExtractedFields, text: string, price: PriceComparison): Finding[] {
  const tier = !price.held && fields ? matchingPriceTier(entry, fields) : null;
  if (!price.held && (!tier || !fields || fields.showtimeId !== price.showtimeId ||
      tier.seatGrade !== price.seatGrade || tier.facePrice !== price.facePrice ||
      tier.sourceUrl !== price.sourceUrl || tier.verifiedAt !== price.verifiedAt)) {
    throw new Error('Price comparison and official evidence no longer refer to the same tier');
  }
  const findings: Finding[] = [{
    id: 'price', type: 'price', status: price.held ? 'comparison_held' : 'matched',
    title: price.held ? '가격 비교 보류' : '같은 조건의 티켓 기본가 비교',
    listingQuote: extracted.price.evidenceQuote ?? text,
    officialExcerpt: price.held ? null : tier!.sourceText,
    sourceUrl: price.held ? null : tier!.sourceUrl, checkedAt: price.held ? null : tier!.verifiedAt,
    reason: price.held ? price.reason : '사용자 확인값으로 공지 기본가와 비교했습니다. 원문 인용과 수정값은 다를 수 있으며 차액만으로 위법·진위를 판단하지 않습니다.',
  }];
  // No policy claims before confirmation, and no fanclub policy applied to general booking.
  if (!fields) return findings;
  if (fields.listingEventId !== entry.event.id || !entry.event.showtimes.some(s => s.id === fields.showtimeId)) {
    findings.push({ id: 'scope-event', type: 'policy', status: 'unverifiable', title: '규정 적용 보류', listingQuote: text,
      officialExcerpt: null, sourceUrl: null, checkedAt: null, reason: '공연·회차가 확인되지 않아 이 공연의 규정을 적용하지 않았습니다.' });
    return findings;
  }
  for (const policy of entry.context.policies) {
    if (policy.scope !== 'all' && fields.bookingType === null) {
      findings.push({ id: policy.id, type: 'policy', status: 'needs_check', title: '예매 유형 확인 필요', listingQuote: text,
        officialExcerpt: policy.excerpt, sourceUrl: policy.sourceUrl, checkedAt: policy.verifiedAt,
        reason: '팬클럽 선예매 여부가 확인되지 않았습니다. 선예매 규정을 일반예매에 적용하지 않고 확인을 요청합니다.' });
      continue;
    }
    if (policy.scope !== 'all' && fields.bookingType !== policy.scope) continue;
    const conflict = policy.type === 'identity_check' && fields.buyerIsBooker === false;
    findings.push({ id: policy.id, type: 'policy', status: conflict ? 'conflict' : 'needs_check',
      title: conflict ? '선예매 관람자 조건 확인 필요' : '해당 예매 유형의 본인 확인 조건',
      listingQuote: extracted.buyerIsBooker.evidenceQuote ?? text,
      officialExcerpt: policy.excerpt, sourceUrl: policy.sourceUrl, checkedAt: policy.verifiedAt,
      reason: conflict ? '사용자가 확인한 선예매·관람자 정보가 해당 공지 조건과 충돌합니다. 원문과 수정값을 구분하고 예매처에 예외 적용 여부를 확인하세요.' : '확인한 예매 유형에 적용되는 공식 조건입니다. 예외와 현장 요구 자료를 예매처에 재확인하세요.' });
  }
  if (fields.prepaymentRequested === true) findings.push({ id: 'prepayment', type: 'prepayment', status: 'needs_check',
    title: '입금·전달 조건 확인', listingQuote: extracted.prepaymentRequested.evidenceQuote ?? text,
    officialExcerpt: null, sourceUrl: null, checkedAt: null,
    reason: '사용자 확인값에 선입금 요구가 있습니다. 전달·환불 조건을 확인하세요. 사기 여부를 확정하지 않습니다.' });
  return findings;
}
