import { Link } from 'react-router'
import { motion } from 'motion/react'
import { MapPinOff, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Compass ticks: skip the four cardinal zones, keep the fine marks between them.
const TICK_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15).filter(
  (d) => (d % 90 > 20 && d % 90 < 70) || d % 90 === 45,
)

const PIN = (
  <>
    <path
      d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      fill="var(--gold)"
      stroke="var(--navy)"
      strokeWidth="2"
    />
    <circle cx="12" cy="10" r="3" fill="#fff" stroke="var(--navy)" strokeWidth="2" />
  </>
)

export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      {children}
    </motion.div>
  )
}

export function FullPageLoader({ label = 'Loading', message }: { label?: string; message?: string }) {
  return (
    <Centered>
      <div role="status" className="flex flex-col items-center gap-4">
        <svg className="size-30 drop-shadow-lg" viewBox="0 0 100 100" aria-hidden="true">
          <style>{`
            .pagestates-needle { transform-box: view-box; transform-origin: 50px 50px; animation: pagestates-needle 1.8s cubic-bezier(.45,0,.25,1) infinite; }
            @keyframes pagestates-needle { 0% { transform: rotate(0deg); } 65% { transform: rotate(385deg); } 82% { transform: rotate(350deg); } 100% { transform: rotate(360deg); } }
            @media (prefers-reduced-motion: reduce) { .pagestates-needle { animation: none; } }
          `}</style>
          <circle cx="50" cy="50" r="46" fill="#fff" stroke="var(--brand)" strokeWidth="4" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="3 3" />
          <g stroke="var(--navy)" strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round">
            {TICK_ANGLES.map((d) => (
              <line key={d} x1="50" y1="12" x2="50" y2={d % 45 ? 15 : 17} transform={`rotate(${d} 50 50)`} />
            ))}
          </g>
          <text x="50" y="25" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--brand)">
            Biz
          </text>
          <text x="50" y="83" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--navy)">
            A
          </text>
          <g transform="translate(14 43) scale(.55)">{PIN}</g>
          <g transform="translate(73 43) scale(.55)">{PIN}</g>
          <g className="pagestates-needle">
            <path d="M50 28 50 50H44z" fill="#d99a1f" />
            <path d="M50 28 56 50H50z" fill="var(--gold)" />
            <path d="M50 72 44 50H50z" fill="var(--navy)" />
            <path d="M50 72 50 50H56z" fill="#0b1440" />
          </g>
          <circle cx="50" cy="50" r="5" fill="#fff" stroke="var(--navy)" strokeWidth="2" />
          <circle cx="50" cy="50" r="2" fill="var(--gold)" />
        </svg>
        <h1 className="text-navy text-xl font-bold">{label}</h1>
        {message && <p className="text-muted-foreground max-w-sm text-sm">{message}</p>}
        <div aria-hidden="true" className="mt-1 flex w-55 items-center gap-2">
          <style>{`
            .pagestates-dot { animation: pagestates-travel 1.8s ease-in-out infinite; }
            @keyframes pagestates-travel { from { left: 0; } to { left: calc(100% - 10px); } }
            @media (prefers-reduced-motion: reduce) { .pagestates-dot { animation: none; } }
          `}</style>
          <span className="bg-navy grid h-[26px] min-w-[26px] place-items-center rounded-full px-2 text-xs font-extrabold text-white">
            A
          </span>
          <span className="border-gold relative flex-1 border-t-2 border-dashed">
            <span className="pagestates-dot bg-gold absolute -top-1.5 left-0 size-2.5 rounded-full shadow-[0_0_0_3px_rgba(241,177,50,0.3)]" />
          </span>
          <span className="bg-brand grid h-[26px] min-w-[26px] place-items-center rounded-full px-2 text-xs font-extrabold text-white">
            Biz
          </span>
        </div>
      </div>
    </Centered>
  )
}

export function FullPageError({
  onRetry,
  message,
  retryLabel = 'Try again',
}: {
  onRetry: () => void
  message?: string
  retryLabel?: string
}) {
  return (
    <Centered>
      <svg className="h-auto w-65 max-w-full" viewBox="0 0 260 150" aria-hidden="true">
        <style>{`
          .pagestates-light { animation: pagestates-blink 1.2s steps(1) infinite; }
          .pagestates-light-2 { animation-delay: .6s; }
          @keyframes pagestates-blink { 50% { opacity: .2; } }
          @media (prefers-reduced-motion: reduce) { .pagestates-light { animation: none; } }
        `}</style>
        <defs>
          <clipPath id="pagestates-before-block">
            <rect width="118" height="150" />
          </clipPath>
          <pattern
            id="pagestates-block-stripes"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="12" fill="var(--destructive)" />
          </pattern>
        </defs>
        <rect x="4" y="4" width="252" height="142" rx="18" fill="#fff" stroke="var(--border)" />
        <path
          d="M36 112 C 84 112, 92 52, 140 56 S 196 40, 222 38"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          strokeDasharray="7 6"
          strokeLinecap="round"
          opacity=".3"
        />
        <path
          d="M36 112 C 84 112, 92 52, 140 56 S 196 40, 222 38"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          strokeDasharray="7 6"
          strokeLinecap="round"
          clipPath="url(#pagestates-before-block)"
        />
        <circle cx="36" cy="112" r="14" fill="var(--navy)" />
        <text x="36" y="117" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
          A
        </text>
        <g opacity=".45">
          <rect x="200" y="24" width="44" height="28" rx="14" fill="var(--brand)" />
          <text x="222" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
            Biz
          </text>
        </g>
        <ellipse cx="130" cy="102" rx="34" ry="3.5" fill="var(--navy)" opacity=".15" />
        <path
          d="M110 74 104 100M150 74l6 26M112 58v-7M148 58v-7"
          stroke="var(--navy)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle className="pagestates-light" cx="112" cy="46" r="5" fill="var(--destructive)" />
        <circle className="pagestates-light pagestates-light-2" cx="148" cy="46" r="5" fill="var(--destructive)" />
        <rect x="98" y="58" width="64" height="18" rx="4" fill="#fff" />
        <rect x="98" y="58" width="64" height="18" rx="4" fill="url(#pagestates-block-stripes)" />
        <rect x="98" y="58" width="64" height="18" rx="4" fill="none" stroke="var(--navy)" strokeWidth="2" />
      </svg>
      <h1 className="text-navy text-xl font-bold">Something went wrong.</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        {message ?? "We couldn't load this page. Check your connection and try again."}
      </p>
      <Button className="h-11 rounded-full px-6 font-semibold" onClick={onRetry}>
        <RotateCw aria-hidden="true" />
        {retryLabel}
      </Button>
    </Centered>
  )
}

export function NotFoundPage() {
  return (
    <Centered>
      <span className="flex size-16 items-center justify-center rounded-full bg-gold/20">
        <MapPinOff className="size-8 text-brand" aria-hidden="true" />
      </span>
      <h1 className="text-navy text-xl font-bold">Page not found.</h1>
      <p className="text-muted-foreground max-w-sm text-sm">This stop isn't on the route. Let's get you back on track.</p>
      <Button asChild className="h-11 rounded-full px-6 font-semibold">
        <Link to="/">Back to home</Link>
      </Button>
    </Centered>
  )
}
