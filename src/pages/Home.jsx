import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeedCard from '../components/FeedCard.jsx'
import FeedTopTabs from '../components/FeedTopTabs.jsx'
import HomePanel from '../components/HomePanel.jsx'
import { selectAllProjects } from '../features/projects/projectsSlice.js'

export default function Home() {
  const projects = useSelector(selectAllProjects)
  const [tab, setTab] = useState('forYou')
  const [activeId, setActiveId] = useState(projects[0]?.id ?? null)

  const containerRef = useRef(null)
  const cardRefs = useRef({})
  const projectIdsKey = projects.map((p) => p.id).join(',')

  useEffect(() => {
    if (tab !== 'forYou') return
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (mostVisible) {
          setActiveId(mostVisible.target.dataset.projectId)
        }
      },
      { root: container, threshold: [0.6] },
    )

    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [projectIdsKey, tab])

  return (
    <div className="relative h-dvh lg:mx-auto lg:max-w-[420px] lg:py-4">
      <FeedTopTabs active={tab} onChange={setTab} />

      {tab === 'home' ? (
        <HomePanel onOpenFeed={() => setTab('forYou')} />
      ) : projects.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-navy px-8 text-center lg:rounded-2xl">
          <Compass size={24} strokeWidth={1.75} className="text-white/70" />
          <p className="text-[14px] text-white/80">No builds published yet.</p>
          <Link to="/add-project" className="text-[14px] font-medium text-orange">
            Be the first to share one →
          </Link>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto lg:rounded-2xl"
        >
          {projects.map((project) => (
            <FeedCard
              key={project.id}
              project={project}
              isActive={tab === 'forYou' && project.id === activeId}
              ref={(el) => {
                cardRefs.current[project.id] = el
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
