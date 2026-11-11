import { useCallback, useEffect, useRef, useState } from 'react'
import { MixEngine } from '../audio/MixEngine'
import { LOOP_STEPS, playStep } from '../audio/pattern'
import type { MixState } from '../mix/types'

const SCHEDULE_MS = 25
const PAINT_MS = 50
const LOOKAHEAD_S = 0.08
/** How fast each channel's meter falls back between hits, per paint. */
const DECAY = [0.72, 0.7, 0.55, 0.8, 0.86, 0.82]
const ZERO_ENV = [0, 0, 0, 0, 0, 0]

interface QueuedStep {
  t: number
  pos: number
  hits: number[]
}

export interface LoopPlayer {
  playing: boolean
  /** Sound could not start (blocked by the browser), so only meters run. */
  silent: boolean
  /** Loop position (0–63) of the step being heard, or -1 when stopped. */
  step: number
  /** Per-channel meter envelope, 0–1, before fader gain. */
  env: number[]
  toggle: () => void
}

/**
 * Runs the built-in loop: a lookahead scheduler feeds the audio engine
 * ahead of time, and a slower paint tick turns the steps actually heard
 * into meter envelopes and the current step.
 */
export function useLoopPlayer(mix: MixState): LoopPlayer {
  const [playing, setPlaying] = useState(false)
  const [silent, setSilent] = useState(false)
  const [view, setView] = useState({ step: -1, env: ZERO_ENV })

  const mixRef = useRef(mix)
  const engineRef = useRef<MixEngine | null | undefined>(undefined)
  const timers = useRef<{ clock?: number; painter?: number }>({})
  const seq = useRef({ pos: 0, nextTime: 0, startedAt: 0, queue: [] as QueuedStep[], env: [...ZERO_ENV], step: -1 })

  const now = () => engineRef.current?.now ?? performance.now() / 1000

  useEffect(() => {
    mixRef.current = mix
    engineRef.current?.applyMix(mix.channels, mix.master)
  }, [mix])

  const halt = useCallback(() => {
    clearInterval(timers.current.clock)
    clearInterval(timers.current.painter)
    timers.current = {}
    const s = seq.current
    s.queue = []
    s.env = [...ZERO_ENV]
    s.step = -1
    setView({ step: -1, env: ZERO_ENV })
  }, [])

  const pump = useCallback(() => {
    const s = seq.current
    const engine = engineRef.current ?? null
    if (engine && !engine.running) {
      // Autoplay blocked: fall back to running the meters without sound.
      if (performance.now() - s.startedAt > 900) {
        engineRef.current = null
        s.queue = []
        s.nextTime = now() + 0.05
        setSilent(true)
      }
      return
    }
    const t = now()
    if (s.nextTime < t - 0.2) s.nextTime = t + 0.02
    const stepDur = 60 / mixRef.current.tempo / 4
    for (let guard = 0; s.nextTime < t + LOOKAHEAD_S && guard < 8; guard++) {
      const hits = playStep(s.pos, s.nextTime, engine)
      s.queue.push({ t: s.nextTime, pos: s.pos, hits })
      s.nextTime += stepDur
      s.pos = (s.pos + 1) % LOOP_STEPS
    }
  }, [])

  const paint = useCallback(() => {
    const s = seq.current
    s.env = s.env.map((e, i) => e * DECAY[i])
    const t = now()
    while (s.queue.length && s.queue[0].t <= t) {
      const it = s.queue.shift()!
      s.step = it.pos
      s.env = s.env.map((e, i) => Math.max(e, it.hits[i]))
    }
    setView({ step: s.step, env: s.env })
  }, [])

  const toggle = useCallback(() => {
    if (timers.current.clock !== undefined) {
      halt()
      setPlaying(false)
      return
    }
    if (engineRef.current === undefined) {
      try {
        engineRef.current = new MixEngine(mixRef.current.channels.length)
      } catch {
        engineRef.current = null
      }
    }
    const engine = engineRef.current
    engine?.resume()
    engine?.applyMix(mixRef.current.channels, mixRef.current.master)

    const s = seq.current
    s.startedAt = performance.now()
    s.pos = 0
    s.nextTime = now() + 0.06
    timers.current = {
      clock: window.setInterval(pump, SCHEDULE_MS),
      painter: window.setInterval(paint, PAINT_MS),
    }
    setPlaying(true)
    setSilent(engine === null)
  }, [halt, pump, paint])

  useEffect(
    () => () => {
      clearInterval(timers.current.clock)
      clearInterval(timers.current.painter)
      timers.current = {}
      engineRef.current?.close()
      engineRef.current = undefined
    },
    [],
  )

  return { playing, silent, step: view.step, env: view.env, toggle }
}
