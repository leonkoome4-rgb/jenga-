import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, Search, Trophy, Plus, Inbox, User } from 'lucide-react'
import { selectCurrentUser } from '../features/user/userSlice.js'

export default function BottomNav() {
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)

  const leadingItems = [
    { label: 'Home', to: '/', icon: Home, match: (p) => p === '/' },
    { label: 'Search', to: '/explore', icon: Search, match: (p) => p.startsWith('/explore') },
    { label: 'Leaderboard', to: '/top', icon: Trophy, match: (p) => p.startsWith('/top') },
  ]
  const trailingItems = [
    { label: 'Inbox', to: '/inbox', icon: Inbox, match: (p) => p.startsWith('/inbox') },
    {
      label: 'Profile',
      to: '/profile',
      icon: User,
      match: (p) => p === '/profile' || p === `/creators/${currentUser.id}`,
    },
  ]

  const renderItem = (item) => {
    const isActive = item.match(location.pathname)
    return (
      <Link
        key={item.label}
        to={item.to}
        aria-label={item.label}
        className={`flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 ${
          isActive ? 'text-orange' : 'text-navy'
        }`}
      >
        <item.icon size={22} strokeWidth={1.75} />
      </Link>
    )
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-white px-2 pt-2.5 lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      {leadingItems.map(renderItem)}

      <Link
        to="/add-project"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white"
        aria-label="Add project"
      >
        <Plus size={22} strokeWidth={2.25} />
      </Link>

      {trailingItems.map(renderItem)}
    </nav>
  )
}
