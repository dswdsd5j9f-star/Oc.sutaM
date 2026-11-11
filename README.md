# Mixpult

A six-channel mix console with a built-in four-bar loop in A minor, built with React, Vite and the Web Audio API.

```bash
npm install
npm run dev
```

- Drag knobs sideways and faders up or down; double-click any control to reset it.
- If the browser blocks audio, the loop still runs and drives the meters.

## Layout

| Path | What it holds |
| --- | --- |
| `src/mix/` | Mixer state: channel defaults, reducer, gain/dB math |
| `src/audio/MixEngine.ts` | Web Audio graph: per-channel tone → fader → pan + reverb send, master limiter |
| `src/audio/pattern.ts` | The loop: drums, bass, chords and lead per step |
| `src/hooks/useLoopPlayer.ts` | Lookahead scheduler and meter envelopes |
| `src/components/` | `TransportBar`, `ChannelStrip`, `MasterStrip`, `Knob`, `Fader`, `Meter`, `ToggleButton` |
| `src/index.css` | Colour, type and size tokens |
