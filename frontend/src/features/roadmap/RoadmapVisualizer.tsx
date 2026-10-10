import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { RotateCw } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { buildRoute, waypoints, VIEW_H, VIEW_W } from './routeGeometry'

// The fields of RoadmapResponse.steps this draws. Swap in the generated step type from
// src/lib/api-types.ts once US-005-BE-01 publishes it, so a renamed field breaks the build.
type Step = { number: number; name: string; conditionNote?: string | null }

// Timeline in seconds: the road draws itself, the stops pop in as it reaches them, then the pin drives A → Biz.
const DRAW = 1.4
const DRIVE_DELAY = 1.9
const DRIVE = 4.5
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const
// When the road (eased out-cubic) reaches fraction f of its length.
const reachedAt = (f: number) => DRAW * (1 - Math.cbrt(1 - f))

// Animated A-to-Biz road above the step list on /roadmap. Decorative: the list carries the content,
// so the drawing is aria-hidden and only "Replay" is focusable. It shows the route, not progress (US-011).
export function RoadmapVisualizer({ steps }: { steps: Step[] }) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const pts = useMemo(() => waypoints(steps.length), [steps.length])
  const route = useMemo(() => buildRoute(pts), [pts])

  const [run, setRun] = useState(0)
  const [passed, setPassed] = useState(0)
  const [arrived, setArrived] = useState(false)
  const [tip, setTip] = useState<number | null>(null)
  const [tipW, setTipW] = useState(0)
  const tipText = useRef<SVGGElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [overflows, setOverflows] = useState(false)
  const userScrolled = useRef(false)

  const progress = useMotionValue(0)
  const pinX = useTransform(progress, (f) => route.at(f)[0])
  const pinY = useTransform(progress, (f) => route.at(f)[1])

  useEffect(() => {
    if (reduced) return
    progress.set(0)
    userScrolled.current = false
    scroller.current?.scrollTo({ left: 0 })
    const controls = animate(progress, 1, {
      delay: DRIVE_DELAY,
      duration: DRIVE,
      ease: 'easeInOut',
      onComplete: () => setArrived(true),
    })
    return () => controls.stop()
  }, [run, reduced, progress])

  // The swipe hint shows only when the road is actually wider than its box.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setOverflows(el.scrollWidth > el.clientWidth + 1))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useMotionValueEvent(progress, 'change', (f) => {
    setPassed(route.fractions.slice(1, -1).filter((s) => f >= s).length)
    // On phones the road is wider than the screen: keep the pin in view until the user scrolls by hand.
    const el = scroller.current, svg = svgRef.current
    if (!el || !svg || userScrolled.current || el.scrollWidth <= el.clientWidth + 1) return
    const svgLeft = svg.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft
    el.scrollLeft = svgLeft + (route.at(f)[0] / VIEW_W) * svg.clientWidth - el.clientWidth / 2
  })

  useLayoutEffect(() => {
    if (tip !== null && tipText.current) setTipW(tipText.current.getBBox().width + 28)
  }, [tip])

  function replay() {
    setPassed(0)
    setArrived(false)
    setRun((r) => r + 1)
  }

  const [ax, ay] = pts[0]
  const [bx, by] = pts[pts.length - 1]

  return (
    <section className="relative overflow-hidden rounded-[20px] bg-brand p-4 pb-3.5 text-white shadow-[0_10px_30px_rgba(35,64,213,.25)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.08)_1.5px,transparent_1.5px)] bg-size-[22px_22px]"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="font-bold">
            Your route from A to Biz
            <span className="block text-[13px] font-normal text-white/80">
              {overflows && 'Swipe to see the whole route. '}Tap a stop to open that step.
            </span>
          </p>
          {!reduced && (
            <Button
              type="button"
              variant="outline"
              onClick={replay}
              className="h-11 shrink-0 rounded-full border-white/70 bg-transparent px-3.5 text-[13px] font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <RotateCw />
              Replay
            </Button>
          )}
        </div>

        <div
          ref={scroller}
          aria-hidden="true"
          className="-mx-4 mt-2 overflow-x-auto px-2"
          onTouchMove={() => (userScrolled.current = true)}
          onWheel={() => (userScrolled.current = true)}
        >
          <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full min-w-[720px]">
            <g key={run}>
              {([[40, 'stroke-white/15'], [26, 'stroke-navy']] as const).map(([width, color]) => (
                <motion.path
                  key={width}
                  d={route.d}
                  fill="none"
                  strokeWidth={width}
                  strokeLinecap="round"
                  className={color}
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: DRAW, ease: EASE_OUT_CUBIC }}
                />
              ))}
              <motion.path
                d={route.d}
                fill="none"
                strokeWidth={3}
                strokeDasharray="12 12"
                strokeLinecap="round"
                className="stroke-gold"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: DRAW - 0.2, duration: 0.4 }}
              />

              <g transform={`translate(${ax} ${ay})`}>
                <circle r={22} strokeWidth={4} className="fill-white stroke-gold" />
                <text y={6} textAnchor="middle" className="fill-navy text-[18px] font-extrabold">A</text>
                <text y={46} textAnchor="middle" className="fill-white/85 text-[13px] font-semibold">Point A</text>
              </g>

              {steps.map((s, i) => {
                const [x, y] = pts[i + 1]
                const on = tip === i
                return (
                  <g
                    key={s.number}
                    transform={`translate(${x} ${y})`}
                    className="cursor-pointer"
                    onPointerEnter={() => setTip(i)}
                    onPointerLeave={() => setTip(null)}
                    onClick={() => navigate(`/roadmap/steps/${s.number}`)}
                  >
                    <motion.g
                      initial={reduced ? false : { scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 16, delay: reachedAt(route.fractions[i + 1]) }}
                    >
                      {/* Tap area: 64 units, 46 px at the 720 px minimum width. */}
                      <circle r={32} className="fill-transparent" />
                      {s.conditionNote ? (
                        <circle r={22} fill="none" strokeWidth={3} strokeDasharray="5 4" className="stroke-gold" />
                      ) : (
                        <circle r={22} fill="none" strokeWidth={4} className="stroke-white/45" />
                      )}
                      {/* A short pulse as the pin passes. Nothing stays marked: progress isn't tracked yet (US-011). */}
                      {passed > i && (
                        <motion.circle
                          r={22}
                          fill="none"
                          strokeWidth={3}
                          className="stroke-gold"
                          initial={{ scale: 1, opacity: 0.95 }}
                          animate={{ scale: 2.1, opacity: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      )}
                      <circle r={17} className={cn('transition-colors', on ? 'fill-gold' : 'fill-white')} />
                      <text
                        y={6}
                        textAnchor="middle"
                        className={cn('text-[17px] font-extrabold transition-colors', on ? 'fill-navy' : 'fill-brand')}
                      >
                        {s.number}
                      </text>
                    </motion.g>
                  </g>
                )
              })}

              <g transform={`translate(${bx} ${by})`}>
                {arrived && (
                  <motion.circle
                    r={30}
                    fill="none"
                    strokeWidth={4}
                    className="stroke-gold"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                )}
                <motion.g animate={arrived ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.9 }}>
                  <rect x={-34} y={-20} width={68} height={40} rx={20} className="fill-gold" />
                  <text y={6} textAnchor="middle" className="fill-navy text-[18px] font-extrabold">Biz</text>
                </motion.g>
                <text y={46} textAnchor="middle" className="fill-white/85 text-[13px] font-semibold">Registered</text>
              </g>

              {!reduced && (
                <motion.g
                  style={{ x: pinX, y: pinY }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: arrived ? 0 : 1 }}
                  transition={{ delay: arrived ? 0.7 : DRIVE_DELAY, duration: 0.4 }}
                >
                  {/* lucide MapPin, scaled so its tip sits on the road. */}
                  <g transform="translate(-19 -35) scale(1.6)">
                    <path
                      d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                      strokeWidth={1.6}
                      className="fill-gold stroke-navy"
                    />
                    <circle cx={12} cy={10} r={3} strokeWidth={1.6} className="fill-white stroke-navy" />
                  </g>
                </motion.g>
              )}
            </g>

            {/* Index can go stale if the roadmap is rebuilt shorter while a stop is hovered (D10). */}
            {tip !== null && tip < steps.length && (
              <Tooltip step={steps[tip]} total={steps.length} at={pts[tip + 1]} width={tipW} textRef={tipText} />
            )}
          </svg>
        </div>

        <div aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-1.5 px-1 pt-1.5 text-[13px] text-white/85">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-5.5">
              <circle cx={12} cy={12} r={10} fill="none" strokeWidth={3} className="stroke-white/45" />
              <circle cx={12} cy={12} r={6} className="fill-white" />
            </svg>
            Step
          </span>
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-5.5">
              <circle cx={12} cy={12} r={10} fill="none" strokeWidth={2.5} strokeDasharray="3.5 3" className="stroke-gold" />
              <circle cx={12} cy={12} r={6} className="fill-white" />
            </svg>
            May not apply to you
          </span>
        </div>
      </div>
    </section>
  )
}

function Tooltip({
  step,
  total,
  at: [x, y],
  width,
  textRef,
}: {
  step: Step
  total: number
  at: [number, number]
  width: number
  textRef: React.RefObject<SVGGElement | null>
}) {
  const h = step.conditionNote ? 70 : 54
  const tx = Math.min(Math.max(x - width / 2, 8), VIEW_W - width - 8)
  const ty = y - 34 - h > 4 ? y - 34 - h : y + 34
  return (
    <g pointerEvents="none" opacity={width ? 1 : 0}>
      <rect x={tx} y={ty} width={width} height={h} rx={12} className="fill-white" />
      <g ref={textRef}>
        <text x={tx + 14} y={ty + 20} className="fill-brand text-[12px] font-bold uppercase tracking-wide">
          Step {step.number} of {total}
        </text>
        <text x={tx + 14} y={ty + 40} className="fill-navy text-[15px] font-semibold">
          {step.name}
        </text>
        {step.conditionNote && (
          <text x={tx + 14} y={ty + 58} className="fill-amber-700 text-[12px] font-semibold">
            May not apply to you
          </text>
        )}
      </g>
    </g>
  )
}
