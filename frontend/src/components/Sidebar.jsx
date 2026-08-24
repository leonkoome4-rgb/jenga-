import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Search, Trophy, Inbox, User, Plus, ShieldCheck, Sparkles, LogOut } from 'lucide-react'
import Logo from './Logo.jsx'
import { selectCurrentUser } from '../features/user/userSlice.js'
import { selectIsAuthenticated, selectAuthUser, loggedOut } from '../features/auth/authSlice.js'

export default function Sidebar() {
  const dispatch = useDispatch()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authUser = useSelector(selectAuthUser)
  // Admin visibility must come from the real backend role, never the demo
  // mock user (which is hardcoded as an admin for browsing purposes).
  const isAdmin = authUser?.role === 'admin'

  const navItems = [
    { label: 'Home', to: '/', icon: Home, match: (p) => p === '/' },
    { label: 'Explore', to: '/explore', icon: Search, match: (p) => p.startsWith('/explore') },
    { label: 'Leaderboard', to: '/top', icon: Trophy, match: (p) => p.startsWith('/top') },
    { label: 'Inbox', to: '/inbox', icon: Inbox, match: (p) => p.startsWith('/inbox') },
    { label: 'AI Hub', to: '/ai-hub', icon: Sparkles, match: (p) => p.startsWith('/ai-hub') },
    {
      label: 'Profile',
      to: '/profile',
      icon: User,
      match: (p) => p === '/profile' || p === `/creators/${currentUser.id}`,
    },
  ]

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white px-5 py-6 lg:sticky lg:top-0 lg:flex">
      <Logo className="px-3" />

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.match(location.pathname)
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                isActive ? 'font-semibold text-orange' : 'font-medium text-navy hover:text-orange'
              }`}
            >
              <item.icon size={18} strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-6">
        <Link
          to="/add-project"
          className="flex items-center justify-center gap-2 rounded-full bg-orange px-4 py-2.5 text-[14px] font-medium text-white hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.25} />
          New project
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              location.pathname.startsWith('/admin')
                ? 'text-orange'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            <ShieldCheck size={16} strokeWidth={1.75} />
            Admin dashboard
          </Link>
        )}

        <div className="border-t border-border pt-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => dispatch(loggedOut())}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-text-muted hover:text-orange"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Log out{authUser?.name ? ` (${authUser.name})` : ''}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-text-muted hover:text-orange"
            >
              <User size={16} strokeWidth={1.75} />
              Log in
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}
