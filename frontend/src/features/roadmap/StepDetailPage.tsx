import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Info,
  ListChecks,
  MapPin,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FullPageError, FullPageLoader } from '@/components/PageStates'
import { StepNotFound } from '@/features/roadmap/StepNotFound'
import { type Requirement, useRoadmapStep } from '@/lib/queries'

function formatDate(iso: string): string {
  const dateStr = iso.includes('T') ? iso : `${iso}T00:00:00`
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isLineOfBusiness(req: Requirement): boolean {
  return req.name.startsWith('If your business')
}

export function StepDetailPage() {
  const { number } = useParams<{ number: string }>()
  const stepNumber = Number(number)

  if (!Number.isInteger(stepNumber) || stepNumber < 1) {
    return <StepNotFound />
  }

  return <StepDetailContent number={stepNumber} />
}

function StepDetailContent({ number }: { number: number }) {
  const { data: step, isLoading, isError, refetch } = useRoadmapStep(number)

  if (isLoading) {
    return <FullPageLoader label="Finding your step…" />
  }

  if (isError) {
    return <FullPageError onRetry={refetch} />
  }

  if (!step) {
    return <StepNotFound />
  }

  const sortedRequirements = [...step.requirements].sort(
    (a, b) => (isLineOfBusiness(a) ? 1 : 0) - (isLineOfBusiness(b) ? 1 : 0),
  )

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

        <div>
          <span className="bg-gold text-navy inline-block rounded-full px-3 py-0.5 text-sm font-bold">
            Step {step.number} of {step.totalSteps}
          </span>
          <h1 className="text-navy mt-2 break-words text-3xl font-extrabold md:text-4xl">
            {step.name}
          </h1>
        </div>

        {step.conditionNote && (
          <div
            className="border-gold/70 bg-gold/20 flex gap-2.5 rounded-2xl border p-3.5 font-medium leading-relaxed text-navy"
            role="note"
          >
            <Info className="text-brand mt-0.5 size-5 shrink-0" />
            <p>{step.conditionNote}</p>
          </div>
        )}

        <section className="border-border rounded-2xl border bg-white p-4 shadow-sm md:p-6">
          <h2 className="text-navy mb-3 flex items-center gap-2.5 text-lg font-bold">
            <Info className="text-brand size-5" />
            Why you need this
          </h2>
          <p className="leading-relaxed text-navy break-words">{step.description}</p>
        </section>

        <section className="border-border rounded-2xl border bg-white p-4 shadow-sm md:p-6">
          <h2 className="text-navy mb-3 flex items-center gap-2.5 text-lg font-bold">
            <ListChecks className="text-brand size-5" />
            What to do
          </h2>
          <ol className="flex flex-col gap-3 list-none">
            {step.actions.map((action, index) => (
              <li key={index} className="flex min-w-0 gap-3 leading-normal text-navy break-words">
                <span className="bg-brand grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-0.5">{action}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-brand rounded-2xl border-2 bg-white p-4 shadow-lg shadow-brand/15 md:p-6">
          <h2 className="text-navy mb-3 flex items-center gap-2.5 text-xl font-bold">
            <ClipboardList className="text-brand size-5" />
            What to bring
          </h2>
          {sortedRequirements.length === 0 && (
            <p className="text-muted-foreground">Nothing to bring for this step.</p>
          )}
          {sortedRequirements.some((req) => req.appliesTo) && (
            <p className="text-muted-foreground mb-3 text-sm">
              Some items only apply to certain businesses. The ones for yours are marked.
            </p>
          )}
          <ul className="flex flex-col list-none">
            {sortedRequirements.map((req, idx) => (
              <li
                key={req.id || idx}
                className="border-border flex min-w-0 gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
              >
                <span className="bg-brand/10 text-brand grid size-8 shrink-0 place-items-center rounded-lg">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-navy font-semibold leading-snug break-words">{req.name}</p>
                  {req.description && (
                    <p className="text-muted-foreground mt-0.5 text-sm leading-normal break-words">
                      {req.description}
                    </p>
                  )}
                  {req.appliesTo && (
                    <span className="bg-brand/10 text-brand mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                      <Tag className="size-3" />
                      For {req.appliesTo} businesses
                    </span>
                  )}
                  {req.source && (
                    <a
                      href={req.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:text-brand-dark -mb-3 block min-h-[44px] py-2 text-xs font-medium leading-tight underline underline-offset-2 md:text-sm break-words"
                    >
                      Source: {req.source.name} (checked {formatDate(req.source.dateVerified)})
                      <ExternalLink className="ml-1 inline size-3.5 align-sub" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-brand/40 rounded-2xl border bg-[#edf0fc] p-4 md:p-6">
          <h2 className="text-navy mb-3 flex items-center gap-2.5 text-lg font-bold">
            Where to go
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-brand grid size-11 shrink-0 place-items-center rounded-full text-white">
              <MapPin className="size-5" />
            </span>
            <p className="text-navy text-lg font-bold leading-snug">{step.agency}</p>
          </div>
        </section>

        <nav
          className="mt-2 flex flex-col gap-3 md:flex-row-reverse md:justify-between"
          aria-label="Steps"
        >
          {step.nextNumber ? (
            <Button
              asChild
              className="bg-brand hover:bg-brand-dark h-11 rounded-full px-6 font-semibold text-white"
            >
              <Link to={`/roadmap/steps/${step.nextNumber}`}>
                See step {step.nextNumber}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="bg-brand hover:bg-brand-dark h-11 rounded-full px-6 font-semibold text-white"
            >
              <Link to="/roadmap">Back to my roadmap</Link>
            </Button>
          )}

          {step.previousNumber && (
            <Button
              asChild
              variant="outline"
              className="border-brand text-brand hover:bg-brand/5 h-11 rounded-full bg-white px-6 font-semibold"
            >
              <Link to={`/roadmap/steps/${step.previousNumber}`}>
                <ArrowLeft className="mr-1 size-4" />
                Back to step {step.previousNumber}
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </div>
  )
}
