import { useCountUp } from '../ui/useCountUp'

// 예시 가격: 대림대학교 설립일 1977. 6. 24. 에서 딴 임의 가격(사용자 결정, WEB-011). 실제 판매·공식 가격 아님.
export const EXAMPLE_TICKET_PRICE = 19770

// 히어로 장식용 티켓 일러스트(투명 배경, 직접 그린 SVG). 가상 티켓임을 표시한다.
// 장식이므로 스크린리더에서는 숨긴다. 가격은 장식용 예시 숫자라 카운트업을 쓴다(결과 금액에는 쓰지 않음).
export function TicketArt({ className }: { className?: string }) {
  const price = useCountUp(EXAMPLE_TICKET_PRICE, { delayMs: 900, durationMs: 1400 })
  return (
    <svg className={className} viewBox="0 0 360 180" width="360" height="180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ta-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#30386F" />
          <stop offset="0.55" stopColor="#404890" />
          <stop offset="1" stopColor="#555CA0" />
        </linearGradient>
        <linearGradient id="ta-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* 양옆 반원 홈과 모서리를 뚫는 마스크 → 배경이 그대로 비친다 */}
        <mask id="ta-cut">
          <rect width="360" height="180" rx="22" fill="#fff" />
          <circle cx="252" cy="0" r="14" fill="#000" />
          <circle cx="252" cy="180" r="14" fill="#000" />
        </mask>
        <clipPath id="ta-clip">
          <rect width="360" height="180" rx="22" />
        </clipPath>
      </defs>
      <g mask="url(#ta-cut)">
        <rect width="360" height="180" rx="22" fill="url(#ta-fill)" />
        <rect x="7" y="7" width="346" height="166" rx="16" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1" />
        <rect className="ta-shine" x="-120" y="0" width="120" height="180" fill="url(#ta-shine)" clipPath="url(#ta-clip)" />
      </g>
      {/* 절취선 */}
      <line x1="252" y1="22" x2="252" y2="158" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" />
      {/* 본권 */}
      <g fill="#fff">
        <text x="26" y="42" fontSize="16" fontWeight="700" letterSpacing="0.5" opacity="0.85">TICKET RADAR</text>
        {/* 가상 표시는 카드에 가려지지 않는 위쪽에 둔다 */}
        <rect x="160" y="22" width="86" height="30" rx="15" fill="#fff" fillOpacity="0.25" />
        <text x="203" y="43" fontSize="16" fontWeight="800" textAnchor="middle">가상 티켓</text>
        <text x="26" y="92" fontSize="24" fontWeight="800">2026 임곡대동제</text>
        <rect x="26" y="122" width="124" height="34" rx="17" fill="#fff" fillOpacity="0.22" />
        <text className="ta-price" x="88" y="146" fontSize="20" fontWeight="800" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₩{price.toLocaleString('ko-KR')}
        </text>
      </g>
      {/* 꼬리표 */}
      <g fill="#fff">
        <text x="306" y="48" fontSize="16" fontWeight="700" letterSpacing="0.5" textAnchor="middle" opacity="0.85">ADMIT</text>
        <text x="306" y="74" fontSize="22" fontWeight="800" textAnchor="middle">ONE</text>
        {[0, 4, 7, 12, 15, 19, 24, 27, 31, 36, 39, 44].map((x, i) => (
          <rect key={x} x={280 + x} y="96" width={i % 3 === 0 ? 3 : 1.6} height="44" rx="0.8" opacity="0.85" />
        ))}
      </g>
    </svg>
  )
}
