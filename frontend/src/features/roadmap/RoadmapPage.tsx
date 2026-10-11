import { useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check, ChevronRight, Flag, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Centered, FullPageError, FullPageLoader } from '@/components/PageStates'
import { useRoadmap } from '@/lib/queries'
import { RoadmapVisualizer } from '@/features/roadmap/RoadmapVisualizer'

function NoStartIllustration() {
  return (
    <svg className="h-auto w-64 max-w-full drop-shadow-sm" viewBox="0 0 260 150" aria-hidden="true">
      <rect x="4" y="4" width="252" height="142" rx="18" fill="#fff" stroke="var(--border)" />
      <g fill="none" stroke="var(--gold)" strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round">
        <path d="M52 112 Q 68 111 80 104" />
        <path d="M86 96 Q 94 88 100 78" transform="rotate(-24 93 87) translate(2 12)" />
        <path d="M160 54 Q 172 50 184 48" transform="rotate(-12 172 51) translate(0 -5)" />
        <path d="M192 45 Q 198 43 202 42" />
      </g>
      <g stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" opacity=".8">
        <path d="M88 122l7-3" />
        <path d="M104 112l4 6" />
        <path d="M168 74l6 3" />
        <path d="M186 66l3-6" />
      </g>
      <rect x="200" y="24" width="44" height="28" rx="14" fill="var(--brand)" />
      <text x="222" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">Biz</text>
      <ellipse cx="130" cy="92" rx="26" ry="3.5" fill="var(--navy)" opacity=".15" />
      <rect x="108" y="31" width="44" height="54" rx="7" fill="#fff" stroke="var(--navy)" strokeWidth="2.5" />
      <rect x="120" y="25" width="20" height="10" rx="3" fill="var(--navy)" />
      <g fill="none" strokeWidth="2" strokeLinecap="round">
        <rect x="115" y="44" width="7" height="7" rx="1.5" stroke="var(--brand)" />
        <path d="M127 47.5h18" stroke="var(--navy)" strokeOpacity=".35" />
        <rect x="115" y="57" width="7" height="7" rx="1.5" stroke="var(--brand)" />
        <path d="M127 60.5h18" stroke="var(--navy)" strokeOpacity=".35" />
        <rect x="115" y="70" width="7" height="7" rx="1.5" stroke="var(--brand)" />
        <path d="M127 73.5h12" stroke="var(--navy)" strokeOpacity=".35" />
      </g>
      <circle className="animate-ping motion-reduce:animate-none" cx="36" cy="112" r="14" fill="none" stroke="var(--gold)" strokeWidth="3" />
      <circle cx="36" cy="112" r="14" fill="#fff" stroke="var(--navy)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="36" y="117" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--navy)" opacity=".4">A</text>
    </svg>
  )
}

function NoProfileState() {
  return (
    <Centered>
      <NoStartIllustration />
      <h1 className="text-navy text-xl font-bold">Answer a few questions first</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        We need to know about your business to build your roadmap.
      </p>
      <Button asChild className="h-11 rounded-full px-6 font-semibold">
        <Link to="/assessment">
          Answer the questions
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </Centered>
  )
}

export function RoadmapPage() {
  const { data: roadmap, isLoading, isError, refetch } = useRoadmap()

  const visualizerSteps = useMemo(() => {
    if (!roadmap?.steps) return []
    return roadmap.steps.map((s) => ({
      number: Number(s.number),
      name: s.name,
      conditionNote: s.conditionNote,
    }))
  }, [roadmap])

  if (isLoading) {
    return <FullPageLoader label="Finding your route…" />
  }

  if (isError) {
    return (
      <FullPageError
        onRetry={() => void refetch()}
        message="We couldn't load your roadmap. Check your connection and try again."
        retryLabel="Try again"
      />
    )
  }

  if (!roadmap) {
    return <NoProfileState />
  }

  const firstStepNumber = roadmap.steps[0] ? Number(roadmap.steps[0].number) : 1

  return (
    <div className="bg-cream min-h-[calc(100svh-4rem)] px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {visualizerSteps.length > 0 && <RoadmapVisualizer steps={visualizerSteps} />}

        <div>
          <h1 className="text-navy text-3xl font-extrabold md:text-4xl">
            Your registration roadmap:
          </h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">
            Up to {roadmap.steps.length} steps to register your {roadmap.categoryName} business in {roadmap.cityName} City.
          </p>
          {roadmap.registrationStatus === 'Started' && (
            <div className="bg-gold/15 text-navy mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
              <Info className="text-brand mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
              <p>Already done some steps? You'll be able to mark them as done soon.</p>
            </div>
          )}
        </div>

        <Button
          asChild
          className="bg-brand hover:bg-brand-dark h-11 w-full self-start rounded-full px-6 font-semibold text-white sm:w-auto"
        >
          <Link to={`/roadmap/steps/${firstStepNumber}`}>
            See step {firstStepNumber}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>

        <div className="relative flex flex-col gap-3">
          <div
            aria-hidden="true"
            className="border-gold/70 absolute top-8 bottom-8 left-[15px] border-l-2 border-dashed"
          />

          <div className="relative flex items-center gap-3">
            <span className="bg-gold text-navy z-10 flex size-8 shrink-0 items-center justify-center rounded-full">
              <Check className="size-4.5" strokeWidth={3} aria-hidden="true" />
            </span>
            <div className="border-gold/60 bg-gold/15 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div className="min-w-0">
                <p className="text-navy font-bold leading-snug">Point A – Profile saved</p>
                <p className="text-muted-foreground text-sm leading-normal">You told us about your business.</p>
              </div>
              <span className="bg-gold text-navy shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold">
                Done
              </span>
            </div>
          </div>

          <ol className="flex flex-col gap-3">
            {roadmap.steps.map((step) => {
              const num = Number(step.number)
              return (
                <li key={step.stepId || num}>
                  <Link
                    to={`/roadmap/steps/${num}`}
                    className="group relative flex min-h-[44px] items-center gap-3 rounded-xl outline-none"
                  >
                    <span className="bg-brand group-hover:text-brand group-focus-visible:text-brand z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-colors group-hover:bg-white group-hover:ring-2 group-hover:ring-brand group-hover:ring-offset-2 group-focus-visible:bg-white group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-2">
                      <span className="sr-only">Step </span>
                      {num}
                    </span>
                    <div className="border-border group-hover:border-brand group-focus-visible:border-brand flex min-w-0 flex-1 items-center gap-3 rounded-xl border bg-white p-3.5 shadow-xs transition-all group-hover:ring-3 group-hover:ring-brand/35 group-focus-visible:ring-3 group-focus-visible:ring-brand/35 md:p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-navy font-semibold leading-snug break-words">{step.name}</p>
                        <p className="text-muted-foreground mt-0.5 text-sm leading-normal break-words">{step.agency}</p>
                        {step.conditionNote && (
                          <span className="bg-gold/20 text-navy mt-2 inline-flex items-start gap-1.5 rounded-md px-2 py-1 text-xs font-medium leading-normal sm:text-[13px]">
                            <Info className="text-brand mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                            <span>{step.conditionNote}</span>
                          </span>
                        )}
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-brand size-5 shrink-0 transition-colors" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>

          <div className="relative flex items-center gap-3">
            <span className="bg-brand ring-gold z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-xs ring-3">
              <Flag className="size-4" aria-hidden="true" />
            </span>
            <div className="bg-brand flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl p-3.5 text-white shadow-lg md:p-4">
              <div className="min-w-0">
                <p className="font-bold leading-snug text-white">
                  <span className="text-gold">Biz</span> – Registered
                </p>
                <p className="text-sm leading-normal text-white/80">Your destination.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
