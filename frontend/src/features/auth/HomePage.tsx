import { useAuth } from '@/app/AuthProvider'
import { FullPageLoader } from '@/components/PageStates'
import { GoogleButton } from '@/components/GoogleButton'
import { SignedInRedirect } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function HomePage() {
  const { session, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (session) return <SignedInRedirect />

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold">AsikaGo</h1>
        <p className="text-muted-foreground mt-1">
          Your step-by-step guide to registering your business.
        </p>
      </div>

      <div className="flex gap-3">
        <GoogleButton
          className="w-auto"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin },
            })
          }
        />
        <Button variant="outline" onClick={() => supabase.auth.signInAnonymously()}>
          Continue as guest
        </Button>
      </div>
    </div>
  )
}
