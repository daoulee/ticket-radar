import './cta-center.css'

// 화살표도 각 문구의 일부로 묶어 짧은 호버 문구를 포함한 전체를 가운데 정렬한다.
export function RollText({ text, hoverText = text, arrow = false }: { text: string; hoverText?: string; arrow?: boolean }) {
  return (
    <span className={`roll${arrow ? ' roll-with-arrow' : ''}`} aria-hidden="true">
      <span className="roll-label roll-default">{text}{arrow && <span className="roll-arrow">→</span>}</span>
      <span className="roll-label roll-hover">{hoverText}{arrow && <span className="roll-arrow">→</span>}</span>
    </span>
  )
}
