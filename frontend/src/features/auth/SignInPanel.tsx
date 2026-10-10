import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { AlertCircle, ArrowUpRight, FileCheck, Loader2, MapPin } from 'lucide-react'
import { GoogleButton } from '@/components/GoogleButton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo-white.png'

// Darkened gold so small text passes contrast on white/cream.
export const GOLD_TEXT = 'text-[color-mix(in_oklab,var(--gold)_55%,black)]'
export const LIFT = 'transition-transform hover:-translate-y-0.5 motion-reduce:transition-none'
export const SCROLL_MARGIN = 'scroll-mt-16 md:scroll-mt-20'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
export const reveal = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
} as const

type Kind = 'guest' | 'google'

export function useSignIn() {
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

export function SignInError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <Alert variant="destructive" className="mt-3">
      <AlertCircle aria-hidden="true" />
      <AlertDescription className="text-destructive">{message}</AlertDescription>
    </Alert>
  )
}

export function GuestLabel({ pending, children }: { pending: boolean; children: string }) {
  return (
    <>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </>
  )
}

const STEPS = [
  { title: 'Point A - Sign in.', body: 'With Google, or try it as a guest.' },
  { title: 'Answer the form.', body: 'Business type, category, and status.' },
  { title: 'Follow your roadmap.', body: 'Every permit, in the right order.' },
  { title: 'Ask questions.', body: 'If ever stuck on a step, ask our assistant.' },
  { title: 'Biz - Registered.', body: 'AsikaGo guided you up, from A to Biz.' },
] as const

export function SignInPanel({
  id,
  className,
  as = 'h2',
  children,
}: {
  id?: string
  className?: string
  as?: 'h1' | 'h2'
  children?: React.ReactNode
}) {
  const Heading = as === 'h1' ? motion.h1 : motion.h2
  const { pending, error, run } = useSignIn()

  return (
    <section id={id} className={cn('grid lg:grid-cols-[42%_1fr]', SCROLL_MARGIN, className)}>
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
          {children}
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-10">
            <p className={cn('flex items-center gap-2 text-sm font-medium', GOLD_TEXT)}>
              <MapPin className="size-4" aria-hidden="true" />
              Currently for Pasig City businesses
            </p>
            <Heading className="text-navy mt-3 text-2xl leading-tight font-bold md:text-3xl">
              Register your business step by step, made for Pasig City
            </Heading>
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
