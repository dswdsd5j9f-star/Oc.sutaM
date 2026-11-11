import type { CSSProperties } from 'react'
import './Knob.css'

const SWEEP = 270

interface KnobProps {
  label: string
  ariaLabel: string
  value: number
  min: number
  max: number
  color: string
  /** Fill the ring from the centre (12 o'clock) instead of from the minimum. */
  bipolar?: boolean
  onChange: (value: number) => void
  onReset: () => void
}

/** A rotary knob driven by a hidden range input: drag sideways, double-click to reset. */
export function Knob({ label, ariaLabel, value, min, max, color, bipolar = false, onChange, onReset }: KnobProps) {
  const pos = ((value - min) / (max - min)) * SWEEP
  const from = bipolar ? Math.min(SWEEP / 2, pos) : 0
  const to = bipolar ? Math.max(SWEEP / 2, pos) : pos
  const ring =
    `conic-gradient(from 225deg, var(--knob-track) 0deg ${from}deg, ${color} ${from}deg ${to}deg, ` +
    `var(--knob-track) ${to}deg ${SWEEP}deg, transparent ${SWEEP}deg)`

  return (
    <label className="knob">
      <span className="knob__ring" style={{ background: ring }}>
        <span className="knob__cap" style={{ '--rot': `${pos - SWEEP / 2}deg` } as CSSProperties}>
          <span className="knob__pointer" />
        </span>
        <input
          className="knob__input"
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          onDoubleClick={onReset}
        />
      </span>
      <span className="caption">{label}</span>
    </label>
  )
}
