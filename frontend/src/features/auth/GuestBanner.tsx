import { useLocation } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GoogleButton } from '@/components/GoogleButton'
import { useAuth } from '@/app/AuthProvider'
import { useLinkGoogle } from '@/features/auth/useLinkGoogle'

// Shown to guests wherever they can save progress (D20). Linking returns them to this page.
export function GuestBanner() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { link, pending, error } = useLinkGoogle(pathname)

  if (!user?.is_anonymous) return null

  return (
    <div className="border-brand/30 bg-brand/5 flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <p className="text-navy font-semibold">Save your progress with Google so you don't lose it.</p>
      <div className="flex w-full flex-col gap-2 md:w-72 md:shrink-0">
        <GoogleButton onClick={() => void link()} disabled={pending}>
          Save with Google
        </GoogleButton>
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
