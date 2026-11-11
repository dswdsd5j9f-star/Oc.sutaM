import type { CSSProperties } from 'react'
import './Fader.css'

/** Travel of the cap's bottom edge, in px, across 0–100. */
const TRAVEL = 196

interface FaderProps {
  ariaLabel: string
  value: number
  color: string
  variant?: 'channel' | 'master'
  onChange: (value: number) => void
  onReset: () => void
}

/** A vertical fader driven by a hidden range input: drag up/down, double-click to reset. */
export function Fader({ ariaLabel, value, color, variant = 'channel', onChange, onReset }: FaderProps) {
  return (
    <label className={`fader fader--${variant}`}>
      <span className="fader__ticks" aria-hidden="true" />
      <span className="fader__slot" aria-hidden="true" />
      <span
        className="fader__cap"
        aria-hidden="true"
        style={{ bottom: `${(value / 100) * TRAVEL}px`, '--fader-color': color } as CSSProperties}
      >
        <span className="fader__stripe" />
      </span>
      <input
        className="fader__input"
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={onReset}
      />
    </label>
  )
}
