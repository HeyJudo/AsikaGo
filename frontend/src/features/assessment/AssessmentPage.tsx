import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ApiError, apiFetch } from '@/lib/api'
import { useBusinessProfile } from '@/lib/queries'
import type { components } from '@/lib/api-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type AssessmentOptions = components['schemas']['AssessmentOptionsResponse']

// Exact wording must match US-001-BE-03 validation messages
const ERROR_MESSAGES = {
  businessType: 'Please choose a business type.',
  categoryId: 'Please choose a business category.',
  registrationStatus: 'Please tell us where you are in the process.',
  businessName: 'Business name must be 100 characters or less.',
} as const

// Wireframe copy, keyed by the exact API strings; unknown values fall back to the raw name
const TYPE_DESCRIPTIONS: Record<string, string> = {
  'Sole Proprietorship': 'You own the business alone. Most small businesses and sari-sari stores start here.',
  Partnership: 'Two or more people run the business together and share profits and responsibilities.',
  Corporation: 'A separate legal entity owned by shareholders. Common for larger or investor-backed businesses.',
  'One Person Corporation':
    'Like a corporation, but owned by a single person. Gives you limited liability without needing co-founders.',
}

const STATUS_COPY: Record<string, { label: string; description: string }> = {
  Planning: { label: "Planning – haven't started", description: 'I want to know what I need before I begin.' },
  Started: {
    label: 'Started – some papers done',
    description: "For example, I've registered my business name or got my barangay clearance.",
  },
}

const TILE =
  'relative flex min-h-14 cursor-pointer items-center justify-center rounded-xl border bg-white px-3 py-2 text-center text-sm font-medium leading-snug transition-colors hover:border-brand/60 ' +
  'has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand has-[[data-state=checked]]:text-white ' +
  'has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand/40'

function OptionDescription({ text }: { text?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {text && (
        <motion.p
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-destructive">
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

export function AssessmentPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: options, isLoading: optionsLoading, isError: optionsError, refetch: refetchOptions } = useAssessmentOptions()

  const { data: profile, isLoading: profileLoading, isError: profileError, refetch: refetchProfile } = useBusinessProfile()

  const [values, setValues] = useState({
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


  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveNetworkError, setSaveNetworkError] = useState(false)

  // Refs for focus management after failed submit — RadioGroup refs point to
  // the wrapper div; we call .querySelector('button') to reach the first item.
  const businessNameRef = useRef<HTMLInputElement>(null)
  const businessTypeRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLButtonElement>(null)
  const registrationStatusRef = useRef<HTMLDivElement>(null)

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    setSaveNetworkError(false)
  }

  function focusFirstError(errs: Record<string, string>) {
    if (errs.businessName) {
      businessNameRef.current?.focus()
    } else if (errs.businessType) {
      businessTypeRef.current?.querySelector('button')?.focus()
    } else if (errs.categoryId) {
      categoryRef.current?.focus()
    } else if (errs.registrationStatus) {
      registrationStatusRef.current?.querySelector('button')?.focus()
    }
  }

  function validate() {
    const errs: Record<string, string> = {}

    if (!values.businessType) errs.businessType = ERROR_MESSAGES.businessType
    if (!values.categoryId) errs.categoryId = ERROR_MESSAGES.categoryId
    if (!values.registrationStatus) errs.registrationStatus = ERROR_MESSAGES.registrationStatus
    if (values.businessName.length > 100) errs.businessName = ERROR_MESSAGES.businessName

    return errs
  }

  // Maps a 400 response to field errors; returns true if at least one was mapped.
  function showServerErrors(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 400) return false
    try {
      const body = JSON.parse(err.body) as { errors?: Record<string, string[]> }
      const serverErrors: Record<string, string> = {}
      for (const [field, messages] of Object.entries(body.errors ?? {})) {
        if (messages[0]) serverErrors[field] = messages[0]
      }
      if (Object.keys(serverErrors).length === 0) return false
      setErrors(serverErrors)
      focusFirstError(serverErrors)
      return true
    } catch {
      return false // unparseable 400 body
    }
  }

  const saveMutation = useMutation({
    mutationFn: (payload: typeof values) => apiFetch('/api/business-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      // Navigate to /my-business
      void navigate('/my-business')
    },
    onError: (err) => {
      const is400 = showServerErrors(err)
      if (!is400) {
        setSaveNetworkError(true)
      }
    }
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveNetworkError(false)

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      focusFirstError(clientErrors)
      return
    }

    saveMutation.mutate(values)
  }

  const isLoading = optionsLoading || profileLoading
  const isError = optionsError || profileError

  return (
    <div className="flex flex-col items-center px-3 py-6 sm:px-4 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[640px] rounded-2xl bg-white p-5 shadow-lg shadow-navy/10 sm:p-8"
      >
        <div>
            {saveNetworkError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>We couldn't save your answers.</AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-3 mt-2">
                  Something went wrong on our end. Your answers are still here — don't refresh the page.
                  <Button variant="outline" className="h-11" onClick={() => saveMutation.mutate(values)} disabled={saveMutation.isPending}>
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">Stop 1 · Pasig City</p>
            <h1 className="text-2xl font-bold text-navy mb-2">Tell us about your business.</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              We'll use this to build your registration roadmap — it only takes a minute.
            </p>

            {isLoading && (
              <p className="animate-pulse py-10 text-center text-muted-foreground text-sm">Loading form…</p>
            )}

            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Couldn't load the form</AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-3 mt-2">
                  Something went wrong while fetching form data.
                  <Button variant="outline" className="h-11" onClick={() => {
                    void refetchOptions()
                    void refetchProfile()
                  }}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!(isLoading || isError) && options && (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <p id="businessName-help" className="text-sm text-muted-foreground">
                    You can use your own name if you haven't picked one yet. This won't be your official registered name.
                  </p>
                  <Input
                    id="businessName"
                    className="h-11 rounded-lg bg-white"
                    ref={businessNameRef}
                    placeholder="e.g. Maria's Karinderya, Juan's Bakery…"
                    autoComplete="organization"
                    value={values.businessName}
                    onChange={(e) => {
                      setValues((prev) => ({ ...prev, businessName: e.target.value }))
                      if (e.target.value.length <= 100) clearError('businessName')
                    }}
                    aria-describedby={errors.businessName ? 'businessName-help businessName-error' : 'businessName-help'}
                    aria-invalid={!!errors.businessName}
                  />
                  {errors.businessName && <FieldError id="businessName-error" message={errors.businessName} />}
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label id="businessType-label">
                    Business Type <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <p id="businessType-help" className="text-sm text-muted-foreground">
                    Choose the structure that best fits how you run your business.
                  </p>
                  <RadioGroup
                    ref={businessTypeRef}
                    className={`grid grid-cols-2 gap-2 ${errors.businessType ? '[&_label]:border-destructive' : ''}`}
                    value={values.businessType}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, businessType: value }))
                      clearError('businessType')
                    }}
                    aria-labelledby="businessType-label"
                    aria-invalid={!!errors.businessType}
                    aria-describedby={errors.businessType ? 'businessType-help businessType-error' : 'businessType-help'}
                  >
                    {options.businessTypes.map((type) => (
                      <Label key={type} htmlFor={`type-${type}`} className={TILE}>
                        <RadioGroupItem value={type} id={`type-${type}`} className="absolute inset-0 size-full opacity-0" />
                        {type}
                      </Label>
                    ))}
                  </RadioGroup>
                  <OptionDescription text={TYPE_DESCRIPTIONS[values.businessType]} />
                  {errors.businessType && <FieldError id="businessType-error" message={errors.businessType} />}
                </div>

                {/* Business Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Business Category <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <p id="categoryId-help" className="text-sm text-muted-foreground">
                    Pick the category that best describes what your business does. This helps us find the right permits for you.
                  </p>
                  <Select
                    value={values.categoryId}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, categoryId: value }))
                      clearError('categoryId')
                    }}
                  >
                    <SelectTrigger
                      id="category"
                      className="w-full rounded-lg bg-white data-[size=default]:h-11"
                      ref={categoryRef}
                      aria-describedby={errors.categoryId ? 'categoryId-help categoryId-error' : 'categoryId-help'}
                      aria-invalid={!!errors.categoryId}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <FieldError id="categoryId-error" message={errors.categoryId} />}
                </div>

                {/* Registration Status */}
                <div className="space-y-2">
                  <Label id="registrationStatus-label">
                    Where are you in the process? <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <p id="registrationStatus-help" className="text-sm text-muted-foreground">
                    This helps us skip steps you've already done and show you what's next.
                  </p>
                  <RadioGroup
                    ref={registrationStatusRef}
                    className={`grid grid-cols-2 gap-2 ${errors.registrationStatus ? '[&_label]:border-destructive' : ''}`}
                    value={values.registrationStatus}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, registrationStatus: value }))
                      clearError('registrationStatus')
                    }}
                    aria-labelledby="registrationStatus-label"
                    aria-invalid={!!errors.registrationStatus}
                    aria-describedby={
                      errors.registrationStatus ? 'registrationStatus-help registrationStatus-error' : 'registrationStatus-help'
                    }
                  >
                    {options.registrationStatuses.map((status) => (
                      <Label key={status} htmlFor={`status-${status}`} className={TILE}>
                        <RadioGroupItem value={status} id={`status-${status}`} className="absolute inset-0 size-full opacity-0" />
                        {STATUS_COPY[status]?.label ?? status}
                      </Label>
                    ))}
                  </RadioGroup>
                  <OptionDescription text={STATUS_COPY[values.registrationStatus]?.description} />
                  {errors.registrationStatus && (
                    <FieldError id="registrationStatus-error" message={errors.registrationStatus} />
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="w-full h-12 rounded-xl text-[15px] font-bold bg-navy hover:bg-navy/90 text-white"
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
                <p className="text-center text-sm text-muted-foreground">
                  <strong>Pasig City only</strong> for now. You can change your answers later.
                </p>

              </form>
            )}
        </div>
      </motion.div>
    </div>
  )
}
