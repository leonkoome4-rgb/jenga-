import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Trophy } from 'lucide-react'
import ProjectCard from '../components/ProjectCard.jsx'
import FilterChips from '../components/FilterChips.jsx'
import { selectAllProjects } from '../features/projects/projectsSlice.js'
import { cohorts } from '../data/cohorts.js'

const ALL_COHORTS = 'All cohorts'
const chipOptions = [ALL_COHORTS, ...cohorts]

export default function TopRated() {
  const allProjects = useSelector(selectAllProjects)
  const [cohort, setCohort] = useState(ALL_COHORTS)

  const topProjects = useMemo(() => {
    const filtered =
      cohort === ALL_COHORTS ? allProjects : allProjects.filter((p) => p.cohort === cohort)
    return [...filtered].sort((a, b) => b.likes - a.likes)
  }, [allProjects, cohort])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <div className="flex items-center gap-2.5">
        <Trophy size={22} strokeWidth={1.75} className="text-orange" />
        <h1 className="font-heading text-[24px] font-bold text-navy">Leaderboard</h1>
      </div>
      <p className="mt-1 text-[14px] text-text-secondary">
        Ranked by likes. See who's leading across all of Tawi, or narrow it down to your own
        cohort.
      </p>

      <FilterChips options={chipOptions} active={cohort} onChange={setCohort} className="mt-6" />

      {topProjects.length === 0 ? (
        <p className="mt-16 text-center text-[14px] text-text-secondary">
          No builds in this cohort yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topProjects.map((project, i) => (
            <div key={project.id} className="relative">
              {i < 3 && (
                <span className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-orange text-[13px] font-bold text-white shadow-sm">
                  {i + 1}
                </span>
              )}
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
