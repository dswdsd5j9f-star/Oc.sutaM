import { gainOf } from '../mix/math'
import { isAudible, type Channel } from '../mix/types'

interface Strip {
  input: GainNode
  tone: BiquadFilterNode
  fader: GainNode
  pan: StereoPannerNode
  send: GainNode
}

/**
 * The Web Audio graph: one strip per channel (input → high-shelf tone →
 * fader → panner → master, with a post-fader send to a shared reverb),
 * then master gain → limiter → speakers. Voices are short-lived
 * oscillator / noise nodes fed into a strip's input.
 */
export class MixEngine {
  readonly ctx: AudioContext
  private master: GainNode
  private strips: Strip[]
  private noiseBuf: AudioBuffer

  constructor(channelCount: number) {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    this.ctx = ctx

    this.master = ctx.createGain()
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -8
    limiter.knee.value = 6
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.15
    this.master.connect(limiter)
    limiter.connect(ctx.destination)

    const reverb = ctx.createConvolver()
    reverb.buffer = makeImpulse(ctx, 1.8)
    const wet = ctx.createGain()
    wet.gain.value = 0.6
    reverb.connect(wet)
    wet.connect(this.master)

    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const nd = this.noiseBuf.getChannelData(0)
    for (let n = 0; n < nd.length; n++) nd[n] = Math.random() * 2 - 1

    this.strips = Array.from({ length: channelCount }, () => {
      const input = ctx.createGain()
      const tone = ctx.createBiquadFilter()
      const fader = ctx.createGain()
      const pan = ctx.createStereoPanner()
      const send = ctx.createGain()
      tone.type = 'highshelf'
      tone.frequency.value = 2200
      input.connect(tone)
      tone.connect(fader)
      fader.connect(pan)
      pan.connect(this.master)
      fader.connect(send)
      send.connect(reverb)
      return { input, tone, fader, pan, send }
    })
  }

  get now(): number {
    return this.ctx.currentTime
  }

  get running(): boolean {
    return this.ctx.state === 'running'
  }

  resume(): void {
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  close(): void {
    void this.ctx.close()
  }

  applyMix(channels: Channel[], master: number): void {
    const t = this.ctx.currentTime
    channels.forEach((c, i) => {
      const n = this.strips[i]
      n.fader.gain.setTargetAtTime(isAudible(c, channels) ? gainOf(c.level) : 0, t, 0.015)
      n.tone.gain.setTargetAtTime((c.tone / 50) * 14, t, 0.02)
      n.pan.pan.setTargetAtTime(c.pan / 50, t, 0.02)
      n.send.gain.setTargetAtTime(c.space / 100, t, 0.02)
    })
    this.master.gain.setTargetAtTime(gainOf(master) * 0.7, t, 0.015)
  }

  osc(ch: number, t: number, type: OscillatorType, freq: number, peak: number, dur: number, cutoff = 0): OscillatorNode {
    const { ctx } = this
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    let out: AudioNode = g
    if (cutoff) {
      const f = ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = cutoff
      g.connect(f)
      out = f
    }
    out.connect(this.strips[ch].input)
    o.start(t)
    o.stop(t + dur + 0.02)
    return o
  }

  noise(ch: number, t: number, type: BiquadFilterType, freq: number, peak: number, dur: number): void {
    const { ctx } = this
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(peak, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(f)
    f.connect(g)
    g.connect(this.strips[ch].input)
    src.start(t)
    src.stop(t + dur + 0.02)
  }
}

function makeImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let n = 0; n < len; n++) d[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / len, 3)
  }
  return ir
}
