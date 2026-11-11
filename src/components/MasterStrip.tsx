import { dbOf } from '../mix/math'
import { Fader } from './Fader'
import { Meter } from './Meter'
import './Strip.css'

interface MasterStripProps {
  value: number
  meterL: number
  meterR: number
  chord: string
  bar: string
  onChange: (value: number) => void
  onReset: () => void
}

export function MasterStrip({ value, meterL, meterR, chord, bar, onChange, onReset }: MasterStripProps) {
  return (
    <section className="strip strip--master" aria-label="Master">
      <div className="strip__head">
        <span className="strip__swatch" style={{ background: 'var(--accent)' }} aria-hidden="true" />
        <h2 className="strip__title">Master</h2>
      </div>

      <dl className="master__stats">
        <div className="master__stat">
          <dt className="caption">CHORD</dt>
          <dd className="mono">{chord}</dd>
        </div>
        <div className="master__stat">
          <dt className="caption">BAR</dt>
          <dd className="mono">{bar}</dd>
        </div>
      </dl>

      <p className="master__help">
        Built-in four-bar loop in A minor. Drag knobs sideways and faders up or down. Double-click any control to reset
        it.
      </p>

      <div className="strip__fader-row master__fader-row">
        <div className="master__meters">
          <Meter level={meterL} width={12} />
          <Meter level={meterR} width={12} />
        </div>
        <Fader
          variant="master"
          ariaLabel="Master level"
          value={value}
          color="var(--accent)"
          onChange={onChange}
          onReset={onReset}
        />
      </div>

      <span className="readout mono">{dbOf(value)}</span>
    </section>
  )
}
