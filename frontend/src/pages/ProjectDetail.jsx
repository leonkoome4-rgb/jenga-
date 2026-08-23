import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ExternalLink, Code2, Heart, HandCoins, Handshake, Check } from 'lucide-react'
import MediaBackground from '../components/MediaBackground.jsx'
import BackButton from '../components/BackButton.jsx'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import {
  selectAllProjects,
  projectLikeToggled,
  projectTipped,
} from '../features/projects/projectsSlice.js'

export default function ProjectDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const projects = useSelector(selectAllProjects)
  const project = projects.find((p) => p.id === id)
  const [connected, setConnected] = useState(false)
  const [tipped, setTipped] = useState(false)

  if (!project) {
    return <Navigate to="/discover" replace />
  }

  const allContributors = [project.owner, ...project.members.filter((m) => m.id !== project.owner.id)]

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 lg:pb-10 lg:pt-10">
      <div className="mb-3 flex items-center justify-between">
        <BackButton fallback="/discover" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(projectLikeToggled(project.id))}
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-navy/70 px-3 py-1.5"
          >
            <Heart
              size={15}
              strokeWidth={2}
              className={project.liked ? 'fill-orange text-orange' : 'text-navy'}
            />
            <span className="text-[13px] font-medium text-navy">{project.likes}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(projectTipped(project.id))
              setTipped(true)
              setTimeout(() => setTipped(false), 1200)
            }}
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-navy/70 px-3 py-1.5"
            aria-label="Tip this build"
          >
            <HandCoins size={15} strokeWidth={2} className={tipped ? 'text-orange' : 'text-navy'} />
            <span className="text-[13px] font-medium text-navy">{project.tips}</span>
          </button>
        </div>
      </div>

      <MediaBackground
        imageUrl={project.imageUrl}
        videoUrl={project.videoUrl}
        name={project.name}
        tint="#4FA3DC"
        iconSize={40}
        className="aspect-video max-h-[360px] w-full rounded-2xl"
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-blue">{project.category}</p>
          <h1 className="font-heading mt-1 text-[26px] font-bold text-navy">{project.name}</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text-secondary">
            {project.description}
          </p>
          <p className="mt-3 text-[13px] text-text-muted">{project.techStack.join(' · ')}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button href={project.liveLink} target="_blank" rel="noreferrer" variant="primary">
            <ExternalLink size={15} strokeWidth={1.75} />
            View live project
          </Button>
          <Button href={project.githubLink} target="_blank" rel="noreferrer" variant="secondary">
            <Code2 size={15} strokeWidth={1.75} />
            View GitHub
          </Button>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-heading text-[18px] font-semibold text-navy">About this build</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          {project.fullDescription}
        </p>
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-heading text-[18px] font-semibold text-navy">Built by</h2>
        <div className="mt-5 flex flex-wrap gap-6">
          {allContributors.map((person) => (
            <Link key={person.id} to={`/creators/${person.id}`} className="flex items-center gap-3">
              <Avatar name={person.name} src={person.avatarUrl} size="lg" />
              <div>
                <p className="text-[14px] font-medium text-navy">{person.name}</p>
                <p className="text-[13px] text-text-muted">
                  {person.id === project.owner.id ? 'Owner' : 'Group member'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-white px-8 py-12 text-center">
        <h2 className="font-heading text-[19px] font-semibold text-navy">
          Interested in collaborating?
        </h2>
        <p className="max-w-sm text-[14px] leading-relaxed text-text-secondary">
          Reach out to {project.owner.name} to work together on this build or something new.
        </p>
        {connected ? (
          <p className="flex items-center gap-2 text-[14px] font-medium text-navy">
            <Check size={16} strokeWidth={2} className="text-orange" />
            Request sent to {project.owner.name}
          </p>
        ) : (
          <Button variant="primary" onClick={() => setConnected(true)}>
            <Handshake size={15} strokeWidth={1.75} />
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}
