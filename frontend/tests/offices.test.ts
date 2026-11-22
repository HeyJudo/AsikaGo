import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer, type ViteDevServer } from 'vite'
import type { StepDetail } from '../src/lib/queries.ts'

let server: ViteDevServer
let WhereToGo: typeof import('../src/features/roadmap/WhereToGo.tsx').WhereToGo

before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null, ws: false } })
  WhereToGo = (await server.ssrLoadModule('/src/features/roadmap/WhereToGo.tsx')).WhereToGo
})
after(async () => { await server?.close() })

const office: StepDetail['offices'][number] = {
  name: 'BPLD, Annex 1', access: 'InPerson',
  address: '3rd Floor, Ayala Malls The 30th, Meralco Ave., Pasig City',
  website: null, hours: 'Mon-Fri, 8:00 AM-6:00 PM',
  phone: '(02) 8643-1111 local 1158; (02) 8643-1111 local 1222',
  email: 'bpld.annex1@pasigcity.gov.ph', mapsUrl: 'https://maps.app.goo.gl/57Xn2rwdErBwe13X8',
  isVerified: true,
}
const render = (offices: StepDetail['offices']) => renderToStaticMarkup(createElement(WhereToGo, { offices, agency: 'Fallback agency' }))

test('in-person offices show contacts and separate dialable extensions', () => {
  const html = render([office])
  for (const text of [office.name, office.address!, office.hours!, 'In person', 'Open in Google Maps']) {
    assert.ok(html.includes(text))
  }
  assert.match(html, /href="tel:0286431111,1158"/)
  assert.match(html, /href="tel:0286431111,1222"/)
  assert.match(html, /href="mailto:bpld\.annex1@pasigcity\.gov\.ph"/)
  assert.match(html, /bpld\.annex1@<wbr\/>pasigcity\.gov\.ph/)
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\/57Xn2rwdErBwe13X8" target="_blank" rel="noopener noreferrer"/)
  assert.match(html, /opens in a new tab/)
  assert.doesNotMatch(html, /Confirm before you go|md:grid-cols-2|Fallback agency/)
})

test('online offices show their website and all five DTI phone links', () => {
  const html = render([{
    ...office, name: 'DTI', access: 'Online', address: null, hours: null, mapsUrl: null,
    website: 'https://bnrs.dti.gov.ph/registration/create',
    phone: '1-384; (632) 7751-0384; (632) 7791-3100; Mobile 0917-845-7104; 0917-863-0669',
  }])
  assert.match(html, />Online</)
  assert.match(html, /href="https:\/\/bnrs\.dti\.gov\.ph\/registration\/create" target="_blank" rel="noopener noreferrer"/)
  assert.match(html, /Go to the website/)
  assert.deepEqual([...html.matchAll(/href="(tel:[^"]+)"/g)].map(m => m[1]), [
    'tel:1384', 'tel:+63277510384', 'tel:+63277913100', 'tel:09178457104', 'tel:09178630669',
  ])
  assert.doesNotMatch(html, /Open in Google Maps|Mon-Fri|N\/A/)
})

test('unverified offices show the warning and hide absent fields', () => {
  const html = render([{
    ...office, name: 'Barangay hall', isVerified: false,
    phone: null, email: null, mapsUrl: null,
  }])
  assert.match(html, /role="note"/)
  assert.match(html, /Confirm before you go\./)
  assert.match(html, /Barangay hall/)
  assert.doesNotMatch(html, /href=|N\/A/)
})

test('access does not hide supplied fields; explicit international numbers keep their plus', () => {
  const html = render([{ ...office, access: 'Online', phone: '+63 2 8643 1111 local 1158' }])
  assert.ok(html.includes(office.address!))
  assert.match(html, /Open in Google Maps/)
  assert.match(html, /href="tel:\+63286431111,1158"/)
})

test('multiple offices retain API order and avoid calling different agencies interchangeable', () => {
  const html = render([office, { ...office, name: 'City Health Department' }])
  assert.equal((html.match(/<article /g) ?? []).length, 2)
  assert.match(html, /2 offices/)
  assert.match(html, /md:grid-cols-2/)
  assert.ok(html.indexOf(office.name) < html.indexOf('City Health Department'))
  assert.doesNotMatch(html, /Go to any one/)
})

test('no offices keeps the agency fallback', () => {
  const html = render([])
  assert.match(html, /Where to go/)
  assert.match(html, /Fallback agency/)
  assert.doesNotMatch(html, /<article|href=|N\/A/)
})
