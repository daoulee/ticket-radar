import { DoorClosed, Gavel, TicketX, type LucideIcon } from 'lucide-react'
import './icon-hover.css'

// The adjacent heading describes the meaning; icons are decorative.
function DrawIcon({ icon: Icon, kind }: { icon: LucideIcon; kind: string }) {
  return <Icon className={`draw-icon ${kind}`} size={44} strokeWidth={1.8} aria-hidden="true" focusable="false" />
}

export function IconTicketOff() { return <DrawIcon icon={TicketX} kind="ticket-hover" /> }
export function IconGateOff() {
  return (
    <span className="door-icons" aria-hidden="true">
      <DrawIcon icon={DoorClosed} kind="door-frame" />
      <svg className="draw-icon door-panel" viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        <path d="M5 3h14v18H5z" /><path d="M9 12h.01" />
      </svg>
    </span>
  )
}
export function IconGavelOff() { return <DrawIcon icon={Gavel} kind="gavel-hover" /> }
