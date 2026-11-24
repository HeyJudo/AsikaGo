import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appendDelta, costUsd, formatTime } from '../src/voice-precheck/helpers.ts'

test('appendDelta joins same speaker', () => {
  const a = appendDelta([], 'You', 'Ano ')
  const b = appendDelta(a, 'You', 'pa')
  assert.deepEqual(b, [{ speaker: 'You', text: 'Ano pa' }])
  assert.equal(a[0].text, 'Ano ')
})

test('appendDelta starts a new line on speaker change', () => {
  const lines = appendDelta(appendDelta([], 'You', 'Ano pa'), 'AsikaGo', 'Kulang')
  assert.equal(lines.length, 2)
  assert.deepEqual(lines[1], { speaker: 'AsikaGo', text: 'Kulang' })
})

test('costUsd', () => {
  assert.equal(costUsd(90, 0.05), '$0.0750')
  assert.equal(costUsd(30, 0.0045), '$0.0023')
})

test('formatTime', () => {
  assert.equal(formatTime(0), '0:00')
  assert.equal(formatTime(75), '1:15')
})
