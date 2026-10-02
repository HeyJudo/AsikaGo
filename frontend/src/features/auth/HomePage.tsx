import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowUp, ArrowUpRight, Check, MapPin, Route } from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { FullPageLoader } from '@/components/PageStates'
import { SignedInRedirect } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
  GOLD_TEXT,
  GuestLabel,
  LIFT,
  SCROLL_MARGIN,
  SignInError,
  SignInPanel,
  fadeUp,
  reveal,
  stagger,
  useSignIn,
} from '@/features/auth/SignInPanel'
import { cn } from '@/lib/utils'
import heroImage from '@/assets/hero.jpg'

const LINE_X = 'left-5 md:left-10'
const STOP_PAD = 'pl-12 pr-4 md:pl-24 md:pr-12'

function Hero() {
  const { pending, error, run } = useSignIn()

  if (loading) return <FullPageLoader />
  if (session) return <SignedInRedirect />

  return (
    <section className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-navy md:min-h-[44rem]">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-right"
      />
      <div className="from-navy/95 via-navy/80 to-navy/40 md:from-navy/90 md:via-navy/35 md:via-45% absolute inset-0 -z-10 bg-gradient-to-r md:to-transparent" />
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-7xl px-4 py-16 md:px-8"
      >
        <motion.p variants={fadeUp} className="flex items-center gap-2 text-sm text-white md:text-lg">
          <MapPin className="fill-gold text-gold size-5 shrink-0 md:size-6" aria-hidden="true" />
          Now open for Pasig City businesses.
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-4 max-w-3xl text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-white md:text-7xl lg:text-[5rem]"
        >
          Register your business.
          <span className="text-gold mt-2 block text-[1.75rem] leading-tight font-bold md:text-5xl">
            Skip the runaround.
          </span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-white md:text-2xl">
          AsikaGo maps every permit your business needs, in the right order.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className={cn(
              'bg-gold text-navy hover:bg-gold/90 h-12 rounded-full px-8 text-base font-bold',
              LIFT,
            )}
          >
            <Link to="/sign-in">
              Start My Roadmap
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            className={cn(
              'bg-brand hover:bg-brand-dark h-12 rounded-full px-8 text-base font-bold text-white',
              LIFT,
            )}
            disabled={pending !== null}
            onClick={() => void run('guest')}
          >
            <GuestLabel pending={pending === 'guest'}>Continue as Guest</GuestLabel>
          </Button>
        </motion.div>
        {error && (
          <motion.div variants={fadeUp} className="max-w-md">
            <SignInError message={error} />
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

function StopHeading({ stop, children }: { stop: number; children: React.ReactNode }) {
  return (
    <>
      <p className="text-brand text-lg font-bold md:text-xl">Stop {stop}</p>
      <h2 className="text-navy mt-1 text-[2rem] leading-[1.05] font-extrabold tracking-tight md:text-5xl lg:text-6xl">
        {children}
      </h2>
    </>
  )
}

function StopDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-gold absolute z-20 size-5 -translate-x-1/2 rounded-full md:size-7',
        LINE_X,
        className,
      )}
    />
  )
}

function Tile({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex min-h-11 items-center justify-center rounded-lg border px-3 py-2 text-center text-sm font-semibold',
        active ? 'bg-brand border-brand text-white' : 'border-border text-navy bg-white',
      )}
    >
      {children}
    </div>
  )
}

function FormPreview() {
  return (
    <div
      aria-hidden="true"
      className="text-navy rounded-3xl border bg-white p-5 shadow-sm md:p-8"
    >
      <p className="font-bold">Business Name</p>
      <div className="text-muted-foreground mt-2 flex h-12 items-center rounded-lg border px-4">
        Your Business Name
      </div>
      <p className="mt-5 font-bold">Business Type</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Tile active>Sole Proprietorship</Tile>
        <Tile>Partnership</Tile>
        <Tile>Corporation</Tile>
        <Tile>OPC</Tile>
      </div>
      <p className="mt-5 font-bold">Where are you in the process?</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Tile active>Planning - haven't started.</Tile>
        <Tile>Started - some papers done.</Tile>
      </div>
      <div className="bg-navy mt-5 flex h-12 items-center justify-center rounded-lg font-bold text-white">
        Save and continue
      </div>
    </div>
  )
}

const ROADMAP = [
  { n: '01', title: 'Business name registration', who: 'DTI', status: 'Done', state: 'done' },
  { n: '02', title: 'Barangay business clearance', who: 'Your barangay hall', status: "You're here", state: 'here' },
  { n: '03', title: "Mayor's / business permit", who: 'Pasig City Hall', status: 'Up next', state: 'next' },
  { n: '04', title: 'Tax registration', who: 'BIR', status: 'Later', state: 'later' },
] as const

function RoadmapCard({ item }: { item: (typeof ROADMAP)[number] }) {
  const { state } = item
  return (
    <motion.li
      variants={fadeUp}
      className={cn(
        'flex flex-col rounded-2xl bg-white p-5',
        state === 'done' && 'border-brand border-2',
        state === 'here' && 'border-gold border-2',
        (state === 'next' || state === 'later') && 'border',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-3xl font-bold',
            state === 'done' && 'text-brand',
            state === 'here' && 'text-navy',
            (state === 'next' || state === 'later') && 'text-muted-foreground/60',
          )}
        >
          {item.n}
        </span>
        {state === 'done' && (
          <span className="bg-brand flex size-7 items-center justify-center rounded-full text-white">
            <Check className="size-4" />
          </span>
        )}
        {state === 'here' && (
          <span className="border-gold size-6 rounded-full border-4" />
        )}
      </div>
      <p className="text-navy mt-4 font-semibold">{item.title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{item.who}</p>
      <p
        className={cn(
          'mt-4 border-t border-dashed pt-3 text-sm font-semibold',
          state === 'done' && 'text-brand',
          state === 'here' && GOLD_TEXT,
          (state === 'next' || state === 'later') && 'text-muted-foreground',
        )}
      >
        {item.status}
      </p>
    </motion.li>
  )
}

const CHAT = [
  { from: 'user', text: "Pang-Pasig lang ba 'to?" },
  {
    from: 'bot',
    text: "For now, yes. Roadmaps follow Pasig City's process, but you can still sign in and look around from anywhere.",
  },
  { from: 'user', text: 'Kailangan ko ba ng account?' },
  {
    from: 'bot',
    text: 'Hindi! Start as a guest and your answers are saved. Sign in with Google later to keep them on any device.',
  },
  { from: 'user', text: 'What businesses can use it?' },
  {
    from: 'bot',
    text: 'Sole proprietorships, partnerships, corporations, and OPCs in food & beverage, retail, and services.',
  },
] as const

function ChatPreview() {
  return (
    <div aria-hidden="true" className="rounded-3xl border bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <span className="bg-brand flex size-10 items-center justify-center rounded-full text-white">
          <Route className="size-5" />
        </span>
        <div>
          <p className="text-navy text-sm font-semibold">AsikaGo Assistant</p>
          <p className="text-muted-foreground text-xs">Usually answers right away</p>
        </div>
      </div>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-4 flex flex-col gap-3"
      >
        {CHAT.map((m) => (
          <motion.p
            key={m.text}
            variants={fadeUp}
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
              m.from === 'user'
                ? 'bg-brand self-end text-white'
                : 'bg-cream-deep text-navy self-start',
            )}
          >
            {m.text}
          </motion.p>
        ))}
      </motion.div>
      <div className="mt-4 flex h-12 items-center justify-between rounded-full border pr-1.5 pl-4">
        <span className="text-muted-foreground text-sm">Ask about any requirement...</span>
        <span className="bg-gold text-navy flex size-9 items-center justify-center rounded-full">
          <ArrowUp className="size-4" />
        </span>
      </div>
    </div>
  )
}

function RouteBand() {
  const bandRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ['start 0.75', 'end 0.6'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div ref={bandRef} id="how-it-works" className={cn('relative bg-cream', SCROLL_MARGIN)}>
      <div className={cn('absolute top-12 bottom-0 z-10 w-1 -translate-x-1/2', LINE_X)} aria-hidden="true">
        <motion.div
          className="size-full origin-top bg-[repeating-linear-gradient(to_bottom,var(--gold)_0_14px,transparent_14px_26px)]"
          style={{ scaleY: reduce ? 1 : scaleY, originY: 0 }}
        />
      </div>

      <div className={cn('relative flex items-center gap-3 pt-5 pb-3 text-brand', STOP_PAD)}>
        <motion.span
          aria-hidden="true"
          className={cn('absolute z-20 -translate-x-1/2', LINE_X)}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MapPin className="fill-gold text-gold size-9 md:size-11" />
        </motion.span>
        <p className="text-xl font-bold md:text-2xl">Point A - You are here.</p>
      </div>

      <motion.section
        {...reveal}
        variants={stagger}
        className={cn('relative py-12 md:py-24', STOP_PAD)}
      >
        <StopDot className="top-14 md:top-28" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div variants={fadeUp}>
            <StopHeading stop={1}>Answer the form, we'll handle the rest.</StopHeading>
            <p className="text-navy mt-5 max-w-xl text-base md:text-lg">
              We just need a little information from you. Tell us your business type, category, and
              where you are in the process. Don't worry, your answers save as you go.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <FormPreview />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        variants={stagger}
        className={cn('bg-cream-deep relative py-12 md:py-20', STOP_PAD)}
      >
        <StopDot className="top-14 md:top-24" />
        <div className="mx-auto max-w-6xl">
          <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
            <motion.div variants={fadeUp}>
              <StopHeading stop={2}>Your roadmap, in order.</StopHeading>
            </motion.div>
            <motion.p variants={fadeUp} className="text-navy text-base md:text-lg">
              Only the permits that apply to you. Each step is researched against Pasig City's
              process, so you show up with the right papers.
            </motion.p>
          </div>
          <motion.ul
            aria-hidden="true"
            variants={stagger}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {ROADMAP.map((item) => (
              <RoadmapCard key={item.n} item={item} />
            ))}
          </motion.ul>
          <motion.p variants={fadeUp} className="text-navy mt-8 text-sm md:text-base">
            Roadmap illustrated above is a sample, it may not apply to your business.
          </motion.p>
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        variants={stagger}
        id="faq"
        className={cn('relative py-12 md:py-24', STOP_PAD, SCROLL_MARGIN)}
      >
        <StopDot className="top-14 md:top-28" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div variants={fadeUp}>
            <StopHeading stop={3}>Stuck on a step? Just ask.</StopHeading>
            <p className="text-navy mt-5 max-w-xl text-base md:text-lg">
              Ask about a form, a fee, or what to bring, the way you'd ask a friend who's done this
              before. Here are the questions people ask us most.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <ChatPreview />
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

export function HomePage() {
  const { session, loading } = useAuth()
  const { hash } = useLocation()

  useEffect(() => {
    if (loading || session || !hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, loading, session])

  if (loading) return <FullPageLoader />
  if (session) return <SignedInRedirect />

  return (
    <>
      <Hero />
      <RouteBand />
      <SignInPanel id="start" />
    </>
  )
}
