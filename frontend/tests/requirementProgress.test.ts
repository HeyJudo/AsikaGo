import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query'
import { createServer, type ViteDevServer } from 'vite'
import type { StepDetail } from '../src/lib/queries.ts'

let server: ViteDevServer
let queries: typeof import('../src/lib/queries.ts')
let Page: typeof import('../src/features/roadmap/StepDetailPage.tsx').StepDetailPage
const originalFetch = globalThis.fetch
let save: (id: string, prepared: boolean) => Promise<Response>
let saved: StepDetail

const step: StepDetail = {
  number: 1, totalSteps: 2, stepId: 'step-1', name: 'Register business', agency: 'Agency',
  description: 'Register your business.', actions: ['Prepare documents'], conditionNote: null,
  previousNumber: null, nextNumber: 2, status: 'NotStarted', completedAt: null,
  requirements: ['a', 'b'].map((id) => ({
    id, name: `Document ${id}`, description: 'Bring a copy.', appliesTo: null, isPrepared: false,
    source: { name: 'Official source', url: 'https://example.com', dateVerified: '2026-10-01' },
  })),
}

before(async () => {
  process.env.VITE_SUPABASE_URL ??= 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key'
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  const { supabase } = await server.ssrLoadModule('/src/lib/supabase.ts')
  supabase.auth.getSession = async () => ({ data: { session: null }, error: null })
  queries = await server.ssrLoadModule('/src/lib/queries.ts')
  Page = (await server.ssrLoadModule('/src/features/roadmap/StepDetailPage.tsx')).StepDetailPage
  globalThis.fetch = async (input, init) => {
    if (init?.method === 'PUT') {
      return save(String(input).split('/').at(-1)!, JSON.parse(String(init.body)).isPrepared)
    }
    return Response.json(saved)
  }
})

after(async () => {
  globalThis.fetch = originalFetch
  await server?.close()
})

function client(data = step) {
  saved = structuredClone(data)
  const result = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } } })
  result.setQueryData(['roadmap-step', 1], structuredClone(data))
  result.setQueryData(['roadmap'], {})
  result.setQueryData(['roadmap-documents'], {})
  return result
}

function render(client: QueryClient, child: ReturnType<typeof createElement>) {
  return renderToStaticMarkup(createElement(QueryClientProvider, { client }, child))
}

function mutation(client: QueryClient) {
  let result: ReturnType<typeof queries.useUpdateRequirement>
  function Capture() { result = queries.useUpdateRequirement(1); return null }
  render(client, createElement(Capture))
  return result!
}

function detail(client: QueryClient) {
  let result: StepDetail | null | undefined
  function Capture() { result = queries.useRoadmapStep(1).data; return null }
  render(client, createElement(Capture))
  return result!
}

function deferred() {
  let resolve!: (value: Response) => void
  const promise = new Promise<Response>((done) => { resolve = done })
  return { promise, resolve }
}

test('every document has a native labeled checkbox, 44px target, and separate source link', () => {
  const cache = client()
  const html = render(cache, createElement(MemoryRouter, { initialEntries: ['/roadmap/steps/1'] },
    createElement(Routes, null, createElement(Route, { path: '/roadmap/steps/:number', element: createElement(Page) }))))
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 2)
  const labels = [...html.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/g)].map((match) => match[0])
  assert.equal(labels.length, 2)
  for (const label of labels) {
    assert.match(label, /min-h-11/)
    assert.match(label, /m-2\.5 size-6/)
    assert.match(label, /type="checkbox"/)
    assert.match(label, /Document [ab]/)
    assert.doesNotMatch(label, /<a\b/)
  }
  assert.match(html, /0 of 2 ready/)
  assert.equal((html.match(/href="https:\/\/example.com"/g) ?? []).length, 2)
  cache.clear()
})

test('overlapping checks survive refetches; failure rolls back only its document', async () => {
  const cache = client()
  const a = deferred(), b = deferred()
  save = async (id, prepared) => {
    const response = await (id === 'a' ? a : b).promise
    if (response.ok) saved.requirements.find((item) => item.id === id)!.isPrepared = prepared
    return response
  }
  const first = mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: true })
  const second = mutation(cache).mutateAsync({ requirementId: 'b', isPrepared: true })
  const failed = assert.rejects(second, /API 500/)
  assert.deepEqual(detail(cache).requirements.map((item) => item.isPrepared), [true, true])
  assert.equal(detail(cache).status, 'InProgress')

  // A stale GET must not replace either pending checkbox's optimistic value.
  cache.setQueryData(['roadmap-step', 1], structuredClone(step))
  assert.deepEqual(detail(cache).requirements.map((item) => item.isPrepared), [true, true])
  a.resolve(new Response(null, { status: 204 }))
  await first
  assert.deepEqual(detail(cache).requirements.map((item) => item.isPrepared), [true, true])
  b.resolve(new Response('Save failed', { status: 500 }))
  await failed
  assert.deepEqual(detail(cache).requirements.map((item) => item.isPrepared), [true, false])
  assert.equal(detail(cache).status, 'InProgress')
  for (const key of [['roadmap'], ['roadmap-step', 1], ['roadmap-documents']]) {
    assert.equal(cache.getQueryState(key)?.isInvalidated, true)
  }
  save = async () => new Response(null, { status: 204 })
  await mutation(cache).mutateAsync({ requirementId: 'b', isPrepared: true })
  assert.deepEqual(detail(cache).requirements.map((item) => item.isPrepared), [true, true])
  // Preparing every document does not complete the office visit.
  assert.equal(detail(cache).status, 'InProgress')
  cache.clear()
})

test('failed unchecking restores the checked value; successful unchecking resets unfinished status', async () => {
  const cache = client({ ...step, status: 'InProgress', requirements: step.requirements.map((item, i) => ({ ...item, isPrepared: i === 0 })) })
  const request = deferred()
  save = () => request.promise
  const pending = mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: false })
  const failed = assert.rejects(pending, /API 500/)
  assert.equal(detail(cache).requirements[0].isPrepared, false)
  assert.equal(detail(cache).status, 'NotStarted')
  request.resolve(new Response('Save failed', { status: 500 }))
  await failed
  assert.equal(detail(cache).requirements[0].isPrepared, true)
  assert.equal(detail(cache).status, 'InProgress')
  save = async () => new Response(null, { status: 204 })
  await mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: false })
  assert.equal(detail(cache).status, 'NotStarted')
  cache.clear()
})

test('checking documents preserves completed status and completion date', async () => {
  const completedAt = '2026-10-30T00:00:00Z'
  const cache = client({ ...step, status: 'Completed', completedAt })
  const request = deferred()
  save = () => request.promise
  const pending = mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: true })
  assert.equal(detail(cache).status, 'Completed')
  request.resolve(new Response(null, { status: 204 }))
  await pending
  assert.equal(detail(cache).status, 'Completed')
  assert.equal(detail(cache).completedAt, completedAt)
  cache.clear()
})

test('successful save refreshes an observed roadmap to InProgress', async () => {
  const cache = client()
  const observer = new QueryObserver(cache, {
    queryKey: ['roadmap'], staleTime: Infinity,
    queryFn: async () => ({ status: saved.requirements.some((item) => item.isPrepared) ? 'InProgress' : 'NotStarted' }),
  })
  const unsubscribe = observer.subscribe(() => {})
  save = async (id, prepared) => {
    saved.requirements.find((item) => item.id === id)!.isPrepared = prepared
    return new Response(null, { status: 204 })
  }
  await mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: true })
  assert.deepEqual(cache.getQueryData(['roadmap']), { status: 'InProgress' })
  unsubscribe()
  cache.clear()
})

test('confirmed checkbox stays checked when its subsequent refresh fails', async () => {
  const cache = client()
  const observer = new QueryObserver(cache, {
    queryKey: ['roadmap-step', 1], staleTime: Infinity, retry: false,
    queryFn: async () => { throw new Error('Refresh failed') },
  })
  const unsubscribe = observer.subscribe(() => {})
  save = async () => new Response(null, { status: 204 })
  await mutation(cache).mutateAsync({ requirementId: 'a', isPrepared: true })
  assert.equal(cache.getQueryState(['roadmap-step', 1])?.status, 'error')
  assert.equal(cache.getQueryData<StepDetail>(['roadmap-step', 1])?.requirements[0].isPrepared, true)
  unsubscribe()
  cache.clear()
})
