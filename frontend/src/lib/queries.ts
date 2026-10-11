import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthProvider'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'

export type Me = components['schemas']['MeResponse']
export type BusinessProfile = components['schemas']['BusinessProfileResponse']
export type RoadmapResponse = components['schemas']['RoadmapResponse']

export type StepDetail = components['schemas']['StepDetailResponse']
export type Requirement = components['schemas']['RequirementResponse']

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
  return useQuery<StepDetail | null>({
    queryKey: ['roadmap-step', number],
    queryFn: async () => {
      try {
        return await apiFetch<StepDetail>(`/api/roadmap/steps/${number}`)
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

export function useRoadmap() {
  return useQuery<RoadmapResponse | null>({
    queryKey: ['roadmap'],
    queryFn: async () => {
      try {
        return await apiFetch<RoadmapResponse>('/api/roadmap')
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
