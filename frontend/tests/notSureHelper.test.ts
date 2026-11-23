import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer, type ViteDevServer } from 'vite'

type Mod = typeof import('../src/features/assessment/NotSureHelper.tsx')
let server: ViteDevServer
let mod: Mod

before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  mod = (await server.ssrLoadModule('/src/features/assessment/NotSureHelper.tsx')) as Mod
})
after(async () => { await server?.close() })

const render = (answer: 'ask' | 'yes' | 'no') =>
  renderToStaticMarkup(createElement(mod.NotSureHelper, { answer, onAnswer: () => {} }))

test('Yes picks Sole Proprietorship', () => {
  assert.equal(mod.answerOwner('yes', ''), 'Sole Proprietorship')
  assert.equal(mod.answerOwner('yes', 'Partnership'), 'Sole Proprietorship')
})

test('No clears a one-owner type and keeps any other pick', () => {
  assert.equal(mod.answerOwner('no', 'Sole Proprietorship'), '')
  assert.equal(mod.answerOwner('no', 'One Person Corporation'), '')
  assert.equal(mod.answerOwner('no', 'Partnership'), 'Partnership')
  assert.equal(mod.answerOwner('no', ''), '')
})

test('picking a type closes the Yes panel and keeps No', () => {
  assert.equal(mod.helperAfterPick('yes'), null)
  assert.equal(mod.helperAfterPick('no'), 'no')
  assert.equal(mod.helperAfterPick(null), null)
})

test('question only, nothing answered yet', () => {
  const html = render('ask')
  for (const text of ['Ikaw lang ba ang', 'may-ari?', 'Are you the only owner?']) assert.ok(html.includes(text), text)
  assert.equal(html.match(/role="radio"/g)?.length, 2)
  assert.equal(html.match(/aria-checked="true"/g), null)
  assert.ok(!html.includes('Sole Proprietorship fits you'))
  // Live region exists before an answer, so screen readers announce the answer when it fills in
  assert.ok(html.includes('<div role="status"></div>'))
})

test('Yes shows the reason and the OPC line, with agencies spelled out', () => {
  const html = render('yes')
  for (const text of [
    'Sole Proprietorship fits you',
    'You own the business alone. You register your business name online with DTI (Department of Trade and Industry).',
    'Also for one owner:',
    'A One Person Corporation (OPC) also has one owner and registers with SEC (Securities and Exchange Commission).',
  ]) assert.ok(html.includes(text), text)
  assert.equal(html.match(/aria-checked="true"/g)?.length, 1)
  assert.ok(/aria-checked="true"[^>]*>.*?Yes/.test(html))
})

test('No shows Partnership and Corporation side by side', () => {
  const html = render('no')
  for (const text of [
    'Two or more people put in money or property and share the profits. You register it with SEC (Securities and Exchange Commission).',
    'The business counts as its own &quot;person&quot; under the law',
    'Choose one of them from the list above.',
  ]) assert.ok(html.includes(text), text)
  assert.ok(!html.includes('Sole Proprietorship fits you'))
})
