import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type AssessmentOptions = components['schemas']['AssessmentOptionsResponse']

function useAssessmentOptions() {
  return useQuery<AssessmentOptions>({
    queryKey: ['assessment', 'options'],
    queryFn: () => apiFetch<AssessmentOptions>('/api/assessment/options'),
  })
}

export function AssessmentPage() {
  const { data: options, isLoading, isError, refetch } = useAssessmentOptions()

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
            <CardContent className="space-y-6">

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-[#6b7a8d] font-normal">(optional)</span>
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Aling Nena's Sari-Sari Store"
                  autoComplete="organization"
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label>Business Type</Label>
                <RadioGroup className="space-y-2">
                  {options.businessTypes.map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <RadioGroupItem value={type} id={`type-${type}`} />
                      <Label htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Business Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Business Category</Label>
                <Select>
                  <SelectTrigger id="category">
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
              </div>

              {/* Registration Status */}
              <div className="space-y-2">
                <Label>Registration Status</Label>
                <RadioGroup className="space-y-2">
                  {options.registrationStatuses.map((status) => (
                    <div key={status} className="flex items-center gap-3">
                      <RadioGroupItem value={status} id={`status-${status}`} />
                      <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                disabled
                className="w-full bg-[#1a3a6b] hover:bg-[#0f1f3d] text-white"
              >
                Continue
              </Button>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
