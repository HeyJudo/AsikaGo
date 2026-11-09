import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement, isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer, type ViteDevServer } from 'vite'

let server: ViteDevServer
let mods: Record<string, any>

before(async () => {
  // supabase.ts throws at import without these; linkIdentity is stubbed below
  process.env.VITE_SUPABASE_URL ??= 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key'
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  const load = (p: string) => server.ssrLoadModule(p)
  mods = {
    supabase: (await load('/src/lib/supabase.ts')).supabase,
    AuthContext: (await load('/src/app/AuthProvider.tsx')).AuthContext,
    GuestBanner: (await load('/src/features/auth/GuestBanner.tsx')).GuestBanner,
    Roadmap: (await load('/src/features/roadmap/RoadmapPage.tsx')).RoadmapPage,
    Step: (await load('/src/features/roadmap/StepDetailPage.tsx')).StepDetailPage,
    Documents: (await load('/src/features/progress/DocumentsPage.tsx')).DocumentsPage,
  }
})
after(async () => { await server?.close() })

const req = (id: string) => ({ id, name: `Document ${id}`, description: null, appliesTo: null, source: null, isPrepared: id === 'a' })

function client() {
  const c = new QueryClient()
  c.setQueryData(['roadmap'], {
    roadmapId: 'r-1', createdAt: '2026-10-28T00:00:00Z', businessType: 'Sole Proprietorship',
    categoryName: 'Retail', cityName: 'Pasig', registrationStatus: 'Planning',
    completedSteps: 0, progressPercent: 0, nextStepNumber: 1,
    steps: [{ number: 1, stepId: 'step-1', name: 'Register business', agency: 'Agency', conditionNote: null, requirementCount: 2, preparedCount: 1, status: 'NotStarted' }],
  })
  c.setQueryData(['roadmap-step', 1], {
    number: 1, totalSteps: 2, stepId: 'step-1', name: 'Register business', agency: 'Agency',
    description: 'Register your business.', actions: ['Prepare documents'], conditionNote: null,
    previousNumber: null, nextNumber: 2, status: 'NotStarted', completedAt: null, requirements: [req('a'), req('b')],
  })
  c.setQueryData(['roadmap-documents'], {
    totalCount: 2, preparedCount: 1,
    steps: [{ number: 1, name: 'Register business', status: 'NotStarted', requirements: [req('a'), req('b')] }],
  })
  return c
}

function render(path: string, isAnonymous: boolean, element: ReactNode) {
  const user = { id: 'u-1', is_anonymous: isAnonymous }
  return renderToStaticMarkup(createElement(QueryClientProvider, { client: client() },
    createElement(mods.AuthContext.Provider, { value: { session: { user }, user, loading: false } },
      createElement(MemoryRouter, { initialEntries: [path] },
        createElement(Routes, null, createElement(Route, { path: '*', element }))))))
}

const pages = () => ({
  '/roadmap': createElement(mods.Roadmap),
  '/roadmap/documents': createElement(mods.Documents),
  '/roadmap/steps/1': createElement(Routes, null, createElement(Route, { path: 'roadmap/steps/:number', element: createElement(mods.Step) })),
})

const SHARED = /Save your progress with Google so you don&#x27;t lose it\.[\s\S]*Save with Google/

test('guests see the shared banner on step detail, between the back link and the step pill', () => {
  const html = render('/roadmap/steps/1', true, pages()['/roadmap/steps/1'])
  assert.match(html, /My roadmap[\s\S]*Save your progress with Google[\s\S]*Save with Google[\s\S]*Step 1 of 2/)
})

test('guests see the shared banner on All documents, above the title', () => {
  const html = render('/roadmap/documents', true, pages()['/roadmap/documents'])
  assert.match(html, /My roadmap[\s\S]*Save your progress with Google[\s\S]*All documents to bring/)
})

test('guests see the shared text on the roadmap', () => {
  const html = render('/roadmap', true, pages()['/roadmap'])
  assert.match(html, SHARED)
  assert.doesNotMatch(html, /This is your roadmap preview/)
})

test('Google users see no banner on any of the three pages', () => {
  for (const [path, element] of Object.entries(pages())) {
    const html = render(path, false, element)
    assert.match(html, /My roadmap|Your registration roadmap/, path)
    assert.doesNotMatch(html, /Save with Google/, path)
  }
})

test('Save with Google returns the guest to the page they were on', async () => {
  const calls: any[] = []
  mods.supabase.auth.linkIdentity = async (arg: unknown) => { calls.push(arg); return { data: {}, error: null } }
  const g = globalThis as any
  const realWindow = g.window
  g.window = { location: { origin: 'http://localhost:5173' } }
  try {
    let banner: ReactNode = null
    // SSR can't click: run the real banner's hooks inside Probe, then call its button's onClick.
    function Probe() { banner = mods.GuestBanner(); return banner }
    render('/roadmap/steps/3', true, createElement(Probe))
    const findClick = (n: any): (() => unknown) | undefined => {
      if (!isValidElement(n)) return Array.isArray(n) ? n.map(findClick).find(Boolean) : undefined
      const props = n.props as any
      return props.onClick ?? findClick(props.children)
    }
    await findClick(banner)!()
    assert.deepEqual(calls, [{ provider: 'google', options: { redirectTo: 'http://localhost:5173/roadmap/steps/3' } }])
  } finally {
    g.window = realWindow
  }
})
