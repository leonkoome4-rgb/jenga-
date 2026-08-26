import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShieldCheck, Link2, Check, HandCoins } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import { getUserById } from '../data/users.js'
import { api } from '../api/client.js'
import {
  selectProjectsByOwner,
  projectTipped,
} from '../features/projects/projectsSlice.js'
import { selectCurrentUser } from '../features/user/userSlice.js'
import { selectIsAuthenticated, selectAuthUser } from '../features/auth/authSlice.js'

export default function Profile() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const isRealAuthenticated = useSelector(selectIsAuthenticated)
  const authUser = useSelector(selectAuthUser)
  const [remoteUser, setRemoteUser] = useState(null)
  const [failedProfileId, setFailedProfileId] = useState(null)

  // Viewing your own profile (no :id in the URL) while genuinely logged in
  // should show your real Tawi account, not the demo mock persona.
  const viewingOwnRealProfile =
    isRealAuthenticated && Boolean(authUser) && (!id || String(id) === String(authUser.id))
  const isAdmin = viewingOwnRealProfile
    ? authUser.role === 'admin'
    : false

  const profileId = String(id ?? (viewingOwnRealProfile ? authUser.id : currentUser.id))
  const shouldFetchProfile = Boolean(id && (!authUser || String(authUser.id) !== String(id)))
  const profileLoading =
    shouldFetchProfile &&
    String(remoteUser?.id) !== String(id) &&
    String(failedProfileId) !== String(id)

  useEffect(() => {
    if (!shouldFetchProfile) return undefined

    let cancelled = false
    api.get(`/api/users/${id}`)
      .then((data) => {
        if (!cancelled) setRemoteUser(data.user)
      })
      .catch(() => {
        if (!cancelled) setFailedProfileId(String(id))
      })
    return () => {
      cancelled = true
    }
  }, [id, shouldFetchProfile])

  const user = viewingOwnRealProfile
    ? {
        id: authUser.id,
        name: authUser.name,
        avatarUrl: authUser.avatar_url,
        bio: authUser.bio || 'No bio yet.',
        cohort: authUser.cohort_name || 'No cohort set',
        skills: [],
        githubLink: authUser.github_url,
      }
    : remoteUser
      ? {
          id: remoteUser.id,
          name: remoteUser.name,
          avatarUrl: remoteUser.avatar_url,
          bio: remoteUser.bio || 'No bio yet.',
          cohort: remoteUser.cohort_name || 'No cohort set',
          skills: [],
          githubLink: remoteUser.github_url,
        }
      : getUserById(profileId)
  const isOwnProfile = viewingOwnRealProfile || String(profileId) === String(currentUser.id)
  const projects = useSelector((state) => selectProjectsByOwner(state, profileId))
  const [copied, setCopied] = useState(false)
  const [tipped, setTipped] = useState(false)

  if (profileLoading) {
    return <div className="p-8 text-center text-[14px] text-text-muted">Loading profile…</div>
  }

  if (!user) {
    return <Navigate to="/discover" replace />
  }

  const totalLikes = projects.reduce((sum, p) => sum + p.likes, 0)
  const totalTips = projects.reduce((sum, p) => sum + p.tips, 0)
  const topProject = [...projects].sort((a, b) => b.likes - a.likes)[0]

  const handleCopyLink = () => {
    const url = `${window.location.origin}/creators/${profileId}`
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleTip = () => {
    if (!topProject) return
    dispatch(projectTipped(topProject.id))
    setTipped(true)
    setTimeout(() => setTipped(false), 1500)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:pb-10 lg:pt-10">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
        <Avatar name={user.name} src={user.avatarUrl} size="xl" />
        <div className="mt-5 sm:mt-0">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h1 className="font-heading text-[24px] font-bold text-navy">{user.name}</h1>
            {isOwnProfile && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-full border-[1.5px] border-navy/70 px-3 py-1 text-[12px] font-medium text-navy lg:hidden"
              >
                <ShieldCheck size={13} strokeWidth={1.75} />
                Admin
              </Link>
            )}
          </div>
          <p className="mt-1 text-[13px] text-text-muted">{user.cohort}</p>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary sm:mx-0">
            {user.bio}
          </p>

          <div className="mt-4 flex items-center justify-center gap-6 sm:justify-start">
            <div>
              <p className="font-heading text-[20px] font-bold text-orange">{totalLikes}</p>
              <p className="text-[12px] text-text-muted">Total likes</p>
            </div>
            <div>
              <p className="font-heading text-[20px] font-bold text-blue">{projects.length}</p>
              <p className="text-[12px] text-text-muted">Projects</p>
            </div>
            <div>
              <p className="font-heading text-[20px] font-bold text-orange">{totalTips}</p>
              <p className="text-[12px] text-text-muted">Tips received</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border-[1.5px] border-navy/70 px-3 py-1 text-[12px] font-medium text-navy"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            {user.githubLink && (
              <a
                href={user.githubLink}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-medium text-orange"
              >
                GitHub
              </a>
            )}
            {isOwnProfile && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-[14px] font-medium text-navy hover:text-orange"
              >
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={2} className="text-orange" />
                    Link copied
                  </>
                ) : (
                  <>
                    <Link2 size={14} strokeWidth={1.75} />
                    Copy profile link
                  </>
                )}
              </button>
            )}
            {!isOwnProfile && topProject && (
              <button
                type="button"
                onClick={handleTip}
                className="flex items-center gap-1.5 rounded-full border-[1.5px] border-navy/70 px-3 py-1 text-[13px] font-medium text-navy hover:border-orange hover:text-orange"
              >
                <HandCoins size={13} strokeWidth={1.75} className={tipped ? 'text-orange' : ''} />
                {tipped ? 'Tipped!' : `Tip ${user.name.split(' ')[0]}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h2 className="font-heading text-[18px] font-semibold text-navy">
          Projects {projects.length > 0 && <span className="text-text-muted">({projects.length})</span>}
        </h2>

        {projects.length === 0 ? (
          <p className="mt-4 text-[14px] text-text-secondary">
            {user.name} hasn't published a build yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
