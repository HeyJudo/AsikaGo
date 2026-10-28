import { Link } from 'react-router'
import { motion, type Variants } from 'motion/react'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import type { RoadmapResponse } from '@/lib/queries'

const stops: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.25, delayChildren: 0.5 } } }
const stop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}
const linkClass = '-mx-2 flex min-h-11 items-center gap-2 rounded-xl px-2 py-1.5 font-semibold break-words hover:bg-white/10'

type Props = {
  roadmap: RoadmapResponse | null | undefined
  isPending: boolean
  isError: boolean
  isFetching: boolean
  onRetry: () => void
}

export function MyBusinessRouteProgress({ roadmap, isPending, isError, isFetching, onRetry }: Props) {
  const hasSteps = !!roadmap?.steps.length
  const allDone = hasSteps && roadmap.nextStepNumber === null
  const nextStep = roadmap?.steps.find(step => Number(step.number) === Number(roadmap.nextStepNumber))

  return (
    <section aria-labelledby="route-heading" className="bg-brand rounded-xl p-6 text-white">
      <h2 id="route-heading" className="text-lg font-bold">Your route progress:</h2>
      <motion.ol variants={stops} className="relative mt-5 flex flex-col gap-6">
        <motion.span
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="absolute top-3 bottom-3 left-3 origin-top border-l-2 border-dashed border-white/50"
        />
        <motion.li variants={stop} className="relative flex gap-4">
          <span className="bg-gold text-navy z-10 flex size-6 shrink-0 items-center justify-center rounded-full">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">Point A – Profile saved</p>
            <p className="text-sm text-white/80">You told us about your business.</p>
          </div>
        </motion.li>
        <motion.li variants={stop} className="relative flex gap-4">
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-gold text-navy z-10 flex size-6 shrink-0 items-center justify-center rounded-full"
          >
            <MapPin className="size-4" aria-hidden="true" />
          </motion.span>
          <div className="min-w-0 flex-1">
            {hasSteps ? (
              <>
                <p className="text-4xl font-extrabold">{roadmap.progressPercent}%</p>
                <div
                  role="progressbar"
                  aria-label="Steps done"
                  aria-valuemin={0}
                  aria-valuemax={roadmap.steps.length}
                  aria-valuenow={Number(roadmap.completedSteps)}
                  aria-valuetext={`${roadmap.completedSteps} of ${roadmap.steps.length} steps done`}
                  className="my-2 h-3 overflow-hidden rounded-full bg-white/25"
                >
                  <div className="bg-gold h-full rounded-full transition-[width]" style={{ width: `${roadmap.progressPercent}%` }} />
                </div>
                <p className="font-semibold">
                  {allDone ? `All ${roadmap.steps.length} steps done.` : `${roadmap.completedSteps} of ${roadmap.steps.length} steps done`}
                </p>
                <Link to={nextStep ? `/roadmap/steps/${nextStep.number}` : '/roadmap'} className={linkClass}>
                  <span className="min-w-0">{nextStep ? `Next: Step ${nextStep.number} · ${nextStep.name}` : 'See my roadmap'}</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </>
            ) : isPending ? (
              <p role="status" className="text-sm text-white/80">Loading your progress…</p>
            ) : !isError || roadmap !== undefined ? (
              <Link to="/roadmap" className={linkClass}>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    Your roadmap
                    <span className="bg-gold text-navy rounded-full px-2 py-0.5 text-xs font-bold">You're here</span>
                  </p>
                  <p className="text-sm font-normal text-white/80">Step-by-step permits for Pasig City.</p>
                </div>
                <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
              </Link>
            ) : null}
            {isError && (
              <div>
                <p role="alert" className="text-sm text-white/80">
                  {roadmap !== undefined ? "We couldn't refresh your progress." : "We couldn't load your progress."}
                </p>
                <button type="button" onClick={onRetry} disabled={isFetching} className="min-h-11 font-semibold underline">
                  {isFetching ? 'Trying again…' : 'Try again'}
                </button>
              </div>
            )}
          </div>
        </motion.li>
        <motion.li variants={stop} className="relative flex gap-4">
          {allDone ? (
            <span className="bg-gold text-navy z-10 flex size-6 shrink-0 items-center justify-center rounded-full">
              <Check className="size-4" aria-hidden="true" />
            </span>
          ) : (
            <span aria-hidden="true" className="bg-brand z-10 size-6 shrink-0 rounded-full border-2 border-white" />
          )}
          <div>
            <p className="font-semibold">Biz – Registered</p>
            <p className="text-sm text-white/80">Your destination.</p>
          </div>
        </motion.li>
      </motion.ol>
    </section>
  )
}
