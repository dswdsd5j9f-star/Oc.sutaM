/** Fader position (0–100) to linear gain; 75 is unity. */
export function gainOf(v: number): number {
  return Math.pow(v / 75, 2)
}

export function dbOf(v: number): string {
  if (v <= 0) return '-inf dB'
  const db = 20 * Math.log10(gainOf(v))
  const r = Math.round(db * 10) / 10
  return (r > 0 ? '+' : '') + r.toFixed(1) + ' dB'
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}
