import { Check, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from 'cn'

type Props = {
  labels: string[]
  current: number // 0-based; the last label is the review stop
}

// Horizontal take on the landing route: dashed gold track, gold pins.
export function RouteProgress({ labels, current }: Props) {
  const last = labels.length - 1
  const heading = current === last ? 'Review' : `Step ${current + 1} of ${last}`

  return (
    <div
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={1}
      aria-valuemax={labels.length}
      aria-valuenow={current + 1}
      aria-valuetext={current === last ? heading : `${heading}: ${labels[current]}`}
      className="mb-8"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand" aria-hidden="true">
        {heading}
        {current !== last && <span className="sm:hidden"> · {labels[current]}</span>}
      </p>
      <div className="relative flex items-center justify-between sm:pb-6" aria-hidden="true">
        <div className="absolute inset-x-3.5 top-3.5">
          <div className="border-t-2 border-dashed border-gold/50" />
          <motion.div
            className="absolute inset-x-0 top-0 h-0.5 origin-left -translate-y-1/2 bg-gold"
            initial={false}
            animate={{ scaleX: current / last }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        {labels.map((label, i) => (
          <div key={label} className="relative flex size-7 items-center justify-center">
            {i < current && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gold text-navy">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            {i > current && <span className="size-3 rounded-full border-2 border-gold/50 bg-white" />}
            {i === current && (
              <motion.span layoutId="route-pin" className="relative flex size-7 items-center justify-center">
                <motion.span
                  className="absolute size-6 rounded-full bg-gold"
                  animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
                <MapPin className="relative size-7 fill-gold text-navy" strokeWidth={1.75} />
              </motion.span>
            )}
            <span
              className={cn(
                'absolute top-full mt-1 hidden whitespace-nowrap text-xs sm:block',
                i === current ? 'font-semibold text-navy' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
