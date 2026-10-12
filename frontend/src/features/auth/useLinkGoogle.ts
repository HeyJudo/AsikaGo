import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Links Google to the current guest account. Supabase keeps the same user id.
export function useLinkGoogle(redirectPath: string) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
