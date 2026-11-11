import { dbOf } from '../mix/math'
import { PARAM_RANGE, type Channel, type ChannelParam, type ChannelToggle } from '../mix/types'
import { Fader } from './Fader'
import { Knob } from './Knob'
import { Meter } from './Meter'
import { ToggleButton } from './ToggleButton'
import './Strip.css'

interface ChannelStripProps {
  channel: Channel
  index: number
  /** 0–1, already scaled for fader and mute/solo. */
  meter: number
  onParam: (param: ChannelParam, value: number) => void
  onResetParam: (param: ChannelParam) => void
  onToggle: (key: ChannelToggle) => void
}

const KNOBS: { param: ChannelParam; label: string; aria: string; bipolar: boolean }[] = [
  { param: 'tone', label: 'TONE', aria: 'tone', bipolar: true },
  { param: 'pan', label: 'PAN', aria: 'pan', bipolar: true },
  { param: 'space', label: 'SPACE', aria: 'space (reverb)', bipolar: false },
]

export function ChannelStrip({ channel: ch, index, meter, onParam, onResetParam, onToggle }: ChannelStripProps) {
  return (
    <section className="strip" aria-label={ch.name}>
      <div className="strip__head">
        <span className="strip__swatch" style={{ background: ch.color }} aria-hidden="true" />
        <div className="strip__title-row">
          <h2 className="strip__title">{ch.name}</h2>
          <span className="strip__num mono">{String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="strip__knobs">
        {KNOBS.map((k) => (
          <Knob
            key={k.param}
            label={k.label}
            ariaLabel={`${ch.name} ${k.aria}`}
            value={ch[k.param]}
            {...PARAM_RANGE[k.param]}
            color={ch.color}
            bipolar={k.bipolar}
            onChange={(v) => onParam(k.param, v)}
            onReset={() => onResetParam(k.param)}
          />
        ))}
      </div>

      <div className="strip__toggles">
        <ToggleButton pressed={ch.mute} tone="danger" ariaLabel={`Mute ${ch.name}`} onClick={() => onToggle('mute')}>
          Mute
        </ToggleButton>
        <ToggleButton pressed={ch.solo} tone="accent" ariaLabel={`Solo ${ch.name}`} onClick={() => onToggle('solo')}>
          Solo
        </ToggleButton>
      </div>

      <div className="strip__fader-row">
        <Meter level={meter} />
        <Fader
          ariaLabel={`${ch.name} level`}
          value={ch.level}
          color={ch.color}
          onChange={(v) => onParam('level', v)}
          onReset={() => onResetParam('level')}
        />
      </div>

      <span className="readout mono">{dbOf(ch.level)}</span>
    </section>
  )
}
