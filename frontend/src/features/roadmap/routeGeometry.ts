// Geometry for the roadmap visualizer: a winding road from A (bottom left) up to Biz (top right).
// Pure functions in viewBox units (1000 × 300), so they can be tested without a browser.

export const VIEW_W = 1000
export const VIEW_H = 300

export type Point = [number, number]

const round = (v: number) => Math.round(v * 10) / 10

// A, one waypoint per step, then Biz. The road climbs about 100 units overall while it winds.
export function waypoints(stops: number): Point[] {
  const n = stops + 2
  return Array.from({ length: n }, (_, i) => [
    round(70 + (i * (VIEW_W - 140)) / (n - 1)),
    round(200 - (i / (n - 1)) * 99 + 60 * Math.sin(i * 1.35 + 0.3)),
  ])
}

// Catmull-Rom through every waypoint, written as cubic Béziers so the road passes exactly through each stop.
// `fractions[i]` is how far along the road waypoint i sits (0 at A, 1 at Biz). `at(f)` is the point at that fraction.
export function buildRoute(pts: Point[]) {
  const segments: [Point, Point, Point, Point][] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    segments.push([
      p1,
      [round(p1[0] + (p2[0] - p0[0]) / 6), round(p1[1] + (p2[1] - p0[1]) / 6)],
      [round(p2[0] - (p3[0] - p1[0]) / 6), round(p2[1] - (p3[1] - p1[1]) / 6)],
      p2,
    ])
  }
  const d = `M${pts[0][0]},${pts[0][1]}` + segments.map(([, c1, c2, e]) => ` C${c1} ${c2} ${e}`).join('')

  // Sample the curve into a polyline with running lengths, for arc-length lookups.
  const STEPS = 32
  const samples: Point[] = [pts[0]]
  const lengths = [0]
  const fractions = [0]
  for (const [a, b, c, e] of segments) {
    for (let s = 1; s <= STEPS; s++) {
      const t = s / STEPS, u = 1 - t
      const p: Point = [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1],
      ]
      const prev = samples[samples.length - 1]
      lengths.push(lengths[lengths.length - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]))
      samples.push(p)
    }
    fractions.push(lengths[lengths.length - 1])
  }
  const total = lengths[lengths.length - 1]
  for (let i = 0; i < fractions.length; i++) fractions[i] /= total

  function at(f: number): Point {
    const target = Math.min(Math.max(f, 0), 1) * total
    let lo = 0, hi = lengths.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (lengths[mid] < target) lo = mid
      else hi = mid
    }
    const span = lengths[hi] - lengths[lo] || 1
    const k = (target - lengths[lo]) / span
    return [samples[lo][0] + (samples[hi][0] - samples[lo][0]) * k, samples[lo][1] + (samples[hi][1] - samples[lo][1]) * k]
  }

  return { d, fractions, at }
}
