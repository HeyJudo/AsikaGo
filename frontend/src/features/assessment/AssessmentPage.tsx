import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Planning: { label: "Planning — I haven't started yet", description: 'I want to know what I need before I begin.' },
  Started: {
    label: "Started — I've done some papers already",
    description: "For example, I've registered my business name or got my barangay clearance.",
  },
}

const OPTION_ROW = 'flex items-start gap-3 rounded-md border p-3 min-h-11 cursor-pointer font-normal leading-normal'

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
  const { data: options, isLoading, isError, refetch } = useAssessmentOptions()

  const [values, setValues] = useState({
    businessName: '',
    businessType: '',
    categoryId: '',
    registrationStatus: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      focusFirstError(clientErrors)
      return
    }

    // FE-03: await apiFetch('/api/business-profile', { method: 'PUT', body: JSON.stringify(...) }); on error call showServerErrors(err), otherwise show the save-failed banner.
    void showServerErrors // remove in FE-03 (keeps tsc noUnusedLocals happy until it is called)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-[#1c2b3a] mb-2">Tell us about your business.</h1>
        <p className="text-[#6b7a8d] mb-6 text-sm">
          We'll use this to build your registration roadmap — it only takes a minute.
        </p>

        {isLoading && (
          <Card>
            <CardContent className="py-10 text-center text-[#6b7a8d] text-sm">
              Loading options…
            </CardContent>
          </Card>
        )}

        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load options</AlertTitle>
            <AlertDescription className="flex items-center gap-3 mt-2">
              Something went wrong while fetching form options.
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {options && (
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-[#6b7a8d] font-normal">(optional)</span>
                  </Label>
                  <p id="businessName-help" className="text-sm text-[#6b7a8d]">
                    You can use your own name if you haven't picked one yet. This won't be your official registered name.
                  </p>
                  <Input
                    id="businessName"
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
                    Business Type <span aria-hidden="true">*</span>
                  </Label>
                  <p id="businessType-help" className="text-sm text-[#6b7a8d]">
                    Choose the structure that best fits how you run your business.
                  </p>
                  <RadioGroup
                    ref={businessTypeRef}
                    className="space-y-2"
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
                      <Label key={type} htmlFor={`type-${type}`} className={OPTION_ROW}>
                        <RadioGroupItem value={type} id={`type-${type}`} className="mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium">{type}</span>
                          {TYPE_DESCRIPTIONS[type] && (
                            <span className="block text-sm text-[#6b7a8d]">{TYPE_DESCRIPTIONS[type]}</span>
                          )}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                  {errors.businessType && <FieldError id="businessType-error" message={errors.businessType} />}
                </div>

                {/* Business Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Business Category <span aria-hidden="true">*</span>
                  </Label>
                  <p id="categoryId-help" className="text-sm text-[#6b7a8d]">
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
                    Where are you in the process? <span aria-hidden="true">*</span>
                  </Label>
                  <p id="registrationStatus-help" className="text-sm text-[#6b7a8d]">
                    This helps us skip steps you've already done and show you what's next.
                  </p>
                  <RadioGroup
                    ref={registrationStatusRef}
                    className="space-y-2"
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
                      <Label key={status} htmlFor={`status-${status}`} className={OPTION_ROW}>
                        <RadioGroupItem value={status} id={`status-${status}`} className="mt-0.5" />
                        <span>
                          <span className="block text-sm font-medium">{STATUS_COPY[status]?.label ?? status}</span>
                          {STATUS_COPY[status] && (
                            <span className="block text-sm text-[#6b7a8d]">{STATUS_COPY[status].description}</span>
                          )}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                  {errors.registrationStatus && (
                    <FieldError id="registrationStatus-error" message={errors.registrationStatus} />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1a3a6b] hover:bg-[#0f1f3d] text-white"
                >
                  Save and continue
                </Button>
                <p className="text-center text-sm text-[#6b7a8d]">
                  <strong>Pasig City only</strong> for now. You can change your answers later.
                </p>

              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
