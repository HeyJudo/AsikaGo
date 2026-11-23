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

test('in-person offices with an address get a Show map button, and no map loads before it is tapped', () => {
  const html = render([office])
  assert.match(html, /Show map/)
  assert.match(html, /aria-expanded="false"/)
  // The controlled region exists (aria-controls target) but stays hidden and empty
  assert.match(html, /<div id="[^"]+" hidden=""[^>]*><\/div>/)
  assert.doesNotMatch(html, /<iframe/)
})

test('online offices and in-person offices without a maps link get no map', () => {
  assert.doesNotMatch(render([{ ...office, access: 'Online' }]), /Show map/)
  assert.doesNotMatch(render([{ ...office, address: 'The barangay where the business is located', mapsUrl: null }]), /Show map/)
  assert.doesNotMatch(render([{ ...office, address: null }]), /Show map/)
})

test('the embed URL keeps the whole address in one q parameter and adds the city only when missing', async () => {
  const { mapEmbedUrl } = await server.ssrLoadModule('/src/features/roadmap/WhereToGo.tsx')
  assert.equal(mapEmbedUrl('A & B #1, Pasig City'), 'https://www.google.com/maps?q=A%20%26%20B%20%231%2C%20Pasig%20City&output=embed')
  assert.equal(mapEmbedUrl('3rd Floor, Mutya ng Pasig Mega Market'),
    'https://www.google.com/maps?q=3rd%20Floor%2C%20Mutya%20ng%20Pasig%20Mega%20Market%2C%20Pasig%20City&output=embed')
})

test('the map frame is titled with the office name and its overlay opens mapsUrl, hidden from screen readers', async () => {
  const { MapFrame } = await server.ssrLoadModule('/src/features/roadmap/WhereToGo.tsx')
  const html = renderToStaticMarkup(createElement(MapFrame, { name: office.name, address: office.address!, mapsUrl: office.mapsUrl! }))
  assert.ok(html.includes('<iframe title="Map of BPLD, Annex 1" src="https://www.google.com/maps?q='))
  assert.ok(html.includes('<a href="https://maps.app.goo.gl/57Xn2rwdErBwe13X8" target="_blank" rel="noopener noreferrer" aria-hidden="true" tabindex="-1"'))
  assert.doesNotMatch(html, /referrerpolicy/i)
})
