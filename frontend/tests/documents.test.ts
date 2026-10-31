import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type ViteDevServer } from 'vite'
import type { Documents } from '../src/lib/queries.ts'

let server: ViteDevServer
let setPrepared: typeof import('../src/lib/queries.ts').setPrepared

before(async () => {
  // supabase.ts throws at import without these; these tests never call Supabase
  process.env.VITE_SUPABASE_URL ??= 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key'
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  setPrepared = (await server.ssrLoadModule('/src/lib/queries.ts')).setPrepared
})
after(async () => { await server?.close() })

const req = (id: string, isPrepared: boolean, appliesTo: string | null = null) => ({
  id, name: `Document ${id}`, description: null, appliesTo, source: null, isPrepared,
})

// Requirement "a" is asked for in both steps, like papers asked for again in Step 9.
const docs: Documents = {
  totalCount: 4,
  preparedCount: 2,
  steps: [
    { number: 1, name: 'DTI Business Name Registration', status: 'Completed', requirements: [req('a', true), req('b', false)] },
    { number: 2, name: 'Barangay Business Clearance', status: 'NotStarted', requirements: [req('c', false), req('a', true)] },
  ],
}

const prepared = (d: Documents) => d.steps.flatMap(s => s.requirements.filter(r => r.isPrepared).map(r => r.id))

test('ticking a document marks it prepared and adds it to the count', () => {
  const next = setPrepared(docs, 'b', true)
  assert.equal(next.preparedCount, 3)
  assert.deepEqual(prepared(next), ['a', 'b', 'a'])
})

test('a document asked for in two steps changes in both', () => {
  const next = setPrepared(docs, 'a', false)
  assert.equal(next.preparedCount, 0)
  assert.deepEqual(prepared(next), [])
})

test('undoing one failed tick keeps a later tick of another document', () => {
  const afterBoth = setPrepared(setPrepared(docs, 'c', true), 'b', true)
  const rolledBack = setPrepared(afterBoth, 'c', false)
  assert.equal(rolledBack.preparedCount, 3)
  assert.deepEqual(prepared(rolledBack), ['a', 'b', 'a'])
})

test('the cached response is not changed in place', () => {
  setPrepared(docs, 'b', true)
  assert.equal(docs.preparedCount, 2)
  assert.equal(docs.steps[0].requirements[1].isPrepared, false)
})
