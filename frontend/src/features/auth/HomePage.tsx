import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthProvider'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import type { components } from '@/lib/api-types'
import { supabase } from '@/lib/supabase'

type Me = components['schemas']['MeResponse']

export function HomePage() {
  const { session, loading } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold">AsikaGo</h1>
        <p className="text-muted-foreground mt-1">
          Your step-by-step guide to registering your business.
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : session ? (
        <SignedIn />
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
              })
            }
          >
            Continue with Google
          </Button>
          <Button variant="outline" onClick={() => supabase.auth.signInAnonymously()}>
            Continue as guest
          </Button>
        </div>
      )}
    </main>
  )
}

function SignedIn() {
  const { user } = useAuth()
  const { data, error, isLoading } = useQuery({
    queryKey: ['me', user?.id],
    queryFn: () => apiFetch<Me>('/api/me'),
  })

  return (
    <div className="flex flex-col items-center gap-4">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && (
        <dl className="text-left text-sm">
          <div>
            <dt className="inline font-medium">id: </dt>
            <dd className="inline">{data.id}</dd>
          </div>
          <div>
            <dt className="inline font-medium">email: </dt>
            <dd className="inline">{data.email ?? 'Guest'}</dd>
          </div>
          <div>
            <dt className="inline font-medium">isAnonymous: </dt>
            <dd className="inline">{String(data.isAnonymous)}</dd>
          </div>
        </dl>
      )}
      <Button variant="outline" onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    </div>
  )
}
