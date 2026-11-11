export type ChannelParam = 'level' | 'tone' | 'pan' | 'space'
export type ChannelToggle = 'mute' | 'solo'

export interface Channel {
  name: string
  color: string
  level: number
  tone: number
  pan: number
  space: number
  mute: boolean
  solo: boolean
  defaults: Record<ChannelParam, number>
}

export interface MixState {
  channels: Channel[]
  master: number
  tempo: number
}

export const CHANNEL_COUNT = 6
export const DEFAULT_MASTER = 75
export const DEFAULT_TEMPO = 110
export const TEMPO_MIN = 70
export const TEMPO_MAX = 160
export const TEMPO_STEP = 2

/** Every value a knob or fader takes, as min/max. */
export const PARAM_RANGE: Record<ChannelParam, { min: number; max: number }> = {
  level: { min: 0, max: 100 },
  tone: { min: -50, max: 50 },
  pan: { min: -50, max: 50 },
  space: { min: 0, max: 100 },
}

function channel(name: string, color: string, level: number, tone: number, pan: number, space: number): Channel {
  return {
    name,
    color,
    level,
    tone,
    pan,
    space,
    mute: false,
    solo: false,
    defaults: { level, tone, pan, space },
  }
}

export function initialMix(): MixState {
  return {
    channels: [
      channel('Kick', '#FF8266', 75, 0, 0, 0),
      channel('Snare', '#FF8FCB', 70, 0, 0, 25),
      channel('Hats', '#A6E36E', 60, 0, 20, 10),
      channel('Bass', '#5CC8FF', 72, 0, 0, 0),
      channel('Keys', '#B8A1FF', 64, 0, -20, 30),
      channel('Lead', '#4FE3C1', 62, 0, 10, 35),
    ],
    master: DEFAULT_MASTER,
    tempo: DEFAULT_TEMPO,
  }
}

/** True when the channel should be heard, given every channel's mute and solo. */
export function isAudible(ch: Channel, channels: Channel[]): boolean {
  const anySolo = channels.some((c) => c.solo)
  return !ch.mute && (!anySolo || ch.solo)
}
