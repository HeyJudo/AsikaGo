import { Navigate } from 'react-router'
import { useAuth } from '@/app/AuthProvider'
import { FullPageError, FullPageLoader } from '@/components/PageStates'
import { useBusinessProfile, useMe } from '@/lib/queries'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const me = useMe()

  if (loading) return <FullPageLoader />
  if (!session) return <Navigate to="/" replace />

  // /api/me creates the profiles row that business_profiles references; wait for it.
  if (me.isError) return <FullPageError onRetry={() => void me.refetch()} />
  if (!me.isSuccess) return <FullPageLoader />

  return <>{children}</>
}

export function SignedInRedirect() {
  const { data, isPending, isError, refetch } = useBusinessProfile()

  if (isPending) return <FullPageLoader />
  if (isError) return <FullPageError onRetry={() => void refetch()} />

  return <Navigate to={data ? '/my-business' : '/assessment'} replace />
}
