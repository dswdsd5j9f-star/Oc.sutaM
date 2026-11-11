import { useReducer } from 'react'
import { CHORD_NAMES, STEPS_PER_BAR } from './audio/pattern'
import { ChannelStrip } from './components/ChannelStrip'
import { MasterStrip } from './components/MasterStrip'
import { TransportBar } from './components/TransportBar'
import { useLoopPlayer } from './hooks/useLoopPlayer'
import { gainOf } from './mix/math'
import { mixReducer } from './mix/reducer'
import { initialMix, isAudible, TEMPO_STEP } from './mix/types'
import './App.css'

export default function App() {
  const [mix, dispatch] = useReducer(mixReducer, undefined, initialMix)
  const player = useLoopPlayer(mix)

  // Channel meters follow fader and mute/solo; the master sums them per side by pan.
  const meters = mix.channels.map((c, i) =>
    isAudible(c, mix.channels) ? Math.min(1, player.env[i] * gainOf(c.level) * 0.8) : 0,
  )
  const sumL = mix.channels.reduce((acc, c, i) => acc + (meters[i] * (c.pan <= 0 ? 1 : 1 - c.pan / 50)) ** 2, 0)
  const sumR = mix.channels.reduce((acc, c, i) => acc + (meters[i] * (c.pan >= 0 ? 1 : 1 + c.pan / 50)) ** 2, 0)
  const mg = gainOf(mix.master) * 0.75
  const bar = player.step >= 0 ? Math.floor(player.step / STEPS_PER_BAR) : -1

  return (
    <div className="console">
      <TransportBar
        playing={player.playing}
        silent={player.silent}
        tempo={mix.tempo}
        step={player.step}
        onTogglePlay={player.toggle}
        onTempo={(dir) => dispatch({ type: 'nudgeTempo', delta: dir * TEMPO_STEP })}
        onReset={() => dispatch({ type: 'reset' })}
      />

      <div className="console__body">
        <div className="console__channels">
          {mix.channels.map((ch, i) => (
            <ChannelStrip
              key={ch.name}
              channel={ch}
              index={i}
              meter={meters[i]}
              onParam={(param, value) => dispatch({ type: 'setParam', index: i, param, value })}
              onResetParam={(param) => dispatch({ type: 'resetParam', index: i, param })}
              onToggle={(key) => dispatch({ type: 'toggle', index: i, key })}
            />
          ))}
        </div>

        <MasterStrip
          value={mix.master}
          meterL={Math.min(1, Math.sqrt(sumL) * mg)}
          meterR={Math.min(1, Math.sqrt(sumR) * mg)}
          chord={bar >= 0 ? CHORD_NAMES[bar] : '--'}
          bar={bar >= 0 ? `${bar + 1} / 4` : '--'}
          onChange={(value) => dispatch({ type: 'setMaster', value })}
          onReset={() => dispatch({ type: 'resetMaster' })}
        />
      </div>
    </div>
  )
}
