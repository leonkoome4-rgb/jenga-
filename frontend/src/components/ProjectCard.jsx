import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Heart } from 'lucide-react'
import ImagePlaceholder from './ImagePlaceholder.jsx'
import Avatar from './Avatar.jsx'
import { toggleProjectLike } from '../features/projects/projectsSlice.js'
import { selectAuthToken } from '../features/auth/authSlice.js'

const TINTS = ['#4FA3DC', '#F1793D']

export default function ProjectCard({ project, index = 0 }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector(selectAuthToken)
  const tint = TINTS[index % TINTS.length]

  const handleLike = () => {
    if (!token) {
      navigate('/login')
      return
    }
    dispatch(toggleProjectLike(project.id))
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="relative">
        <Link to={`/projects/${project.id}`} className="block">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <ImagePlaceholder className="aspect-[16/10] w-full" iconSize={30} tint={tint} />
          )}
        </Link>

        <button
          type="button"
          onClick={handleLike}
          aria-label={project.liked ? 'Unlike' : 'Like'}
          className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm"
        >
          <Heart
            size={13}
            strokeWidth={2}
            className={project.liked ? 'fill-orange text-orange' : 'text-navy'}
          />
          <span className="text-[11px] font-medium text-navy">{project.likes}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <Link to={`/projects/${project.id}`}>
          <h3 className="font-heading text-[16px] font-semibold text-navy">{project.name}</h3>
        </Link>
        <p className="text-[14px] leading-relaxed text-text-secondary line-clamp-2">
          {project.description}
        </p>
        <p className="text-[12px] text-text-muted">{project.techStack.join(' · ')}</p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <Link
            to={`/creators/${project.owner.id}`}
            className="flex min-w-0 items-center gap-2"
          >
            <Avatar name={project.owner.name} src={project.owner.avatarUrl} size="sm" />
            <span className="truncate text-[13px] text-text-secondary">
              {project.owner.name}
            </span>
            <span className="shrink-0 text-[13px] text-text-muted">· {project.cohort}</span>
          </Link>

          <Link
            to={`/projects/${project.id}`}
            className="shrink-0 text-[13px] font-medium text-orange"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  )
}
