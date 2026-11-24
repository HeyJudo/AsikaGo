export type Line = { speaker: 'You' | 'AsikaGo'; text: string }

export function appendDelta(lines: Line[], speaker: Line['speaker'], delta: string): Line[] {
  const last = lines[lines.length - 1]
  if (last && last.speaker === speaker) {
    return [...lines.slice(0, -1), { speaker, text: last.text + delta }]
  }
  return [...lines, { speaker, text: delta }]
}

export function costUsd(seconds: number, perMinute: number): string {
  // toPrecision first: 0.00225 is stored just below, so a bare toFixed(4) rounds it down to 0.0022
  const tenThousandths = Math.round(Number((((seconds / 60) * perMinute) * 1e4).toPrecision(12)))
  return '$' + (tenThousandths / 1e4).toFixed(4)
}

export function formatTime(seconds: number): string {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
