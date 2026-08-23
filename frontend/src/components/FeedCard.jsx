import { forwardRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Heart, Handshake, HandCoins, Share2, Check, Link2 } from 'lucide-react'
import MediaBackground from './MediaBackground.jsx'
import Avatar from './Avatar.jsx'
import { projectLikeToggled, projectTipped } from '../features/projects/projectsSlice.js'

const CATEGORY_TINT = {
  'Web Dev': '#4FA3DC',
  Mobile: '#F1793D',
  Data: '#4FA3DC',
  AI: '#F1793D',
}

const FeedCard = forwardRef(function FeedCard({ project, isActive = true }, ref) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tipped, setTipped] = useState(false)
  const tint = CATEGORY_TINT[project.category] ?? '#4FA3DC'

  const stop = (e) => e.stopPropagation()

  const handleShare = (e) => {
    stop(e)
    const url = `${window.location.origin}/projects/${project.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const openDetail = () => navigate(`/projects/${project.id}`)

  return (
    <section
      ref={ref}
      data-project-id={project.id}
      className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-navy"
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <MediaBackground
        imageUrl={project.imageUrl}
        videoUrl={project.videoUrl}
        name={project.name}
        tint={tint}
        iconSize={56}
        playing={isActive}
        className="absolute inset-0 h-full w-full"
      />

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy/95 via-navy/45 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-[calc(env(safe-area-inset-bottom)+88px)] sm:px-6 lg:pb-8">
        <div className="min-w-0 max-w-[78%] sm:max-w-md">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium text-scrim"
            style={{ backgroundColor: `${tint}40`, color: '#fff' }}
          >
            {project.category}
          </span>

          <Link
            to={`/creators/${project.owner.id}`}
            onClick={stop}
            className="text-scrim mt-3 block text-[13px] font-medium text-white/85"
          >
            {project.owner.name} · {project.cohort}
          </Link>

          <h2 className="text-scrim mt-1 truncate font-heading text-[20px] font-bold text-white">
            {project.name}
          </h2>

          <p className="text-scrim mt-1.5 line-clamp-2 text-[14px] leading-snug text-white/90">
            {project.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white"
              >
                {tech}
              </span>
            ))}
          </div>

          <span className="mt-4 inline-block text-[13px] font-semibold text-orange">
            View project →
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-5 pb-1">
          <Link to={`/creators/${project.owner.id}`} onClick={stop}>
            <Avatar
              name={project.owner.name}
              src={project.owner.avatarUrl}
              size="lg"
              className="ring-2 ring-white/70 ring-offset-2 ring-offset-navy"
            />
          </Link>

          <button
            type="button"
            onClick={(e) => {
              stop(e)
              dispatch(projectLikeToggled(project.id))
            }}
            className="flex flex-col items-center gap-1"
            aria-label={project.liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={28}
              strokeWidth={1.75}
              className={project.liked ? 'fill-orange text-orange' : 'text-white'}
            />
            <span className="text-scrim text-[12px] font-medium text-white">{project.likes}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              stop(e)
              dispatch(projectTipped(project.id))
              setTipped(true)
              setTimeout(() => setTipped(false), 1200)
            }}
            className="flex flex-col items-center gap-1"
            aria-label="Tip this build"
          >
            <HandCoins
              size={26}
              strokeWidth={1.75}
              className={tipped ? 'text-orange' : 'text-white'}
            />
            <span className="text-scrim text-[12px] font-medium text-white">{project.tips}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              stop(e)
              setConnected(true)
            }}
            className="flex flex-col items-center gap-1"
            aria-label="Connect"
          >
            {connected ? (
              <Check size={26} strokeWidth={2} className="text-orange" />
            ) : (
              <Handshake size={26} strokeWidth={1.75} className="text-white" />
            )}
            <span className="text-scrim text-[12px] font-medium text-white">
              {connected ? 'Sent' : 'Connect'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1"
            aria-label="Copy link"
          >
            {copied ? (
              <Link2 size={25} strokeWidth={1.75} className="text-orange" />
            ) : (
              <Share2 size={25} strokeWidth={1.75} className="text-white" />
            )}
            <span className="text-scrim text-[12px] font-medium text-white">
              {copied ? 'Copied' : 'Share'}
            </span>
          </button>
        </div>
      </div>
    </section>
  )
})

export default FeedCard
