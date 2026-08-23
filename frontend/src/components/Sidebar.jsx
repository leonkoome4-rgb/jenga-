import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Search, Trophy, Inbox, User, Plus, ShieldCheck } from 'lucide-react'
import Logo from './Logo.jsx'
import { categories } from '../data/categories.js'
import { categoryChanged } from '../features/filters/filtersSlice.js'
import { selectCurrentUser, selectIsAdmin } from '../features/user/userSlice.js'

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useSelector(selectCurrentUser)
  const isAdmin = useSelector(selectIsAdmin)

  const navItems = [
    { label: 'Home', to: '/', icon: Home, match: (p) => p === '/' },
    { label: 'Explore', to: '/explore', icon: Search, match: (p) => p.startsWith('/explore') },
    { label: 'Leaderboard', to: '/top', icon: Trophy, match: (p) => p.startsWith('/top') },
    { label: 'Inbox', to: '/inbox', icon: Inbox, match: (p) => p.startsWith('/inbox') },
    {
      label: 'Profile',
      to: '/profile',
      icon: User,
      match: (p) => p === '/profile' || p === `/creators/${currentUser.id}`,
    },
  ]

  const handleCategoryClick = (category) => {
    dispatch(categoryChanged(category))
    navigate('/explore')
  }

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

      <div className="mt-8">
        <p className="px-3 text-[12px] font-medium uppercase tracking-wide text-text-muted">
          Categories
        </p>
        <div className="mt-2 flex flex-col gap-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className="rounded-lg px-3 py-2 text-left text-[14px] text-text-secondary transition-colors hover:text-orange"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

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
      </div>
    </aside>
  )
}
