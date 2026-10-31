import { Link, useParams } from 'react-router'
import { useIsMutating } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  ClipboardList,
  ExternalLink,
  Info,
  ListChecks,
  LoaderCircle,
  MapPin,
  Tag,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FullPageError, FullPageLoader } from '@/components/PageStates'
import { StepNotFound } from '@/features/roadmap/StepNotFound'
import { type Requirement, useRoadmapStep, useUpdateRequirement, useUpdateStepStatus } from '@/lib/queries'

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

function RequirementItem({ req, stepNumber }: { req: Requirement; stepNumber: number }) {
  const { mutate, isError } = useUpdateRequirement(stepNumber)
  const isPending = useIsMutating({
    mutationKey: ['prepare-requirement', stepNumber],
    predicate: (mutation) => (mutation.state.variables as { requirementId: string }).requirementId === req.id,
  }) > 0
  const errorId = `requirement-${req.id}-error`

  return (
    <li className="border-border min-w-0 border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <label className="hover:bg-brand/5 -ml-2.5 flex min-h-11 cursor-pointer gap-0.5 rounded-lg">
        <span className="relative shrink-0 self-start">
          <input
            type="checkbox"
            className="border-brand checked:bg-brand focus-visible:outline-brand m-2.5 size-6 appearance-none rounded-md border-2 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait"
            checked={req.isPrepared}
            disabled={isPending}
            aria-describedby={isError ? errorId : undefined}
            onChange={(event) => mutate({ requirementId: req.id, isPrepared: event.target.checked })}
          />
          {req.isPrepared && <Check className="pointer-events-none absolute left-3 top-3 size-5 text-white" strokeWidth={3} aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1 py-2.5">
          <span className="text-navy block break-words font-semibold leading-snug">{req.name}</span>
          {req.description && (
            <span className="text-muted-foreground mt-0.5 block break-words text-sm leading-normal">
              {req.description}
            </span>
          )}
          {req.appliesTo && (
            <span className="bg-brand/10 text-brand mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <Tag className="size-3" aria-hidden="true" />
              For {req.appliesTo} businesses
            </span>
          )}
        </span>
      </label>
      {req.source && (
        <a
          href={req.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:text-brand-dark -mb-3 ml-9 block min-h-[44px] break-words py-2 text-xs font-medium leading-tight underline underline-offset-2 md:text-sm"
        >
          Source: {req.source.name} (checked {formatDate(req.source.dateVerified)})
          <ExternalLink className="ml-1 inline size-3.5 align-sub" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {isError && (
        <Alert id={errorId} variant="destructive" className="ml-9 mt-3 w-auto">
          <AlertCircle className="size-4" />
          <AlertDescription>We couldn't save this. Check your connection and try again.</AlertDescription>
        </Alert>
      )}
    </li>
  )
}

export function StepDetailPage() {
  const { number } = useParams<{ number: string }>()
  const stepNumber = Number(number)

  if (!Number.isInteger(stepNumber) || stepNumber < 1) {
    return <StepNotFound />
  }

  return <StepDetailContent key={stepNumber} number={stepNumber} />
}

function StepDetailContent({ number }: { number: number }) {
  const { data: step, isLoading, isError, refetch } = useRoadmapStep(number)
  const { mutate: updateStatus, isPending, isError: saveError } = useUpdateStepStatus(number)

  if (isLoading) {
    return <FullPageLoader label="Finding your step…" />
  }

  if (isError) {
    return <FullPageError onRetry={refetch} />
  }

  if (!step) {
    return <StepNotFound />
  }

  const done = step.status === 'Completed'
  const preparedCount = step.requirements.filter((req) => req.isPrepared).length

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
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gold text-navy inline-block rounded-full px-3 py-0.5 text-sm font-bold">
              Step {step.number} of {step.totalSteps}
            </span>
            {done && (
              <span className="bg-gold text-navy inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                Done
              </span>
            )}
            {step.status === 'InProgress' && (
              <span className="bg-brand/10 text-brand inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold">
                <span className="border-brand size-2 rounded-full border-2 border-r-transparent" aria-hidden="true" />
                In progress · {preparedCount} of {step.requirements.length} ready
              </span>
            )}
          </div>
          <h1 className="text-navy mt-2 break-words text-3xl font-extrabold md:text-4xl">
            {step.name}
          </h1>
        </div>

        {/* Done-box: shown when the step is completed */}
        {done && (
          <div
            role="status"
            className="border-gold/70 bg-gold/20 flex flex-col items-start gap-3 rounded-2xl border p-3.5 font-semibold leading-relaxed text-navy md:flex-row md:items-center md:justify-between md:p-4"
          >
            <p className="flex items-center gap-2.5">
              <span className="bg-gold grid size-8 shrink-0 place-items-center rounded-full">
                <Check className="text-navy size-4.5" strokeWidth={3} aria-hidden="true" />
              </span>
              You marked this step as done{step.completedAt ? ` on ${formatDate(step.completedAt)}` : ''}.
            </p>
            <Button
              variant="outline"
              className="border-brand text-brand hover:bg-brand/5 h-11 shrink-0 rounded-full bg-white px-6 font-semibold"
              disabled={isPending}
              onClick={() => updateStatus(false)}
            >
              Mark as not done
            </Button>
          </div>
        )}
        {done && saveError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>We couldn't save this. Check your connection and try again.</AlertDescription>
          </Alert>
        )}

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
            <span className="text-brand ml-auto whitespace-nowrap text-sm font-medium">
              {preparedCount} of {step.requirements.length} ready
            </span>
          </h2>
          {sortedRequirements.length === 0 && (
            <p className="text-muted-foreground">Nothing to bring for this step.</p>
          )}
          {sortedRequirements.some((req) => req.appliesTo) && (
            <p className="text-muted-foreground mb-3 text-sm">
              Some items only apply to certain businesses. Labels show which businesses each item applies to.
            </p>
          )}
          <ul className="flex flex-col list-none">
            {sortedRequirements.map((req) => (
              <RequirementItem key={req.id} req={req} stepNumber={number} />
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

        {/* Mark-done card: shown only when the step is not completed */}
        {!done && (
          <section className="border-border rounded-2xl border bg-white p-4 shadow-sm md:p-6">
            <h2 className="text-navy mb-2 flex items-center gap-2.5 text-lg font-bold">
              <CircleCheck className="text-brand size-5" />
              Done with this step?
            </h2>
            <p className="text-navy mb-3 leading-relaxed">Mark it as done after you finish at the office.</p>
            <Button
              className="bg-brand hover:bg-brand-dark h-11 w-full rounded-full px-6 font-semibold text-white md:w-auto"
              disabled={isPending}
              aria-busy={isPending}
              onClick={() => updateStatus(true)}
            >
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  Mark this step as done
                </>
              )}
            </Button>
            {saveError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="size-4" />
                <AlertDescription>We couldn't save this. Check your connection and try again.</AlertDescription>
              </Alert>
            )}
          </section>
        )}

        <nav
          className="mt-2 flex flex-col gap-3 md:flex-row-reverse md:justify-between"
          aria-label="Steps"
        >
          {step.nextNumber ? (
            <Button
              asChild
              className={done
                ? 'bg-brand hover:bg-brand-dark h-11 rounded-full px-6 font-semibold text-white'
                : 'border-brand text-brand hover:bg-brand/5 h-11 rounded-full border bg-white px-6 font-semibold'
              }
              variant={done ? 'default' : 'outline'}
            >
              <Link to={`/roadmap/steps/${step.nextNumber}`}>
                See step {step.nextNumber}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className={done
                ? 'bg-brand hover:bg-brand-dark h-11 rounded-full px-6 font-semibold text-white'
                : 'border-brand text-brand hover:bg-brand/5 h-11 rounded-full border bg-white px-6 font-semibold'
              }
              variant={done ? 'default' : 'outline'}
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
