import type { MixEngine } from './MixEngine'

/** Four bars of sixteen steps. */
export const LOOP_STEPS = 64
export const STEPS_PER_BAR = 16
export const CHORD_NAMES = ['Am', 'F', 'C', 'G'] as const

const BASS = [33, 29, 36, 31]
const CHORDS = [
  [57, 60, 64],
  [57, 60, 65],
  [55, 60, 64],
  [55, 59, 62],
]
const LEAD: Record<number, number>[] = [
  { 0: 76, 3: 72, 6: 69, 8: 72, 12: 74 },
  { 0: 72, 4: 69, 6: 65, 10: 69, 12: 72 },
  { 0: 67, 3: 72, 6: 76, 8: 79, 12: 76 },
  { 0: 74, 4: 71, 8: 67, 12: 71, 14: 74 },
]

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

/**
 * Plays one step of the built-in loop at time `t` (when an engine is given)
 * and returns each channel's hit strength (0–1) for the meters.
 */
export function playStep(pos: number, t: number, engine: MixEngine | null): number[] {
  const bar = Math.floor(pos / STEPS_PER_BAR)
  const s = pos % STEPS_PER_BAR
  const hits = [0, 0, 0, 0, 0, 0]

  // Kick
  if (s % 4 === 0 || (bar === 3 && s === 14)) {
    hits[0] = 1
    if (engine) {
      const o = engine.osc(0, t, 'sine', 150, 0.95, 0.32)
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    }
  }
  // Snare
  if (s === 4 || s === 12) {
    hits[1] = 0.9
    if (engine) {
      engine.noise(1, t, 'bandpass', 1900, 0.7, 0.18)
      engine.osc(1, t, 'triangle', 190, 0.35, 0.1)
    }
  }
  // Hats
  if (s % 2 === 0 || s === 15) {
    const off = s % 4 === 2
    hits[2] = off ? 0.75 : 0.45
    engine?.noise(2, t, 'highpass', 7000, off ? 0.34 : 0.17, s === 14 ? 0.2 : 0.05)
  }
  // Bass
  if (s === 0 || s === 3 || s === 6 || s === 10 || s === 12) {
    hits[3] = 0.85
    engine?.osc(3, t, 'sawtooth', hz(BASS[bar] + (s === 10 ? 12 : 0)), 0.42, 0.24, 520)
  }
  // Keys
  if (s === 0 || s === 6 || s === 10) {
    hits[4] = 0.7
    if (engine) CHORDS[bar].forEach((m) => engine.osc(4, t, 'triangle', hz(m), 0.15, s === 0 ? 0.8 : 0.4))
  }
  // Lead
  const note = LEAD[bar][s]
  if (note) {
    hits[5] = 0.7
    engine?.osc(5, t, 'square', hz(note), 0.1, 0.28, 2400)
  }
  return hits
}
