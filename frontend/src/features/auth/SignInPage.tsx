import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { FullPageLoader } from '@/components/PageStates'
import { SignedInRedirect } from '@/components/ProtectedRoute'
import { SignInPanel } from '@/features/auth/SignInPanel'

export function SignInPage() {
  const { session, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (session) return <SignedInRedirect />

  return (
    <SignInPanel as="h1" className="min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-5rem)]">
      <Link
        to="/"
        className="text-navy mb-4 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </SignInPanel>
  )
}
