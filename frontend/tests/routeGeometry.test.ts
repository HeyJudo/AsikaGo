// Run: npm test (node --test). Needs Node 22.18+ or 23.6+, which strip TypeScript types without a flag.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRoute, waypoints, VIEW_H } from '../src/features/roadmap/routeGeometry.ts'

for (const stops of [1, 10, 12]) {
  test(`waypoints: A + ${stops} stops + Biz, left to right, inside the drawing`, () => {
    const pts = waypoints(stops)
    assert.equal(pts.length, stops + 2)
    assert.equal(pts[0][0], 70) // A sits 70 units in from the left edge
    assert.equal(pts.at(-1)![0], 930) // Biz sits 70 units in from the right edge (1000 wide)
    for (let i = 1; i < pts.length; i++) assert.ok(pts[i][0] > pts[i - 1][0], `x not increasing at ${i}`)
    for (const [, y] of pts) assert.ok(y >= 40 && y <= VIEW_H - 40, `y ${y} outside 40..${VIEW_H - 40}`)
  })
}

test('route: path starts at A and passes through every waypoint in order', () => {
  const pts = waypoints(10)
  const route = buildRoute(pts)
  assert.ok(route.d.startsWith(`M${pts[0][0]},${pts[0][1]} C`))
  assert.equal(route.fractions.length, pts.length)
  assert.equal(route.fractions[0], 0)
  assert.equal(route.fractions.at(-1), 1)
  for (let i = 1; i < pts.length; i++) assert.ok(route.fractions[i] > route.fractions[i - 1])
  pts.forEach(([x, y], i) => {
    const [ax, ay] = route.at(route.fractions[i])
    assert.ok(Math.hypot(ax - x, ay - y) < 0.5, `at(fraction ${i}) is (${ax}, ${ay}), expected (${x}, ${y})`)
  })
})

test('route: at() clamps outside 0..1 and moves forward along the road', () => {
  const pts = waypoints(10)
  const route = buildRoute(pts)
  assert.deepEqual(route.at(-1), route.at(0))
  assert.deepEqual(route.at(2), route.at(1))
  assert.ok(route.at(0.5)[0] > route.at(0.25)[0])
})
