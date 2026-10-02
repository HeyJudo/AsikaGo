import { Link } from 'react-router'
import { motion } from 'motion/react'
import { AlertCircle, Loader2, MapPinOff, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 p-8 text-center"
    >
      {children}
    </motion.div>
  )
}

export function FullPageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <Centered>
      <div role="status" className="flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </div>
    </Centered>
  )
}

export function FullPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <Centered>
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      </span>
      <h1 className="text-navy text-xl font-bold">Something went wrong.</h1>
      <p className="text-muted-foreground max-w-sm text-sm">We couldn't load this page. Check your connection and try again.</p>
      <Button className="h-11 rounded-full px-6 font-semibold" onClick={onRetry}>
        <RotateCw aria-hidden="true" />
        Retry
      </Button>
    </Centered>
  )
}

export function NotFoundPage() {
  return (
    <Centered>
      <span className="flex size-16 items-center justify-center rounded-full bg-gold/20">
        <MapPinOff className="size-8 text-brand" aria-hidden="true" />
      </span>
      <h1 className="text-navy text-xl font-bold">Page not found.</h1>
      <p className="text-muted-foreground max-w-sm text-sm">This stop isn't on the route. Let's get you back on track.</p>
      <Button asChild className="h-11 rounded-full px-6 font-semibold">
        <Link to="/">Back to home</Link>
      </Button>
    </Centered>
  )
}
