import { Building2, Clock, ExternalLink, Globe, Mail, MapPin, Phone, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StepDetail } from '@/lib/queries'

function phoneHref(phone: string) {
  const [number, extension] = phone.split(/\s+local\s+/i)
  const digits = number.replace(/\D/g, '')
  const international = number.trim().startsWith('+') || /^63\d{9,10}$/.test(digits)
  return `tel:${international ? '+' : ''}${digits}${extension ? `,${extension.replace(/\D/g, '')}` : ''}`
}

export function WhereToGo({ offices, agency }: Pick<StepDetail, 'offices' | 'agency'>) {
  return (
    <section className="border-brand/40 rounded-2xl border bg-[#edf0fc] p-4 md:p-6">
      <h2 className="text-navy mb-3 flex items-center gap-2.5 text-lg font-bold">
        <MapPin className="text-brand size-5 shrink-0" aria-hidden="true" />
        Where to go
        {offices.length > 1 && (
          <span className="text-brand ml-auto text-sm font-medium">{offices.length} offices</span>
        )}
      </h2>
      {offices.length === 0 ? (
        <div className="flex items-center gap-3">
          <span className="bg-brand grid size-11 shrink-0 place-items-center rounded-full text-white">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <p className="text-navy break-words text-lg font-bold leading-snug">{agency}</p>
        </div>
      ) : (
        <div className={`grid gap-3 ${offices.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {offices.map((office, index) => {
            const online = office.access === 'Online'
            const Icon = online ? Globe : Building2
            return (
              <article key={index} className="border-brand/15 min-w-0 rounded-2xl border bg-white p-3.5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${online ? 'bg-gold text-navy' : 'bg-brand text-white'}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-navy break-words font-bold leading-snug">{office.name}</h3>
                    <span className="bg-cream-deep text-navy mt-1.5 inline-block rounded-full px-2.5 py-1 text-xs font-bold">
                      {online ? 'Online' : 'In person'}
                    </span>
                  </div>
                </div>
                {!office.isVerified && (
                  <p role="note" className="border-gold/70 bg-gold/20 text-navy mt-3 flex gap-2 rounded-xl border p-2.5 text-sm font-medium">
                    <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
                    Confirm before you go.
                  </p>
                )}
                <div className="text-navy mt-3 flex flex-col gap-1 text-sm">
                  {office.address && (
                    <p className="flex gap-2 py-1">
                      <MapPin className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words">{office.address}</span>
                    </p>
                  )}
                  {office.hours && (
                    <p className="flex gap-2 py-1">
                      <Clock className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words">{office.hours}</span>
                    </p>
                  )}
                  {office.phone?.split(';').map((phone) => phone.trim()).filter(Boolean).map((phone, phoneIndex) => (
                    <a key={phoneIndex} href={phoneHref(phone)} className="text-brand flex min-h-11 items-center gap-2 rounded-md py-2 underline underline-offset-2">
                      <Phone className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words">{phone}</span>
                    </a>
                  ))}
                  {office.email && (
                    <a href={`mailto:${office.email}`} className="text-brand flex min-h-11 items-center gap-2 rounded-md py-2 underline underline-offset-2">
                      <Mail className="size-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words">{office.email.split('@')[0]}@<wbr />{office.email.split('@')[1]}</span>
                    </a>
                  )}
                </div>
                {office.website && (
                  <Button asChild variant={online ? 'default' : 'outline'} className={`mt-3 h-auto min-h-11 w-full rounded-full px-3 py-2 whitespace-normal ${online ? 'bg-brand text-white hover:bg-brand-dark' : 'border-brand text-brand hover:bg-brand/5'}`}>
                    <a href={office.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="size-4" aria-hidden="true" />
                      Go to the website
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </Button>
                )}
                {office.mapsUrl && (
                  <Button asChild variant="outline" className="border-brand text-brand hover:bg-brand/5 mt-3 h-auto min-h-11 w-full rounded-full px-3 py-2 whitespace-normal">
                    <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Open in Google Maps
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </Button>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
