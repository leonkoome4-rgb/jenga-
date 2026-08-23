import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import FilterChips from '../components/FilterChips.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { categories, allCategoriesLabel } from '../data/categories.js'
import { cohorts } from '../data/cohorts.js'
import { selectAllProjects } from '../features/projects/projectsSlice.js'
import {
  selectFilters,
  categoryChanged,
  searchChanged,
  cohortChanged,
} from '../features/filters/filtersSlice.js'

const chipOptions = [allCategoriesLabel, ...categories]

function matchesFilters(project, { category, search, cohort }) {
  const inCategory = category === allCategoriesLabel || project.category === category
  const inCohort = cohort === 'All cohorts' || project.cohort === cohort
  const query = search.trim().toLowerCase()
  const inSearch =
    !query ||
    project.name.toLowerCase().includes(query) ||
    project.description.toLowerCase().includes(query) ||
    project.techStack.some((t) => t.toLowerCase().includes(query)) ||
    project.owner.name.toLowerCase().includes(query)
  return inCategory && inCohort && inSearch
}

export default function Explore() {
  const dispatch = useDispatch()
  const allProjects = useSelector(selectAllProjects)
  const filters = useSelector(selectFilters)

  const results = useMemo(
    () => allProjects.filter((p) => matchesFilters(p, filters)),
    [allProjects, filters],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <h1 className="font-heading text-[24px] font-bold text-navy">Explore</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Search across every build, technology, and creator on Tawi.
      </p>

      <SearchBar
        value={filters.search}
        onChange={(v) => dispatch(searchChanged(v))}
        className="mt-6"
      />

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips
          options={chipOptions}
          active={filters.category}
          onChange={(c) => dispatch(categoryChanged(c))}
        />

        <div className="relative shrink-0">
          <select
            value={filters.cohort}
            onChange={(e) => dispatch(cohortChanged(e.target.value))}
            className="appearance-none rounded-full border-[1.5px] border-navy/70 bg-white py-2 pl-4 pr-9 text-[13px] font-medium text-navy focus:outline-none"
          >
            <option>All cohorts</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>
      </div>

      <p className="mt-6 text-[13px] text-text-muted">
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>

      {results.length === 0 ? (
        <p className="mt-16 text-center text-[14px] text-text-secondary">
          No builds match your search.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
