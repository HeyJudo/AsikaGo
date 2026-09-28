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
            <GoogleIcon />
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

// Official Google "G" mark (brand colors are required by Google's sign-in guidelines).
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
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
