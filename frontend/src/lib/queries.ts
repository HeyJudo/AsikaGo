import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthProvider'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'

export type Me = components['schemas']['MeResponse']
export type BusinessProfile = components['schemas']['BusinessProfileResponse']

export interface SourceResponse {
  name: string
  url: string
  dateVerified: string
}

export interface RequirementResponse {
  id?: string
  name: string
  description: string | null
  appliesTo: string | null
  source: SourceResponse | null
}

export interface StepDetailResponse {
  number: number
  totalSteps: number
  stepId?: string
  name: string
  agency: string
  description: string
  actions: string[]
  conditionNote: string | null
  requirements: RequirementResponse[]
  previousNumber: number | null
  nextNumber: number | null
}

// GET /api/me also creates the profiles row that business_profiles references.
export function useMe() {
  const { user } = useAuth()
  return useQuery<Me>({
    queryKey: ['me', user?.id],
    queryFn: () => apiFetch<Me>('/api/me'),
    enabled: !!user,
  })
}

export function useBusinessProfile() {
  return useQuery<BusinessProfile | null>({
    queryKey: ['business-profile'],
    queryFn: async () => {
      try {
        return await apiFetch<BusinessProfile>('/api/business-profile')
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }
    },
    retry: (failCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false
      return failCount < 3
    },
  })
}

export function useRoadmapStep(number: number) {
  return useQuery<StepDetailResponse | null>({
    queryKey: ['roadmap-step', number],
    queryFn: async () => {
      try {
        return await apiFetch<StepDetailResponse>(`/api/roadmap/steps/${number}`)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null
        throw err
      }
    },
    enabled: !isNaN(number) && number > 0,
    retry: (failCount, err) => {
      if (err instanceof ApiError && err.status === 404) return false
      return failCount < 3
    },
  })
}
