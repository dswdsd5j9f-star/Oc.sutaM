import './Meter.css'

interface MeterProps {
  /** 0–1 */
  level: number
  width?: number
}

/** A segmented green / amber / red level meter. Decorative: hidden from assistive tech. */
export function Meter({ level, width = 10 }: MeterProps) {
  return (
    <span className="meter" style={{ width }} aria-hidden="true">
      <span className="meter__fill" style={{ height: `${Math.round(level * 100)}%` }} />
      <span className="meter__segments" />
    </span>
  )
}
