import { clamp } from './math'
import {
  initialMix,
  DEFAULT_MASTER,
  TEMPO_MAX,
  TEMPO_MIN,
  type ChannelParam,
  type ChannelToggle,
  type MixState,
} from './types'

export type MixAction =
  | { type: 'setParam'; index: number; param: ChannelParam; value: number }
  | { type: 'resetParam'; index: number; param: ChannelParam }
  | { type: 'toggle'; index: number; key: ChannelToggle }
  | { type: 'setMaster'; value: number }
  | { type: 'resetMaster' }
  | { type: 'nudgeTempo'; delta: number }
  | { type: 'reset' }

export function mixReducer(state: MixState, action: MixAction): MixState {
  switch (action.type) {
    case 'setParam':
      return updateChannel(state, action.index, { [action.param]: action.value })
    case 'resetParam': {
      const ch = state.channels[action.index]
      return updateChannel(state, action.index, { [action.param]: ch.defaults[action.param] })
    }
    case 'toggle': {
      const ch = state.channels[action.index]
      return updateChannel(state, action.index, { [action.key]: !ch[action.key] })
    }
    case 'setMaster':
      return { ...state, master: action.value }
    case 'resetMaster':
      return { ...state, master: DEFAULT_MASTER }
    case 'nudgeTempo':
      return { ...state, tempo: clamp(state.tempo + action.delta, TEMPO_MIN, TEMPO_MAX) }
    case 'reset':
      return initialMix()
  }
}

function updateChannel(state: MixState, index: number, patch: object): MixState {
  return {
    ...state,
    channels: state.channels.map((c, i) => (i === index ? { ...c, ...patch } : c)),
  }
}
