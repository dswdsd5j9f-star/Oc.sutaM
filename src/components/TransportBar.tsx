import { STEPS_PER_BAR } from '../audio/pattern'
import './TransportBar.css'

interface TransportBarProps {
  playing: boolean
  silent: boolean
  tempo: number
  /** Loop position of the step being heard, or -1. */
  step: number
  onTogglePlay: () => void
  onTempo: (delta: number) => void
  onReset: () => void
}

export function TransportBar({ playing, silent, tempo, step, onTogglePlay, onTempo, onReset }: TransportBarProps) {
  const current = step >= 0 ? step % STEPS_PER_BAR : -1

  return (
    <header className="transport">
      <div className="transport__brand">
        <h1 className="transport__title">Mixpult</h1>
        <p className="transport__subtitle">Six channels, three knobs each, one master</p>
      </div>

      <button type="button" className="transport__play" aria-pressed={playing} onClick={onTogglePlay}>
        {playing ? (
          <>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
            </svg>
            Stop
          </>
        ) : (
          <>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1.5v13l11-6.5z" />
            </svg>
            Play
          </>
        )}
      </button>

      <div className="transport__tempo" role="group" aria-label="Tempo">
        <button type="button" className="icon-button" aria-label="Slower" onClick={() => onTempo(-1)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10" />
          </svg>
        </button>
        <div className="transport__bpm">
          <span className="transport__bpm-value mono">{tempo}</span>
          <span className="caption">BPM</span>
        </div>
        <button type="button" className="icon-button" aria-label="Faster" onClick={() => onTempo(1)}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M8 3v10" />
          </svg>
        </button>
      </div>

      <div className="transport__steps" aria-hidden="true">
        {Array.from({ length: STEPS_PER_BAR }, (_, k) => (
          <span
            key={k}
            className={
              'transport__step' +
              (k === current ? ' transport__step--current' : k % 4 === 0 ? ' transport__step--beat' : '')
            }
          />
        ))}
      </div>

      <button type="button" className="transport__reset" onClick={onReset}>
        Reset mix
      </button>

      {silent && <p className="transport__notice">Sound is blocked in this view, so only the meters are running.</p>}
    </header>
  )
}
