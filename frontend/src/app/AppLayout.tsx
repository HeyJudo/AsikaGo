import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { ArrowUpRight, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/app/AuthProvider'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import logo from '@/assets/logo-white.png'

const NAV_LINK =
  'hidden min-h-11 items-center rounded-sm px-1 text-sm font-semibold text-white decoration-gold decoration-2 underline-offset-8 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white md:inline-flex'

function SiteHeader() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const onSignIn = useLocation().pathname === '/sign-in'

  async function signOut() {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 bg-brand px-4 shadow-md md:h-20 md:px-8">
      <Link
        to="/"
        className="flex min-h-11 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <img src={logo} alt="AsikaGo" className="h-8 w-auto sm:h-9 md:h-12" />
      </Link>

      {!loading &&
        (user ? (
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-gold text-navy flex size-10 shrink-0 items-center justify-center rounded-full">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden min-w-0 max-w-48 truncate text-sm font-semibold text-white sm:block">
              {user.email || 'Guest'}
            </span>
            <Button
              variant="outline"
              className="h-11 shrink-0 rounded-full border-white bg-transparent px-4 font-semibold text-white hover:bg-white/15 hover:text-white focus-visible:border-white focus-visible:ring-white/50 dark:bg-transparent dark:hover:bg-white/15"
              onClick={() => void signOut()}
            >
              <LogOut aria-hidden="true" />
              Sign Out
            </Button>
          </div>
        ) : (
          <nav className="flex items-center gap-6">
            <a href="/#how-it-works" className={NAV_LINK}>
              How it Works
            </a>
            <a href="/#faq" className={NAV_LINK}>
              FAQ
            </a>
            <Link
              to="/sign-in"
              className={NAV_LINK}
              aria-current={onSignIn ? 'page' : undefined}
            >
              Sign in
            </Link>
            {!onSignIn && (
              <Link
                to="/sign-in"
                className="bg-gold text-navy inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-3 text-xs font-bold sm:px-4 sm:text-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white md:px-6"
              >
                Start My Roadmap
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </nav>
        ))}
    </header>
  )
}

export function AppLayout() {
  const location = useLocation()

  return (
    <>
      <SiteHeader />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
    </>
  )
}
