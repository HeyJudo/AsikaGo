import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

export function StepNotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <svg viewBox="0 0 260 150" aria-hidden="true" className="w-[260px] max-w-full">
        <style>{`
          @keyframes step-lost-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
          @keyframes step-lost-shadow { 0%, 100% { transform: scaleX(1); opacity: .25 } 50% { transform: scaleX(.75); opacity: .15 } }
        `}</style>
        <rect x="4" y="4" width="252" height="142" rx="18" className="fill-white stroke-border" />
        <path
          d="M36 112 C 84 112, 92 52, 140 56 S 196 40, 222 38"
          fill="none"
          className="stroke-gold"
          strokeWidth="3"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
        <g className="fill-gold" opacity=".55">
          <circle cx="150" cy="74" r="2.5" />
          <circle cx="160" cy="88" r="2.5" />
          <circle cx="172" cy="100" r="2.5" />
        </g>
        <circle cx="36" cy="112" r="14" className="fill-navy" />
        <text x="36" y="117" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">
          A
        </text>
        <rect x="200" y="24" width="44" height="28" rx="14" className="fill-brand" />
        <text x="222" y="43" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
          Biz
        </text>
        <ellipse
          cx="194"
          cy="132"
          rx="14"
          ry="3.5"
          className="fill-navy origin-center animate-[step-lost-shadow_2.4s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{ transformBox: 'fill-box' }}
          opacity=".25"
        />
        <g className="animate-[step-lost-bob_2.4s_ease-in-out_infinite] motion-reduce:animate-none">
          <path
            d="M194 128c-2-2-18-16-18-30a18 18 0 0 1 36 0c0 14-16 28-18 30z"
            className="fill-gold stroke-navy"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <text x="194" y="105" textAnchor="middle" fontSize="18" fontWeight="800" className="fill-navy">
            ?
          </text>
        </g>
      </svg>
      <h1 className="text-navy text-xl font-bold">We can't find this step.</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        This step isn't on your roadmap. Pick a step from your roadmap list.
      </p>
      <Button asChild className="h-11 rounded-full px-6 font-semibold">
        <Link to="/roadmap">Back to my roadmap</Link>
      </Button>
    </motion.div>
  )
}
