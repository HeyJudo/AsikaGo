import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { motion, type Variants } from 'motion/react'
import { AlertCircle, Check, Map, MapPin, PenLine, Store } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FullPageError, FullPageLoader } from '@/components/PageStates'
import { GoogleButton } from '@/components/GoogleButton'
import { useAuth } from '@/app/AuthProvider'
import { useBusinessProfile } from '@/lib/queries'
import { supabase } from '@/lib/supabase'

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}
const stops: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.25, delayChildren: 0.5 } } }
const stop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{label}</dt>
      <dd className="text-navy font-semibold break-words">{children}</dd>
    </div>
  )
}

function GuestBanner() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function link() {
    setPending(true)
    setError(null)
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/my-business` },
    })
    // On success the browser redirects to Google, so only failures return here.
    if (error) {
      setError(error.message)
      setPending(false)
    }
  }

  return (
    <motion.div
      variants={item}
      className="border-brand/30 bg-brand/5 flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between md:p-5"
    >
      <div>
        <p className="text-navy font-semibold">Sign in with Google to keep your progress.</p>
        <p className="text-muted-foreground text-sm">Right now your answers live on this device only.</p>
      </div>
      <div className="flex w-full flex-col gap-2 md:w-72 md:shrink-0">
        <GoogleButton onClick={() => void link()} disabled={pending} />
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </motion.div>
  )
}

export function MyBusinessPage() {
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useBusinessProfile()

  if (isPending) return <FullPageLoader />
  if (isError) return <FullPageError onRetry={() => void refetch()} />
  if (!data) return <Navigate to="/assessment" replace />

  const fullName = String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? '').trim()
  const firstName = fullName.split(/\s+/)[0] || 'Guest'
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { dateStyle: 'long' }) : '—'

  return (
    <div className="bg-cream min-h-[calc(100svh-4rem)] px-4 py-8 md:py-12">
      <motion.div variants={list} initial="hidden" animate="show" className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-brand font-semibold">Magandang araw, {firstName}!</p>
            <h1 className="text-navy text-3xl font-extrabold md:text-4xl">My Business</h1>
          </div>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="self-start sm:self-auto">
            <Button asChild variant="outline" className="h-11 rounded-full px-6 font-semibold">
              <Link to="/assessment">
                <PenLine aria-hidden="true" />
                Edit Details
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {user?.is_anonymous && <GuestBanner />}

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div variants={item} className="md:col-span-2">
            <Card className="h-full">
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-brand text-xs font-semibold tracking-widest uppercase">Business Profile · Pasig City</p>
                    {data.businessName ? (
                      <h2 className="text-navy mt-1 text-2xl font-bold break-words">{data.businessName}</h2>
                    ) : (
                      <h2 className="text-muted-foreground mt-1 text-2xl font-bold italic">Unnamed business</h2>
                    )}
                  </div>
                  <div
                    aria-hidden="true"
                    className="border-gold text-muted-foreground flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed text-[10px] font-medium"
                  >
                    <Store className="text-gold size-6" />
                    Business logo
                  </div>
                </div>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <Field label="Business Type">{data.businessType}</Field>
                  <Field label="Category">{data.categoryName}</Field>
                  <Field label="City">{data.cityName}</Field>
                  <Field label="Registration Status">{data.registrationStatus}</Field>
                </dl>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="flex flex-col gap-6">
            <section aria-labelledby="route-heading" className="bg-brand rounded-xl p-6 text-white">
              <h2 id="route-heading" className="text-lg font-bold">
                Your route progress:
              </h2>
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
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      Your roadmap
                      <span className="bg-gold text-navy rounded-full px-2 py-0.5 text-xs font-bold">You're here</span>
                    </p>
                    <p className="text-sm text-white/80">Step-by-step permits for Pasig City. Coming soon.</p>
                  </div>
                </motion.li>
                <motion.li variants={stop} className="relative flex gap-4">
                  <span aria-hidden="true" className="bg-brand z-10 size-6 shrink-0 rounded-full border-2 border-white" />
                  <div>
                    <p className="font-semibold">Biz – Registered</p>
                    <p className="text-sm text-white/80">Your destination.</p>
                  </div>
                </motion.li>
              </motion.ol>
            </section>

            <Card>
              <CardContent className="flex items-start gap-3">
                <Map className="text-brand mt-0.5 size-6 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-navy font-semibold">Your registration roadmap is coming soon.</p>
                  <p className="text-muted-foreground text-sm">We're preparing every Pasig City permit you need, in the right order.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <h2 className="text-navy text-lg font-bold">Account</h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Email">{user?.email || 'Guest — not linked to Google yet'}</Field>
                <Field label="Creation Date">{created}</Field>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
