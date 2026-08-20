import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Play, Search, Trophy, Plus, Inbox } from 'lucide-react'
import TrustStatBand from './TrustStatBand.jsx'
import ProjectCard from './ProjectCard.jsx'
import Button from './Button.jsx'
import { selectAllProjects } from '../features/projects/projectsSlice.js'
import { selectCurrentUser } from '../features/user/userSlice.js'

const quickLinks = [
  { label: 'Leaderboard', to: '/top', icon: Trophy },
  { label: 'Add project', to: '/add-project', icon: Plus },
  { label: 'Inbox', to: '/inbox', icon: Inbox },
]

export default function HomePanel({ onOpenFeed }) {
  const currentUser = useSelector(selectCurrentUser)
  const topProjects = useSelector((state) =>
    [...selectAllProjects(state)].sort((a, b) => b.likes - a.likes).slice(0, 3),
  )

  return (
    <div className="h-full overflow-y-auto lg:rounded-2xl">
      <div className="bg-navy px-6 pb-10 pt-[calc(env(safe-area-inset-top)+84px)] text-center">
        <p className="text-[13px] font-medium text-white/60">Hey {currentUser.name.split(' ')[0]},</p>
        <h1 className="font-heading mt-1 text-[28px] font-bold leading-[1.15] text-white">
          Your work.
          <br />
          Your reputation.
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-white/70">
          Every build you publish is a chance to stand out — to classmates sizing up the
          competition, and to the people hiring.
        </p>

        <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2.5">
          <Button variant="primary" onClick={onOpenFeed} className="w-full">
            <Play size={14} strokeWidth={2} className="fill-current" />
            Start scrolling — For You
          </Button>
          <Link
            to="/explore"
            className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-white/10"
          >
            <Search size={14} strokeWidth={1.75} />
            Explore & search
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-6 py-6">
        {quickLinks.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white px-2 py-4 text-center"
          >
            <Icon size={18} strokeWidth={1.75} className="text-orange" />
            <span className="text-[12px] font-medium text-navy">{label}</span>
          </Link>
        ))}
      </div>

      <TrustStatBand />

      {topProjects.length > 0 && (
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[16px] font-semibold text-navy">Top rated</h2>
            <Link to="/top" className="text-[13px] font-medium text-orange">
              See all →
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-6">
            {topProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
