import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer, type ViteDevServer } from 'vite'
import type { RoadmapResponse } from '../src/lib/queries.ts'

let server: ViteDevServer
let Panel: typeof import('../src/features/assessment/MyBusinessRouteProgress.tsx').MyBusinessRouteProgress
let Page: typeof import('../src/features/assessment/MyBusinessPage.tsx').MyBusinessPage
let Auth: typeof import('../src/app/AuthProvider.tsx').AuthProvider

before(async () => {
  // supabase.ts throws at import without these; the page test never calls Supabase
  process.env.VITE_SUPABASE_URL ??= 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key'
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  Panel = (await server.ssrLoadModule('/src/features/assessment/MyBusinessRouteProgress.tsx')).MyBusinessRouteProgress
  Page = (await server.ssrLoadModule('/src/features/assessment/MyBusinessPage.tsx')).MyBusinessPage
  Auth = (await server.ssrLoadModule('/src/app/AuthProvider.tsx')).AuthProvider
})
after(async () => { await server?.close() })

const roadmap: RoadmapResponse = {
  roadmapId: 'test-roadmap', createdAt: '2026-10-28T00:00:00Z',
  businessType: 'Sole Proprietorship', categoryName: 'Retail', cityName: 'Pasig', registrationStatus: 'Planning',
  completedSteps: 1, progressPercent: 33, nextStepNumber: 2,
  steps: ['Register business name', 'Apply for a business permit with a long name', 'Register for taxes'].map((name, i) => ({
    number: i + 1, stepId: `step-${i + 1}`, name, agency: 'Agency', conditionNote: null,
    requirementCount: 1, preparedCount: 0, status: i === 0 ? 'Completed' : 'NotStarted',
  })),
}

function render(data: RoadmapResponse | null | undefined, isPending = false, isError = false, isFetching = false) {
  return renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(Panel, { roadmap: data, isPending, isError, isFetching, onRetry: () => {} }),
  ))
}

test('progress uses API values, accessible counts, and the next step name and destination', () => {
  const html = render(roadmap)
  assert.match(html, />33%<\/p>/)
  assert.match(html, /role="progressbar" aria-label="Steps done" aria-valuemin="0" aria-valuemax="3" aria-valuenow="1" aria-valuetext="1 of 3 steps done"/)
  assert.match(html, /width:33%/)
  assert.match(html, /href="\/roadmap\/steps\/2"/)
  assert.match(html, /Next: Step 2 · Apply for a business permit with a long name/)
  assert.doesNotMatch(html, /You&#x27;re here/)
})

test('next step lookup accepts numeric strings from the API', () => {
  const html = render({ ...roadmap, completedSteps: '1', progressPercent: '33', nextStepNumber: '2' })
  assert.match(html, /Next: Step 2 · Apply for a business permit with a long name/)
  const stringSteps = roadmap.steps.map(step => ({ ...step, number: String(step.number) }))
  assert.match(render({ ...roadmap, steps: stringSteps }), /Next: Step 2 · Apply for a business permit with a long name/)
})

test('zero completed steps still show progress and the first step', () => {
  const html = render({ ...roadmap, completedSteps: 0, progressPercent: 0, nextStepNumber: 1 })
  assert.match(html, />0%<\/p>/)
  assert.match(html, /0 of 3 steps done/)
  assert.match(html, /href="\/roadmap\/steps\/1"/)
})

test('all done shows full progress, roadmap link, and checked Biz dot', () => {
  const html = render({ ...roadmap, completedSteps: 3, progressPercent: 100, nextStepNumber: null })
  assert.match(html, />100%<\/p>/)
  assert.match(html, /All 3 steps done\./)
  assert.match(html, /href="\/roadmap"/)
  assert.match(html, /See my roadmap/)
  assert.equal((html.match(/lucide-check/g) ?? []).length, 2)
  assert.doesNotMatch(html, /\/roadmap\/steps\/null/)
})

test('absent or empty roadmaps retain the roadmap link and do not mark Biz done', () => {
  for (const data of [null, { ...roadmap, steps: [], nextStepNumber: null }]) {
    const html = render(data)
    assert.match(html, /href="\/roadmap"/)
    assert.match(html, /Your roadmap/)
    assert.doesNotMatch(html, /role="progressbar"|All 0 steps done/)
    assert.equal((html.match(/lucide-check/g) ?? []).length, 1)
  }
})

test('initial loading and errors stay inside the panel and retain other route stops', () => {
  const loading = render(undefined, true)
  assert.match(loading, /role="status"[^>]*>Loading your progress…/)
  assert.match(loading, /Profile saved/)
  assert.match(loading, /Your destination/)
  assert.doesNotMatch(loading, /href="\/roadmap"|role="progressbar"/)
  const error = render(undefined, false, true)
  assert.match(error, /role="alert"[^>]*>We couldn&#x27;t load your progress/)
  assert.match(error, /<button type="button"[^>]*>Try again<\/button>/)
  assert.match(error, /Profile saved/)
})

test('cached progress survives background refresh and refresh failure', () => {
  const html = render(roadmap, false, true)
  assert.match(html, />33%<\/p>/)
  assert.match(html, /href="\/roadmap\/steps\/2"/)
  assert.match(html, /role="alert"[^>]*>We couldn&#x27;t refresh your progress/)
  assert.match(html, /Try again/)
  assert.doesNotMatch(render(roadmap), /Loading your progress|Try again/)
  assert.match(render(null, false, true), /Your roadmap/)
})

test('unknown next step falls back to the roadmap link without marking Biz done', () => {
  const html = render({ ...roadmap, nextStepNumber: 7 })
  assert.match(html, />33%<\/p>/)
  assert.match(html, /1 of 3 steps done/)
  assert.match(html, /href="\/roadmap"/)
  assert.match(html, /See my roadmap/)
  assert.doesNotMatch(html, /\/roadmap\/steps\/7|Next: Step|All 3 steps done/)
  assert.equal((html.match(/lucide-check/g) ?? []).length, 1)
})

test('retry is disabled and relabelled while a failed query refetches', () => {
  const html = render(roadmap, false, true, true)
  assert.match(html, /<button type="button" disabled=""[^>]*>Trying again…<\/button>/)
  assert.match(html, /min-h-11/)
  assert.match(render(roadmap, false, true, false), /<button type="button"(?![^>]*disabled)[^>]*>Try again<\/button>/)
})

test('MyBusinessPage passes cached roadmap data to the panel', () => {
  const client = new QueryClient()
  client.setQueryData(['business-profile'], {
    id: 'bp-1', businessName: 'Test Store', businessType: 'Sole Proprietorship', categoryId: 'cat-1', categoryName: 'Retail',
    cityId: 'city-1', cityName: 'Pasig', registrationStatus: 'Planning', createdAt: '2026-10-28T00:00:00Z',
  })
  client.setQueryData(['roadmap'], roadmap)
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client },
    createElement(Auth, null, createElement(MemoryRouter, null, createElement(Page)))))
  assert.match(html, />33%<\/p>/)
  assert.match(html, /Next: Step 2 · Apply for a business permit with a long name/)
  assert.doesNotMatch(html, /Loading your progress/)
})
