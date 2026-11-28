import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chatError, chatHistory, readAssistantStream, type ChatTurn } from '../src/features/assistant/chat.ts'

const delta = (text: string) => `event: delta\ndata: ${JSON.stringify({ text })}\n\n`
const done = (incomplete = false) => `event: done\ndata: ${JSON.stringify({ incomplete })}\n\n`

function stream(parts: Uint8Array[]) {
  return {
    body: new ReadableStream<Uint8Array>({
      start(controller) { for (const part of parts) controller.enqueue(part); controller.close() },
    }),
  }
}

test('SSE preserves UTF-8 and events at every possible chunk boundary, including CRLF', async () => {
  const text = ': heartbeat\n\n' + delta('Sa barangay, José 🙂. ') + delta('Dalhin ang ID.') + done()
  for (const ending of ['\n', '\r\n']) {
    const bytes = new TextEncoder().encode(text.replaceAll('\n', ending))
    for (let split = 1; split < bytes.length; split++) {
      let answer = ''
      const { body } = stream([bytes.slice(0, split), bytes.slice(split)])
      const result = await readAssistantStream(body, (part) => { answer += part })
      assert.deepEqual(result, { incomplete: false })
      assert.equal(answer, 'Sa barangay, José 🙂. Dalhin ang ID.')
      assert.equal(body.locked, false)
    }
  }
})

test('incomplete answers keep text and carry the incomplete flag', async () => {
  let answer = ''
  const { body } = stream([new TextEncoder().encode(delta('Step 1…') + done(true))])
  assert.deepEqual(await readAssistantStream(body, (part) => { answer += part }), { incomplete: true })
  assert.equal(answer, 'Step 1…')
  const empty = stream([new TextEncoder().encode(done(true))])
  assert.deepEqual(await readAssistantStream(empty.body, () => {}), { incomplete: true })
})

test('errors and unexpected EOF fail without losing delivered partial text', async () => {
  for (const ending of ['', 'event: error\ndata: {"message":"private upstream detail"}\n\n']) {
    let answer = ''
    const { body } = stream([new TextEncoder().encode(delta('Partial answer') + ending)])
    await assert.rejects(readAssistantStream(body, (part) => { answer += part }))
    assert.equal(answer, 'Partial answer')
    assert.equal(body.locked, false)
  }
})

test('malformed payloads and empty completed answers fail safely', async () => {
  for (const text of [
    done(), delta('   ') + done(), 'event: delta\ndata: not-json\n\n',
    'event: delta\ndata: {"text":42}\n\n',
    delta('Answer') + 'event: done\ndata: {"incomplete":"false"}\n\n',
  ]) {
    const { body } = stream([new TextEncoder().encode(text)])
    await assert.rejects(readAssistantStream(body, () => {}))
    assert.equal(body.locked, false)
  }
})

test('terminal event cancels an open reader instead of waiting for the connection to close', async () => {
  let cancelled = false
  const body = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new TextEncoder().encode(delta('Answer') + done())) },
    cancel() { cancelled = true },
  })
  await readAssistantStream(body, () => {})
  assert.equal(cancelled, true)
  assert.equal(body.locked, false)
})

test('network failure after a delta rejects and retains the partial answer', async () => {
  let answer = ''
  let calls = 0
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (calls++ === 0) controller.enqueue(new TextEncoder().encode(delta('Partial')))
      else controller.error(new Error('connection lost'))
    },
  })
  await assert.rejects(readAssistantStream(body, (part) => { answer += part }))
  assert.equal(answer, 'Partial')
  assert.equal(body.locked, false)
})

test('history contains only the last three complete exchanges, in order, clipped to API limits', () => {
  const turns: ChatTurn[] = Array.from({ length: 5 }, (_, i) => ({
    question: `q${i}`, answer: `a${i}`, history: [], status: 'complete',
  }))
  for (const status of ['error', 'incomplete', 'streaming'] as const) {
    turns.push({ question: 'failed question', answer: 'partial answer', history: [], status })
  }
  assert.deepEqual(chatHistory(turns), [
    { role: 'user', text: 'q2' }, { role: 'assistant', text: 'a2' },
    { role: 'user', text: 'q3' }, { role: 'assistant', text: 'a3' },
    { role: 'user', text: 'q4' }, { role: 'assistant', text: 'a4' },
  ])
  turns.push({ question: 'new', answer: 'a'.repeat(2500), history: [], status: 'complete' })
  assert.equal(chatHistory(turns).at(-1)?.text.length, 2000)
  turns.push({ question: 'emoji', answer: 'a'.repeat(1999) + '🙂', history: [], status: 'complete' })
  assert.equal(chatHistory(turns).at(-1)?.text.length, 1999, 'clipping must not leave half a surrogate pair')
  assert.deepEqual(chatHistory([]), [])
})

test('friendly failures give the agreed recovery actions without exposing server details', () => {
  for (const status of [429, 503]) assert.match(chatError(status).message, /roadmap and checklists still work/)
  assert.equal(chatError(429).action, undefined)
  assert.equal(chatError(503).action, 'retry')
  for (const status of [401, 404]) assert.equal(chatError(status).action, 'refresh')
  assert.match(chatError(0, true).title, /stopped before it finished/)
  assert.equal(chatError(400).action, undefined)
})
