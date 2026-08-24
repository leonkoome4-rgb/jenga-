import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Sparkles } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import Button from '../components/Button.jsx'
import MarketingContent from '../components/MarketingContent.jsx'
import { selectIsAuthenticated } from '../features/auth/authSlice.js'

export default function Landing() {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-navy px-4 py-2 text-center text-[13px] text-white">
        <Sparkles size={13} strokeWidth={2} className="mr-1.5 inline-block text-orange" />
        <span className="font-medium">New:</span> the weekly leaderboard is live —{' '}
        <Link to="/top" className="font-medium text-orange underline underline-offset-2">
          see who's leading your cohort
        </Link>
      </div>

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/discover" className="text-[14px] font-medium text-navy hover:text-orange">
              Discover
            </Link>
            <Link to="/explore" className="text-[14px] font-medium text-navy hover:text-orange">
              Explore
            </Link>
            <Link to="/top" className="text-[14px] font-medium text-navy hover:text-orange">
              Leaderboard
            </Link>
            <a href="#how-it-works" className="text-[14px] font-medium text-navy hover:text-orange">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button to="/discover" variant="primary" className="px-4 py-2">
                Go to feed
              </Button>
            ) : (
              <>
                <Button to="/login" variant="secondary" className="hidden px-4 py-2 sm:inline-flex">
                  Log in
                </Button>
                <Button to="/register" variant="primary" className="px-4 py-2">
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <MarketingContent />

      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-text-secondary">
              <Link to="/discover" className="hover:text-orange">Discover</Link>
              <Link to="/explore" className="hover:text-orange">Explore</Link>
              <Link to="/top" className="hover:text-orange">Leaderboard</Link>
              <Link to="/add-project" className="hover:text-orange">Share your work</Link>
            </nav>
          </div>
          <p className="mt-8 border-t border-border pt-6 text-center text-[13px] text-text-muted sm:text-left">
            &copy; 2026 Moringa &times; Tawi. Where your work branches out.
          </p>
        </div>
      </footer>
    </div>
  )
}
