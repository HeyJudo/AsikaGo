import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthProvider'
import { ApiError, apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'

export type Me = components['schemas']['MeResponse']
export type BusinessProfile = components['schemas']['BusinessProfileResponse']
export type RoadmapResponse = components['schemas']['RoadmapResponse']

export type StepDetail = components['schemas']['StepDetailResponse']
export type Requirement = components['schemas']['RequirementResponse']
type RequirementUpdate = { requirementId: string; isPrepared: boolean }

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
  const pending = useMutationState({
    filters: { mutationKey: ['prepare-requirement', number], status: 'pending' },
    select: (mutation) => mutation.state.variables as RequirementUpdate,
  })
  const query = useQuery<StepDetail | null>({
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

  if (!query.data || pending.length === 0) return query

  // Keep pending choices visible even when another save or background refresh returns.
  const requirements = query.data.requirements.map((requirement) => {
    const update = pending.findLast((item) => item.requirementId === requirement.id)
    return update ? { ...requirement, isPrepared: update.isPrepared } : requirement
  })
  const status: StepDetail['status'] = query.data.status === 'Completed' ? 'Completed'
    : requirements.some((item) => item.isPrepared) ? 'InProgress' : 'NotStarted'
  return {
    ...query,
    data: {
      ...query.data,
      requirements,
      status,
    },
  }
}

export function useUpdateRequirement(stepNumber: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['prepare-requirement', stepNumber],
    mutationFn: ({ requirementId, isPrepared }: RequirementUpdate) =>
      apiFetch<void>(`/api/roadmap/requirements/${requirementId}`, {
        method: 'PUT',
        body: JSON.stringify({ isPrepared }),
      }),
    onSuccess: async (_, { requirementId, isPrepared }) => {
      await queryClient.cancelQueries({ queryKey: ['roadmap-step', stepNumber] })
      // Retain a confirmed save even if the following refresh fails.
      queryClient.setQueryData<StepDetail | null>(['roadmap-step', stepNumber], (step) => {
        if (!step) return step
        const requirements = step.requirements.map((item) =>
          item.id === requirementId ? { ...item, isPrepared } : item)
        return {
          ...step,
          requirements,
          status: step.status === 'Completed' ? 'Completed'
            : requirements.some((item) => item.isPrepared) ? 'InProgress' : 'NotStarted',
        }
      })
    },
    onSettled: async (_, error) => {
      const refresh = Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['roadmap-step', stepNumber] }),
        queryClient.invalidateQueries({ queryKey: ['roadmap-documents'] }),
      ])
      // A failed save must roll back immediately, without waiting for a GET.
      if (!error) await refresh
    },
  })
}

export function useUpdateStepStatus(stepNumber: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (completed: boolean) =>
      apiFetch<void>(`/api/roadmap/steps/${stepNumber}/status`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roadmap'] })
      void queryClient.invalidateQueries({ queryKey: ['roadmap-step', stepNumber] })
      void queryClient.invalidateQueries({ queryKey: ['roadmap-documents'] })
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
