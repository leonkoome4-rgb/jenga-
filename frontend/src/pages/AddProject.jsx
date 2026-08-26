import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { X, Upload, Video, Check } from 'lucide-react'
import Button from '../components/Button.jsx'
import Avatar from '../components/Avatar.jsx'
import { categories } from '../data/categories.js'
import { cohorts } from '../data/cohorts.js'
import { users } from '../data/users.js'
import { api } from '../api/client.js'
import { projectCreated } from '../features/projects/projectsSlice.js'
import { selectAuthToken, selectAuthUser } from '../features/auth/authSlice.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

const labelClasses = 'text-[13px] font-medium text-navy'

export default function AddProject() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector(selectAuthToken)
  const currentUser = useSelector(selectAuthUser)

  const [techInput, setTechInput] = useState('')
  const [published, setPublished] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mediaKind, setMediaKind] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    fullDescription: '',
    category: categories[0],
    cohort: cohorts[0],
    techStack: [],
    githubLink: '',
    liveLink: '',
    imageUrl: null,
    videoUrl: null,
    memberIds: [],
  })

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const addTech = () => {
    const value = techInput.trim()
    if (value && !form.techStack.includes(value)) {
      update({ techStack: [...form.techStack, value] })
    }
    setTechInput('')
  }

  const removeTech = (tech) => update({ techStack: form.techStack.filter((t) => t !== tech) })

  const toggleMember = (id) =>
    update({
      memberIds: form.memberIds.includes(id)
        ? form.memberIds.filter((m) => m !== id)
        : [...form.memberIds, id],
    })

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (file.type.startsWith('video/')) {
      setMediaKind('video')
      update({ videoUrl: url, imageUrl: null })
    } else {
      setMediaKind('image')
      update({ imageUrl: url, videoUrl: null })
    }
  }

  const canPublish = form.name.trim() && form.description.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canPublish) return
    if (!token || !currentUser) {
      setSubmitError('Please log in before publishing a project.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const data = await api.post(
        '/api/projects',
        {
          name: form.name.trim(),
          description: form.description.trim(),
          full_description: form.fullDescription.trim() || form.description.trim(),
          category: form.category,
          cohort: form.cohort,
          tech_tags: form.techStack,
          github_link: form.githubLink.trim() || null,
          live_link: form.liveLink.trim() || null,
          // Browser object URLs only exist for the current session. Do not
          // store one as though it were a permanent uploaded asset.
          image_url: form.imageUrl?.startsWith('blob:') ? null : form.imageUrl,
          video_url: form.videoUrl?.startsWith('blob:') ? null : form.videoUrl,
        },
        { token },
      )
      dispatch(projectCreated(data.project))
      setPublished(true)
      setTimeout(() => navigate(`/projects/${data.project.id}`), 900)
    } catch (err) {
      setSubmitError(err.data?.error || err.message || 'Unable to publish the project.')
    } finally {
      setSubmitting(false)
    }
  }

  if (published) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 pb-24 pt-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10">
          <Check size={26} strokeWidth={2} className="text-orange" />
        </div>
        <h1 className="font-heading text-[20px] font-semibold text-navy">Project published</h1>
        <p className="text-[14px] text-text-secondary">Taking you to your project page…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:pb-10 lg:pt-10">
      <h1 className="font-heading text-[24px] font-bold text-navy">Share your build</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Add it to the project bank so it doesn't get forgotten after the cohort ends.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {submitError && (
          <p className="rounded-xl bg-orange/10 px-4 py-3 text-[13px] text-navy">{submitError}</p>
        )}
        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Cover image or demo clip</label>
          <label className="cursor-pointer">
            {form.imageUrl || form.videoUrl ? (
              mediaKind === 'video' ? (
                <video
                  src={form.videoUrl}
                  className="aspect-video w-full rounded-2xl object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="aspect-video w-full rounded-2xl object-cover"
                />
              )
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border bg-white text-text-muted">
                <div className="flex gap-3">
                  <Upload size={20} strokeWidth={1.5} />
                  <Video size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[13px]">Click to upload an image or video</span>
              </div>
            )}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
          </label>
          {(form.imageUrl || form.videoUrl) && (
            <span className="self-start text-[13px] font-medium text-orange">Change media</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Project name</label>
          <input
            className={inputClasses}
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. Pathway"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Short description</label>
          <input
            className={inputClasses}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="One line that sums up what it does"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Full description</label>
          <textarea
            className={`${inputClasses} min-h-28 resize-none`}
            value={form.fullDescription}
            onChange={(e) => update({ fullDescription: e.target.value })}
            placeholder="What did you build, why, and what was hard about it?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Category</label>
            <select
              className={inputClasses}
              value={form.category}
              onChange={(e) => update({ category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Cohort</label>
            <select
              className={inputClasses}
              value={form.cohort}
              onChange={(e) => update({ cohort: e.target.value })}
            >
              {cohorts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Tech stack</label>
          <div className="flex gap-2">
            <input
              className={inputClasses}
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTech()
                }
              }}
              placeholder="Type a technology and press Enter"
            />
            <Button variant="secondary" onClick={addTech} type="button" className="px-4 py-2.5">
              Add
            </Button>
          </div>
          {form.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {form.techStack.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1.5 rounded-full border-[1.5px] border-navy/70 px-3 py-1 text-[13px] text-navy"
                >
                  {tech}
                  <button type="button" onClick={() => removeTech(tech)} aria-label={`Remove ${tech}`}>
                    <X size={12} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>GitHub link</label>
            <input
              className={inputClasses}
              value={form.githubLink}
              onChange={(e) => update({ githubLink: e.target.value })}
              placeholder="https://github.com/…"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Live project link</label>
            <input
              className={inputClasses}
              value={form.liveLink}
              onChange={(e) => update({ liveLink: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Add group members</label>
          <div className="mt-1 flex flex-col divide-y divide-border rounded-xl border border-border bg-white">
            {users
              .filter((u) => String(u.id) !== String(currentUser?.id))
              .map((u) => {
                const checked = form.memberIds.includes(u.id)
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                      <span className="text-[14px] text-navy">{u.name}</span>
                      <span className="text-[13px] text-text-muted">{u.cohort}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                        checked ? 'border-orange bg-orange' : 'border-navy/40'
                      }`}
                    >
                      {checked && <Check size={12} strokeWidth={2.5} className="text-white" />}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={!canPublish || submitting} className="mt-10 w-full py-3">
        {submitting ? 'Publishing…' : 'Publish project'}
      </Button>
    </form>
  )
}
