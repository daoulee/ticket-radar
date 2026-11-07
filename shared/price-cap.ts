export interface PriceCapEvidence {
  eventId: string;
  sessionId: string;
  seatGrade: string;
  pricePerTicket: number;
  priceBasis: 'ticket_only';
  sourceUrl: string;
  verifiedAt: string;
  isDemo: boolean;
}

export interface PriceCapInput {
  eventId: string;
  sessionId: string;
  seatGrade: string;
  pricePerTicket: number;
  priceBasis: 'ticket_only' | 'unknown';
  isDemo: boolean;
}

export type PriceCapResult =
  | { allowed: true; limit: number }
  | { allowed: false; reason: 'INVALID_PRICE' | 'PRICE_UNVERIFIED' | 'PRICE_ABOVE_CAP'; limit: number | null };

export function checkPriceCap(input: PriceCapInput, evidence: PriceCapEvidence | null): PriceCapResult {
  if (!Number.isSafeInteger(input.pricePerTicket) || input.pricePerTicket <= 0) {
    return { allowed: false, reason: 'INVALID_PRICE', limit: null };
  }
  if (!evidence || !input.eventId.trim() || !input.sessionId.trim() || !input.seatGrade.trim()
    || evidence.eventId !== input.eventId || evidence.sessionId !== input.sessionId
    || evidence.seatGrade !== input.seatGrade || evidence.isDemo !== input.isDemo
    || input.priceBasis !== 'ticket_only' || evidence.priceBasis !== 'ticket_only'
    || !Number.isSafeInteger(evidence.pricePerTicket) || evidence.pricePerTicket <= 0
    || !evidence.sourceUrl.trim() || !evidence.verifiedAt.trim() || Number.isNaN(Date.parse(evidence.verifiedAt))) {
    return { allowed: false, reason: 'PRICE_UNVERIFIED', limit: null };
  }
  if (input.pricePerTicket > evidence.pricePerTicket) {
    return { allowed: false, reason: 'PRICE_ABOVE_CAP', limit: evidence.pricePerTicket };
  }
  return { allowed: true, limit: evidence.pricePerTicket };
}
