import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      focusFirstError(clientErrors)
      return
    }

    try {
      // TODO: FE-03 — send PUT /api/business-profile, handle success navigation
      //   and prefill. For now validation is complete; network call goes here.
      void values // prevent unused-var lint warning until FE-03
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        try {
          const body = JSON.parse(err.body) as { errors?: Record<string, string[]> }
          const serverErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(body.errors ?? {})) {
            if (messages[0]) serverErrors[field] = messages[0]
          }
          if (Object.keys(serverErrors).length > 0) {
            setErrors(serverErrors)
            focusFirstError(serverErrors)
            return
          }
        } catch {
          // unparseable 400 body — fall through
        }
      }
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-[#1c2b3a] mb-2">Business Assessment</h1>
        <p className="text-[#6b7a8d] mb-6 text-sm">
          Tell us about your business so we can build your personalized registration roadmap.
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
            <CardHeader>
              <CardTitle className="text-[#1a3a6b]">Your Business</CardTitle>
              <CardDescription>All fields except Business Name are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name <span className="text-[#6b7a8d] font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="businessName"
                    ref={businessNameRef}
                    placeholder="e.g. Aling Nena's Sari-Sari Store"
                    autoComplete="organization"
                    value={values.businessName}
                    onChange={(e) => {
                      setValues((prev) => ({ ...prev, businessName: e.target.value }))
                      if (e.target.value.length <= 100) clearError('businessName')
                    }}
                    aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                    aria-invalid={!!errors.businessName}
                  />
                  {errors.businessName && (
                    <p id="businessName-error" className="text-sm text-destructive">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <RadioGroup
                    ref={businessTypeRef}
                    className="space-y-2"
                    value={values.businessType}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, businessType: value }))
                      clearError('businessType')
                    }}
                    aria-describedby={errors.businessType ? 'businessType-error' : undefined}
                  >
                    {options.businessTypes.map((type) => (
                      <div key={type} className="flex items-center gap-3">
                        <RadioGroupItem value={type} id={`type-${type}`} />
                        <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.businessType && (
                    <p id="businessType-error" className="text-sm text-destructive">
                      {errors.businessType}
                    </p>
                  )}
                </div>

                {/* Business Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Business Category</Label>
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
                      aria-describedby={errors.categoryId ? 'categoryId-error' : undefined}
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
                  {errors.categoryId && (
                    <p id="categoryId-error" className="text-sm text-destructive">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                {/* Registration Status */}
                <div className="space-y-2">
                  <Label>Registration Status</Label>
                  <RadioGroup
                    ref={registrationStatusRef}
                    className="space-y-2"
                    value={values.registrationStatus}
                    onValueChange={(value) => {
                      setValues((prev) => ({ ...prev, registrationStatus: value }))
                      clearError('registrationStatus')
                    }}
                    aria-describedby={errors.registrationStatus ? 'registrationStatus-error' : undefined}
                  >
                    {options.registrationStatuses.map((status) => (
                      <div key={status} className="flex items-center gap-3">
                        <RadioGroupItem value={status} id={`status-${status}`} />
                        <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.registrationStatus && (
                    <p id="registrationStatus-error" className="text-sm text-destructive">
                      {errors.registrationStatus}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1a3a6b] hover:bg-[#0f1f3d] text-white"
                >
                  Save and continue
                </Button>

              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
