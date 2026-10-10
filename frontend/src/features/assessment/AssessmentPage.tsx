import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import {
  AlertCircle,
  ArrowRight,
  Building2,
  ClipboardList,
  Compass,
  FileCheck2,
  Loader2,
  MapPin,
  MapPinned,
  Route,
  ShoppingBag,
  Store,
  User,
  UserRoundCheck,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ApiError, apiFetch } from '@/lib/api'
import { useBusinessProfile, type BusinessProfile } from '@/lib/queries'
import type { components } from '@/lib/api-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { ChoiceCard } from './ChoiceCard'
import { RouteProgress } from './RouteProgress'

type AssessmentOptions = components['schemas']['AssessmentOptionsResponse']
type Field = 'businessName' | 'businessType' | 'categoryId' | 'registrationStatus'
type Values = Record<Field, string>

const STEPS = ['intro', 'name', 'type', 'category', 'status', 'review'] as const
type Step = (typeof STEPS)[number]

const PROGRESS_LABELS = ['Name', 'Type', 'Category', 'Status', 'Review']

// Exact wording must match US-001-BE-03 validation messages
const ERROR_MESSAGES = {
  businessType: 'Please choose a business type.',
  categoryId: 'Please choose a business category.',
  registrationStatus: 'Please tell us where you are in the process.',
  businessName: 'Business name must be 100 characters or less.',
} as const

const FIELD_STEP: Record<Field, Step> = {
  businessName: 'name',
  businessType: 'type',
  categoryId: 'category',
  registrationStatus: 'status',
}
const FIELD_ORDER: Field[] = ['businessName', 'businessType', 'categoryId', 'registrationStatus']

// Wireframe copy, keyed by the exact API strings; unknown values fall back to the raw name
const TYPE_DESCRIPTIONS: Record<string, string> = {
  'Sole Proprietorship': 'You own the business alone. Most small businesses and sari-sari stores start here.',
  Partnership: 'Two or more people run the business together and share profits and responsibilities.',
  Corporation: 'A separate legal entity owned by shareholders. Common for larger or investor-backed businesses.',
  'One Person Corporation':
    'Like a corporation, but owned by a single person. Gives you limited liability without needing co-founders.',
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  'Sole Proprietorship': User,
  Partnership: Users,
  Corporation: Building2,
  'One Person Corporation': UserRoundCheck,
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food and Beverage': UtensilsCrossed,
  Retail: ShoppingBag,
  Services: Wrench,
}

const STATUS_COPY: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  Planning: { label: "Planning — I haven't started yet", description: 'I want to know what I need before I begin.', icon: Compass },
  Started: {
    label: "Started — I've done some papers already",
    description: "For example, I've registered my business name or got my barangay clearance.",
    icon: FileCheck2,
  },
}

const INTRO_ROWS = [
  { icon: ClipboardList, text: 'Tell us about your business' },
  { icon: MapPinned, text: "We match Pasig City's permits" },
  { icon: Route, text: 'Get your step-by-step roadmap' },
]

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

function useAssessmentOptions() {
  return useQuery<AssessmentOptions>({
    queryKey: ['assessment', 'options'],
    queryFn: () => apiFetch<AssessmentOptions>('/api/assessment/options'),
  })
}

function firstFocusable(root: HTMLElement | null) {
  return root?.querySelector<HTMLElement>('input, [role="radio"]') ?? null
}

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -48, transition: { duration: 0.15 } }),
}

// One screen. On mount focuses the first field (after a failed step) or the heading (screen readers announce it).
function StepFrame({
  title,
  dir,
  focusField,
  children,
}: {
  title: string
  dir: number
  focusField: boolean
  children: React.ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const target = focusField ? firstFocusable(rootRef.current) : null
    ;(target ?? headingRef.current)?.focus()
  }, [focusField])

  return (
    <motion.div ref={rootRef} custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
      <h1 ref={headingRef} tabIndex={-1} className="mb-2 text-2xl font-bold text-navy outline-none">
        {title}
      </h1>
      {children}
    </motion.div>
  )
}

const BUTTON_PRIMARY = 'h-12 flex-1 rounded-xl bg-navy text-[15px] font-bold text-white hover:bg-navy/90'

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">{children}</div>
}

function Tap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="flex flex-1" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
      {children}
    </motion.div>
  )
}

export function AssessmentPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const { data: options, isLoading: optionsLoading, isError: optionsError, refetch: refetchOptions } = useAssessmentOptions()
  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useBusinessProfile()

  const [values, setValues] = useState<Values>({
    businessName: '',
    businessType: '',
    categoryId: '',
    registrationStatus: '',
  })

  const [prefilled, setPrefilled] = useState(false)
  if (profile && !prefilled) {
    setPrefilled(true)
    setValues({
      businessName: profile.businessName || '',
      businessType: profile.businessType || '',
      categoryId: profile.categoryId || '',
      registrationStatus: profile.registrationStatus || '',
    })
  }

  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [saveNetworkError, setSaveNetworkError] = useState(false)
  const [focusField, setFocusField] = useState(false)
  const returnToReview = useRef(false)

  const isLoading = optionsLoading || profileLoading
  const isError = optionsError || profileError
  const ready = !isLoading && !isError && !!options

  // Resolve the step: URL param, defaulted by saved profile, clamped to the first unanswered required step
  const requested = params.get('step')
  const requestedStep = STEPS.find((s) => s === requested)
  let step: Step = requestedStep ?? (profile ? 'review' : 'intro')
  if (profile && step === 'intro') step = 'review'
  const missing = !values.businessType ? 'type' : !values.categoryId ? 'category' : !values.registrationStatus ? 'status' : null
  if (missing && STEPS.indexOf(step) > STEPS.indexOf(missing)) step = missing
  const stepIndex = STEPS.indexOf(step)

  const urlOutOfSync = requested !== step && !(requested === null && step === 'intro')
  useEffect(() => {
    if (ready && urlOutOfSync) setParams({ step }, { replace: true })
  }, [ready, urlOutOfSync, step, setParams])

  // Direction of travel, derived while rendering
  const [travel, setTravel] = useState({ index: stepIndex, dir: 1 })
  if (travel.index !== stepIndex) setTravel({ index: stepIndex, dir: stepIndex > travel.index ? 1 : -1 })

  function go(to: Step, replace = false) {
    setFocusField(false)
    if (to === 'review') returnToReview.current = false
    setParams({ step: to }, { replace })
  }

  function next() {
    go(returnToReview.current ? 'review' : STEPS[stepIndex + 1])
  }

  function edit(to: Step) {
    returnToReview.current = true
    go(to)
  }

  function clearError(field: Field) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setSaveNetworkError(false)
  }

  function setValue(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function fieldError(field: Field, v: Values) {
    if (field === 'businessName') return v.businessName.length > 100 ? ERROR_MESSAGES.businessName : undefined
    return v[field] ? undefined : ERROR_MESSAGES[field]
  }

  // Show errors and send the user to the earliest step that has one
  function showErrors(errs: Partial<Record<Field, string>>) {
    setErrors(errs)
    const first = FIELD_ORDER.find((f) => errs[f])
    if (!first) return
    if (FIELD_STEP[first] === step) {
      firstFocusable(document.getElementById('assessment-card'))?.focus()
    } else {
      go(FIELD_STEP[first])
      setFocusField(true)
    }
  }

  // Maps a 400 response to field errors; returns true if at least one was mapped.
  function showServerErrors(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 400) return false
    try {
      const body = JSON.parse(err.body) as { errors?: Record<string, string[]> }
      const serverErrors: Partial<Record<Field, string>> = {}
      for (const [field, messages] of Object.entries(body.errors ?? {})) {
        if (messages[0] && field in FIELD_STEP) serverErrors[field as Field] = messages[0]
      }
      if (Object.keys(serverErrors).length === 0) return false
      showErrors(serverErrors)
      return true
    } catch {
      return false // unparseable 400 body
    }
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Values) =>
      apiFetch<BusinessProfile>('/api/business-profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (saved) => {
      // Seed the cache so /my-business doesn't see the stale null profile and bounce back
      queryClient.setQueryData(['business-profile'], saved)
      void navigate('/my-business')
    },
    onError: (err) => {
      if (!showServerErrors(err)) setSaveNetworkError(true)
    },
  })

  function validateStep(field: Field) {
    const message = fieldError(field, values)
    if (message) showErrors({ [field]: message })
    return !message
  }

  function save() {
    setSaveNetworkError(false)
    const errs: Partial<Record<Field, string>> = {}
    for (const f of FIELD_ORDER) {
      const message = fieldError(f, values)
      if (message) errs[f] = message
    }
    if (Object.keys(errs).length > 0) return showErrors(errs)
    saveMutation.mutate(values)
  }

  const submitStep = (field: Field) => (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(field)) next()
  }

  function choiceGroup(field: Field, label: string, children: React.ReactNode, cols = 'sm:grid-cols-2') {
    return (
      <>
        <RadioGroup
          className={`mt-6 grid grid-cols-1 gap-3 ${cols}`}
          value={values[field]}
          onValueChange={(value) => {
            setValue(field, value)
            clearError(field)
          }}
          aria-label={label}
          aria-invalid={!!errors[field]}
          aria-describedby={errors[field] ? `${field}-error` : undefined}
        >
          {children}
        </RadioGroup>
        {errors[field] && <FieldError id={`${field}-error`} message={errors[field]} />}
      </>
    )
  }

  const nextButton = (
    <Tap>
      <Button type="submit" className={BUTTON_PRIMARY}>
        Next
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </Tap>
  )

  function renderStep() {
    if (!options) return null
    const categoryName = options.categories.find((c) => c.id === values.categoryId)?.name
    const reviewRows: { label: string; value: string; to?: Step; muted?: boolean }[] = [
      { label: 'Business name', value: values.businessName || 'Not set (optional)', to: 'name', muted: !values.businessName },
      { label: 'Business type', value: values.businessType, to: 'type' },
      { label: 'Category', value: categoryName ?? '', to: 'category' },
      { label: 'City', value: 'Pasig City' },
      { label: 'Status', value: STATUS_COPY[values.registrationStatus]?.label ?? values.registrationStatus, to: 'status' },
    ]

    switch (step) {
      case 'intro':
        return (
          <StepFrame key={step} title="Let's map your route." dir={travel.dir} focusField={false}>
            <p className="text-muted-foreground text-sm">
              Answer 4 quick questions and we'll build your Pasig City registration roadmap.
            </p>
            <div className="my-6 flex items-center justify-between px-6" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-1 items-center first:flex-none last:flex-none">
                  <motion.span
                    initial={{ scale: 0, y: -8 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 + i * 0.25 }}
                  >
                    <MapPin className="size-8 fill-gold text-navy" strokeWidth={1.75} />
                  </motion.span>
                  {i < 2 && (
                    <motion.span
                      className="mx-2 h-0 flex-1 origin-left border-t-2 border-dashed border-gold"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.25, delay: 0.4 + i * 0.25 }}
                    />
                  )}
                </div>
              ))}
            </div>
            <ul className="space-y-3">
              {INTRO_ROWS.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-2xl bg-cream p-3 text-sm font-medium text-navy"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  {text}
                </motion.li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs text-muted-foreground">About 1 minute · Pasig City only</p>
            <Actions>
              <Tap>
                <Button type="button" className={BUTTON_PRIMARY} onClick={() => go('name')}>
                  Let's go
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Tap>
            </Actions>
          </StepFrame>
        )

      case 'name':
        return (
          <StepFrame key={step} title="What's your business called?" dir={travel.dir} focusField={focusField}>
            <form onSubmit={submitStep('businessName')} noValidate>
              <p id="businessName-help" className="text-sm text-muted-foreground">
                You can use your own name if you haven't picked one yet. This won't be your official registered name.
              </p>
              <Input
                id="businessName"
                aria-label="Business name (optional)"
                className="mt-6 h-12 rounded-xl bg-white text-base"
                placeholder="e.g. Maria's Karinderya, Juan's Bakery…"
                autoComplete="organization"
                value={values.businessName}
                onChange={(e) => {
                  setValue('businessName', e.target.value)
                  if (e.target.value.length <= 100) clearError('businessName')
                }}
                aria-describedby={errors.businessName ? 'businessName-help businessName-error' : 'businessName-help'}
                aria-invalid={!!errors.businessName}
              />
              {errors.businessName && <FieldError id="businessName-error" message={errors.businessName} />}
              <Actions>
                <Tap>
                  <Button type="button" variant="secondary" className="h-12 flex-1 rounded-xl text-[15px]" onClick={next}>
                    Skip for now
                  </Button>
                </Tap>
                {nextButton}
              </Actions>
            </form>
          </StepFrame>
        )

      case 'type':
        return (
          <StepFrame key={step} title="What type of business is it?" dir={travel.dir} focusField={focusField}>
            <form onSubmit={submitStep('businessType')} noValidate>
              <p className="text-sm text-muted-foreground">Choose the structure that best fits how you run your business.</p>
              {choiceGroup(
                'businessType',
                'Business type',
                options.businessTypes.map((type, i) => (
                  <ChoiceCard
                    key={type}
                    value={type}
                    id={`type-${type}`}
                    icon={TYPE_ICONS[type] ?? User}
                    title={type}
                    description={TYPE_DESCRIPTIONS[type]}
                    selected={values.businessType === type}
                    index={i}
                    invalid={!!errors.businessType}
                  />
                )),
              )}
              <Actions>{nextButton}</Actions>
            </form>
          </StepFrame>
        )

      case 'category':
        return (
          <StepFrame key={step} title="What does your business do?" dir={travel.dir} focusField={focusField}>
            <form onSubmit={submitStep('categoryId')} noValidate>
              <p className="text-sm text-muted-foreground">
                Pick the category that best describes what your business does. This helps us find the right permits for you.
              </p>
              {choiceGroup(
                'categoryId',
                'Business category',
                options.categories.map((cat, i) => (
                  <ChoiceCard
                    key={cat.id}
                    value={cat.id}
                    id={`category-${cat.id}`}
                    icon={CATEGORY_ICONS[cat.name] ?? Store}
                    title={cat.name}
                    description={cat.description ?? undefined}
                    selected={values.categoryId === cat.id}
                    index={i}
                    invalid={!!errors.categoryId}
                  />
                )),
              )}
              <Actions>{nextButton}</Actions>
            </form>
          </StepFrame>
        )

      case 'status':
        return (
          <StepFrame key={step} title="Where are you in the process?" dir={travel.dir} focusField={focusField}>
            <form onSubmit={submitStep('registrationStatus')} noValidate>
              <p className="text-sm text-muted-foreground">
                This helps us skip steps you've already done and show you what's next.
              </p>
              {choiceGroup(
                'registrationStatus',
                'Registration status',
                options.registrationStatuses.map((status, i) => {
                  const copy = STATUS_COPY[status]
                  return (
                    <ChoiceCard
                      key={status}
                      value={status}
                      id={`status-${status}`}
                      icon={copy?.icon ?? Compass}
                      title={copy?.label ?? status}
                      description={copy?.description}
                      selected={values.registrationStatus === status}
                      index={i}
                      invalid={!!errors.registrationStatus}
                    />
                  )
                }),
                'sm:grid-cols-1',
              )}
              <Actions>{nextButton}</Actions>
            </form>
          </StepFrame>
        )

      case 'review':
        return (
          <StepFrame key={step} title="Here's your route." dir={travel.dir} focusField={false}>
            {saveNetworkError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>We couldn't save your answers.</AlertTitle>
                <AlertDescription className="mt-2 flex flex-col items-start gap-3">
                  Something went wrong on our end. Your answers are still here — don't refresh the page.
                  <Button variant="outline" className="h-11" onClick={save} disabled={saveMutation.isPending}>
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">Check your answers before we build your roadmap.</p>
            <dl className="mt-4 divide-y divide-border rounded-2xl border bg-cream/50 px-4">
              {reviewRows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="flex min-h-14 items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-brand">{row.label}</dt>
                    <dd className={`break-words text-[15px] ${row.muted ? 'text-muted-foreground' : 'font-medium text-navy'}`}>
                      {row.value}
                    </dd>
                  </div>
                  {row.to && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 shrink-0 px-3 text-brand"
                      aria-label={`Edit ${row.label.toLowerCase()}`}
                      onClick={() => edit(row.to!)}
                    >
                      Edit
                    </Button>
                  )}
                </motion.div>
              ))}
            </dl>
            <motion.div className="mt-6" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={save}
                disabled={saveMutation.isPending}
                className="h-12 w-full rounded-xl bg-navy text-[15px] font-bold text-white hover:bg-navy/90"
              >
                {saveMutation.isPending ? (
                  <>
                    Saving…
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Save and continue
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </motion.div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <strong>Pasig City only</strong> for now. You can change your answers later.
            </p>
          </StepFrame>
        )
    }
  }

  return (
    <div className="flex flex-col items-center px-3 py-6 sm:px-4 sm:py-10">
      <motion.div
        id="assessment-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[640px] rounded-3xl bg-white p-5 shadow-lg shadow-navy/10 sm:p-8"
      >
        {isLoading && (
          <>
            <h1 className="sr-only">Business assessment</h1>
            <p className="animate-pulse py-10 text-center text-sm text-muted-foreground">Loading form…</p>
          </>
        )}

        {isError && (
          <>
            <h1 className="sr-only">Business assessment</h1>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Couldn't load the form</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col items-start gap-3">
                Something went wrong while fetching form data.
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    void refetchOptions()
                    void refetchProfile()
                  }}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </>
        )}

        {ready && (
          <>
            {step !== 'intro' && <RouteProgress labels={PROGRESS_LABELS} current={stepIndex - 1} />}
            <div className="-mx-1 overflow-x-clip px-1 pb-1">
              <AnimatePresence mode="wait" custom={travel.dir}>
                {renderStep()}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
