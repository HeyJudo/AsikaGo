import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer, type ViteDevServer } from 'vite'
import type { Documents } from '../src/lib/queries.ts'

let server: ViteDevServer
let setPrepared: typeof import('../src/lib/queries.ts').setPrepared
let Page: typeof import('../src/features/progress/DocumentsPage.tsx').DocumentsPage

before(async () => {
  // supabase.ts throws at import without these; these tests never call Supabase
  process.env.VITE_SUPABASE_URL ??= 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key'
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  setPrepared = (await server.ssrLoadModule('/src/lib/queries.ts')).setPrepared
  Page = (await server.ssrLoadModule('/src/features/progress/DocumentsPage.tsx')).DocumentsPage
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

// undefined = nothing cached yet (loading), Error = the query failed
function renderPage(data: Documents | null | undefined | Error) {
  // Without retryOnMount: false, an errored query with no data mounts as pending (refetching).
  const client = new QueryClient({ defaultOptions: { queries: { retryOnMount: false } } })
  if (data instanceof Error) {
    client.getQueryCache().build(client, { queryKey: ['roadmap-documents'] }).setState({ status: 'error', error: data })
  } else if (data !== undefined) {
    client.setQueryData(['roadmap-documents'], data)
  }
  return renderToStaticMarkup(createElement(QueryClientProvider, { client },
    createElement(MemoryRouter, null, createElement(Page))))
}

test('documents are grouped by step with counts, checkboxes, and step links', () => {
  const html = renderPage(docs)
  assert.match(html, /All documents to bring/)
  assert.match(html, /Tick each one when you have it ready\./)
  assert.match(html, /role="progressbar" aria-label="Documents ready" aria-valuemin="0" aria-valuemax="4" aria-valuenow="2" aria-valuetext="2 of 4 documents ready"/)
  assert.match(html, /2 of 4 ready/)
  assert.match(html, /Step 1<\/span>[\s\S]*DTI Business Name Registration[\s\S]*Step 2<\/span>[\s\S]*Barangay Business Clearance/)
  assert.equal((html.match(/>Done</g) ?? []).length, 1)
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 4)
  assert.equal((html.match(/checked=""/g) ?? []).length, 2)
  assert.equal((html.match(/1 of 2 ready/g) ?? []).length, 2)
  assert.match(html, /href="\/roadmap\/steps\/2"[^>]*>Open step 2/)
  assert.match(html, /href="\/roadmap"/)
})

test('counts sent as strings render the same', () => {
  const html = renderPage({ ...docs, totalCount: '4', preparedCount: '2', steps: docs.steps.map(s => ({ ...s, number: String(s.number) })) })
  assert.match(html, /aria-valuetext="2 of 4 documents ready"/)
  assert.match(html, /href="\/roadmap\/steps\/2"[^>]*>Open step 2/)
})

test('a roadmap with no documents shows the empty state', () => {
  const html = renderPage({ totalCount: 0, preparedCount: 0, steps: [] })
  assert.match(html, /Nothing to bring yet\./)
  assert.match(html, /href="\/roadmap"[^>]*>Back to my roadmap/)
  assert.doesNotMatch(html, /role="progressbar"/)
})

test('no business profile sends the user to the questions', () => {
  const html = renderPage(null)
  assert.match(html, /Answer a few questions first/)
  assert.match(html, /href="\/assessment"/)
})

test('loading and error use the shared page states', () => {
  assert.match(renderPage(undefined), /Finding your documents…/)
  assert.match(renderPage(new Error('offline')), /Something went wrong\./)
})

test('the roadmap links to All documents with the summed ready count', async () => {
  const Roadmap = (await server.ssrLoadModule('/src/features/roadmap/RoadmapPage.tsx')).RoadmapPage
  const Auth = (await server.ssrLoadModule('/src/app/AuthProvider.tsx')).AuthProvider
  const client = new QueryClient()
  client.setQueryData(['roadmap'], {
    roadmapId: 'r-1', createdAt: '2026-10-28T00:00:00Z', businessType: 'Sole Proprietorship',
    categoryName: 'Retail', cityName: 'Pasig', registrationStatus: 'Planning',
    completedSteps: 0, progressPercent: 0, nextStepNumber: 1,
    steps: [[1, 2], ['0', '1'], [2, '3']].map(([preparedCount, requirementCount], i) => ({
      number: i + 1, stepId: `step-${i + 1}`, name: `Step name ${i + 1}`, agency: 'Agency', conditionNote: null,
      requirementCount, preparedCount, status: 'NotStarted',
    })),
  })
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client },
    createElement(Auth, null, createElement(MemoryRouter, null, createElement(Roadmap)))))
  assert.match(html, /href="\/roadmap\/documents"[^>]*>[\s\S]*See all documents to bring[\s\S]*\(3 of 6 ready\)/)
})
