import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import {
  AlertCircle,
  ArrowUp,
  ArrowUpRight,
  Check,
  FileCheck,
  Loader2,
  MapPin,
  Route,
} from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { FullPageLoader } from '@/components/PageStates'
import { GoogleButton } from '@/components/GoogleButton'
import { SignedInRedirect } from '@/components/ProtectedRoute'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import heroImage from '@/assets/hero.jpg'
import logo from '@/assets/logo-white.png'

// Darkened gold so small text passes contrast on white/cream.
const GOLD_TEXT = 'text-[color-mix(in_oklab,var(--gold)_55%,black)]'
const LIFT = 'transition-transform hover:-translate-y-0.5 motion-reduce:transition-none'
const LINE_X = 'left-5 md:left-10'
const STOP_PAD = 'pl-12 pr-4 md:pl-24 md:pr-12'
const SCROLL_MARGIN = 'scroll-mt-16 md:scroll-mt-20'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const reveal = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
} as const

type Kind = 'guest' | 'google'

function useSignIn() {
  const [pending, setPending] = useState<Kind | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(kind: Kind) {
    setPending(kind)
    setError(null)
    try {
      const { error: authError } =
        kind === 'guest'
          ? await supabase.auth.signInAnonymously()
          : await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin },
            })
      if (authError) {
        setError(authError.message)
        setPending(null)
      }
    } catch {
      setError('Could not sign in. Check your connection and try again.')
      setPending(null)
    }
  }

  return { pending, error, run }
}

function SignInError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertCircle aria-hidden="true" />
      <AlertDescription className="text-destructive">{message}</AlertDescription>
    </Alert>
  )
}

function GuestLabel({ pending, children }: { pending: boolean; children: string }) {
  return (
    <>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </>
  )
}

function Hero() {
  const { pending, error, run } = useSignIn()

  return (
    <section className="relative isolate flex min-h-[34rem] items-center overflow-hidden bg-navy md:min-h-[44rem]">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover object-right"
      />
      <div className="from-navy/95 via-navy/80 to-navy/40 md:via-navy/70 absolute inset-0 -z-10 bg-gradient-to-r md:to-transparent" />
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
            <a href="#start">
              Start My Roadmap
              <ArrowUpRight aria-hidden="true" />
            </a>
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
        View my Roadmap
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

const STEPS = [
  { title: 'Point A - Sign in.', body: 'With Google, or try it as a guest.' },
  { title: 'Answer the form.', body: 'Business type, category, and status.' },
  { title: 'Follow your roadmap.', body: 'Every permit, in the right order.' },
  { title: 'Ask questions.', body: 'If ever stuck on a step, ask our assistant.' },
  { title: 'Biz - Registered.', body: 'AsikaGo guided you up, from A to Biz.' },
] as const

function StartPanel() {
  const { pending, error, run } = useSignIn()

  return (
    <section id="start" className={cn('grid lg:grid-cols-[42%_1fr]', SCROLL_MARGIN)}>
      <motion.div
        {...reveal}
        variants={stagger}
        className="bg-brand px-6 py-12 text-white md:px-12 md:py-16 lg:px-16"
      >
        <motion.img variants={fadeUp} src={logo} alt="AsikaGo" className="h-12 w-auto md:h-16" />
        <motion.h2
          variants={fadeUp}
          className="mt-6 text-3xl font-bold tracking-tight md:text-4xl"
        >
          Your route <span className="text-gold">starts here.</span>
        </motion.h2>
        <ol className="mt-8">
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1
            return (
              <motion.li
                key={s.title}
                variants={fadeUp}
                className={cn('relative pl-14', !last && 'pb-8')}
              >
                {!last && (
                  <span
                    aria-hidden="true"
                    className="border-gold absolute top-9 bottom-0 left-4 -translate-x-1/2 border-l-4 border-dotted"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-0 left-0 flex size-8 items-center justify-center rounded-full',
                    i === 0 || last ? 'text-brand bg-white' : 'bg-gold',
                  )}
                >
                  {i === 0 && <MapPin className="size-4" />}
                  {last && <ArrowUpRight className="text-gold size-5" />}
                </span>
                <p className="text-lg font-bold">{s.title}</p>
                <p className="text-sm text-white/90">{s.body}</p>
              </motion.li>
            )
          })}
        </ol>
      </motion.div>

      <div className="bg-cream flex flex-col items-center justify-center px-4 py-12 md:px-8 md:py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="w-full max-w-xl"
        >
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-10">
            <p className={cn('flex items-center gap-2 text-sm font-medium', GOLD_TEXT)}>
              <MapPin className="size-4" aria-hidden="true" />
              Currently for Pasig City businesses
            </p>
            <h2 className="text-navy mt-3 text-2xl leading-tight font-bold md:text-3xl">
              Register your business step by step, made for Pasig City
            </h2>
            <p className="text-muted-foreground mt-3">
              Sign in to save your answers and get your roadmap.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <GoogleButton
                className={cn('h-12', LIFT)}
                disabled={pending !== null}
                onClick={() => void run('google')}
              />
              <Button
                variant="outline"
                className={cn('text-navy h-12 w-full rounded-full text-base font-semibold', LIFT)}
                disabled={pending !== null}
                onClick={() => void run('guest')}
              >
                <GuestLabel pending={pending === 'guest'}>Continue as guest</GuestLabel>
              </Button>
            </div>
            <SignInError message={error} />
            <div className="border-gold/60 mt-6 flex gap-3 border-t-2 border-dashed pt-5">
              <FileCheck className="text-brand mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="text-muted-foreground text-sm">
                <strong className="text-navy">Guest ka muna?</strong> Your answers are saved. Sign
                in with Google later to keep them on any device.
              </p>
            </div>
          </div>
          <p className="text-navy mt-6 text-center text-sm">
            Outside Pasig? You can still sign in and look around. By continuing, you agree to our
            Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </section>
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
      <StartPanel />
    </>
  )
}
