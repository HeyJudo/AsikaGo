import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Links Google to the current guest account. Supabase keeps the same user id.
export function useLinkGoogle(redirectPath: string) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Back from Google can restore this page from the back-forward cache with pending still true.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => { if (e.persisted) setPending(false) }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  async function link() {
    setPending(true)
    setError(null)
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    })
    // On success the browser redirects to Google, so only failures return here.
    if (error) {
      setError(error.message)
      setPending(false)
    }
  }

  return { link, pending, error }
}
