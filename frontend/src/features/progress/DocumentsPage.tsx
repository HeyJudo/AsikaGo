import { useId } from 'react'
import { Link } from 'react-router'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Tag, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Centered, FullPageError, FullPageLoader } from '@/components/PageStates'
import { NoProfileState } from '@/features/roadmap/RoadmapPage'
import { GuestBanner } from '@/features/auth/GuestBanner'
import { type Requirement, useDocuments, useSetRequirementPrepared } from '@/lib/queries'

function EmptyIllustration() {
  return (
    <svg className="h-auto w-64 max-w-full drop-shadow-sm" viewBox="0 0 260 150" aria-hidden="true">
      <rect x="4" y="4" width="252" height="142" rx="18" fill="#fff" stroke="var(--border)" />
      <path
        d="M36 112 C 84 112, 92 52, 140 56 S 196 40, 222 38"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
        opacity=".5"
      />
      <circle cx="36" cy="112" r="14" fill="var(--navy)" />
      <text x="36" y="117" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">A</text>
      <rect x="200" y="24" width="44" height="28" rx="14" fill="var(--brand)" />
      <text x="222" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">Biz</text>
      <ellipse cx="130" cy="106" rx="26" ry="3.5" fill="var(--navy)" opacity=".15" />
      <rect x="108" y="45" width="44" height="54" rx="7" fill="#fff" stroke="var(--navy)" strokeWidth="2.5" />
      <rect x="120" y="39" width="20" height="10" rx="3" fill="var(--navy)" />
      <text x="130" y="85" textAnchor="middle" fontSize="30" fontWeight="800" fill="var(--brand)">?</text>
    </svg>
  )
}

function RequirementRow({ req }: { req: Requirement }) {
  const { mutate, isError } = useSetRequirementPrepared(req.id)
  const errorId = useId()

  return (
    <li className="border-border border-t py-1 first:border-t-0 first:pt-0 last:pb-0">
      <label className="hover:bg-brand/5 -ml-2.5 flex min-h-11 cursor-pointer gap-0.5 rounded-lg">
        <span className="relative grid shrink-0 place-items-center self-start">
          <input
            type="checkbox"
            checked={req.isPrepared}
            onChange={(e) => mutate(e.target.checked)}
            aria-describedby={isError ? errorId : undefined}
            className="peer border-brand checked:bg-brand focus-visible:ring-brand m-2.5 size-6 cursor-pointer appearance-none rounded-md border-2 bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <Check
            className="pointer-events-none absolute size-4 text-white opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1 py-2.5">
          <span className="text-navy block font-semibold leading-snug break-words">{req.name}</span>
          {req.appliesTo && (
            <span className="bg-brand/10 text-brand mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <Tag className="size-3" aria-hidden="true" />
              For {req.appliesTo} businesses
            </span>
          )}
        </span>
      </label>
      {isError && (
        <Alert variant="destructive" id={errorId} className="mb-2 ml-9 w-auto">
          <AlertCircle className="size-4" />
          <AlertDescription>We couldn't save this. Check your connection and try again.</AlertDescription>
        </Alert>
      )}
    </li>
  )
}

export function DocumentsPage() {
  const { data: docs, isPending, isError, refetch } = useDocuments()

  if (isPending) {
    return <FullPageLoader label="Finding your documents…" />
  }

  if (isError) {
    return <FullPageError onRetry={() => void refetch()} />
  }

  if (!docs) {
    return <NoProfileState />
  }

  const total = Number(docs.totalCount)
  const prepared = Number(docs.preparedCount)

  if (total === 0) {
    return (
      <Centered>
        <EmptyIllustration />
        <h1 className="text-navy text-xl font-bold">Nothing to bring yet.</h1>
        <Button asChild className="h-11 rounded-full px-6 font-semibold">
          <Link to="/roadmap">Back to my roadmap</Link>
        </Button>
      </Centered>
    )
  }

  return (
    <div className="bg-cream min-h-[calc(100svh-4rem)] px-6 py-4 md:px-8 md:py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link
          to="/roadmap"
          className="text-brand hover:bg-brand/10 -ml-2 inline-flex min-h-[44px] items-center gap-1.5 self-start rounded-full px-2 text-sm font-semibold"
        >
          <ArrowLeft className="size-4.5" />
          My roadmap
        </Link>

        <GuestBanner />

        <div>
          <h1 className="text-navy text-3xl font-extrabold break-words md:text-4xl">All documents to bring</h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">Tick each one when you have it ready.</p>
        </div>

        <section className="rounded-xl border bg-white p-4 shadow-xs md:px-6 md:py-5">
          <b className="text-navy mb-2.5 block font-bold">{prepared} of {total} ready</b>
          <div
            className="bg-cream-deep h-3 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Documents ready"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={prepared}
            aria-valuetext={`${prepared} of ${total} documents ready`}
          >
            <div
              className="bg-gold h-full rounded-full transition-[width]"
              style={{ width: `${(prepared / total) * 100}%` }}
            />
          </div>
          <p className="text-navy mt-2.5 flex items-center gap-1.5 text-sm font-semibold">
            <TriangleAlert className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
            Some items may not apply to you.
          </p>
        </section>

        {docs.steps.map((step) => {
          const num = Number(step.number)
          const ready = step.requirements.filter((r) => r.isPrepared).length
          return (
            <section key={num} className="border-border rounded-2xl border bg-white p-4 shadow-sm md:p-6">
              <div className="mb-2 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="bg-gold text-navy inline-block rounded-full px-2.5 py-0.5 text-xs font-bold">
                    Step {num}
                  </span>
                  <h2 className="text-navy mt-3 mb-1.5 text-lg font-bold leading-snug break-words">{step.name}</h2>
                  {step.status === 'Completed' && (
                    <span className="bg-gold text-navy inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                      Done
                    </span>
                  )}
                  {step.status === 'InProgress' && (
                    <span className="bg-brand/10 text-brand inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold">
                      <span className="border-brand/25 border-t-brand border-r-brand size-3 rotate-45 rounded-full border-2" aria-hidden="true" />
                      In progress
                    </span>
                  )}
                </div>
                <span className="text-brand shrink-0 pt-0.5 text-sm font-bold whitespace-nowrap">
                  {ready} of {step.requirements.length} ready
                </span>
              </div>
              <ul className="flex list-none flex-col">
                {step.requirements.map((req) => (
                  <RequirementRow key={req.id} req={req} />
                ))}
              </ul>
              <Link
                to={`/roadmap/steps/${num}`}
                className="bg-brand hover:bg-brand-dark focus-visible:ring-brand mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 font-semibold text-white shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 active:scale-95 motion-reduce:transition-none"
              >
                Open step {num}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
          )
        })}
      </div>
    </div>
  )
}
