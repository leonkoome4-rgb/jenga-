import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, Video, Image as ImageIcon, FileText } from 'lucide-react'
import Button from '../components/Button.jsx'
import { createSosPost } from '../features/sos/sosSlice.js'
import { selectAuthToken } from '../features/auth/authSlice.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

const MEDIA_OPTIONS = [
  { id: 'none', label: 'Just text', icon: FileText },
  { id: 'video', label: 'Video clip', icon: Video },
  { id: 'image', label: 'Screenshot', icon: ImageIcon },
]

export default function PostSos() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const token = useSelector(selectAuthToken)

  const [question, setQuestion] = useState('')
  const [mediaType, setMediaType] = useState('none')
  const [mediaUrl, setMediaUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = question.trim() && (mediaType === 'none' || mediaUrl.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    if (!token) {
      setError('Please log in before posting a problem.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await dispatch(
      createSosPost({
        question: question.trim(),
        media_type: mediaType,
        media_url: mediaType === 'none' ? null : mediaUrl.trim(),
      }),
    )
    setSubmitting(false)

    if (createSosPost.fulfilled.match(result)) {
      navigate(`/sos/${result.payload.id}`)
    } else {
      setError(result.payload || 'Could not post your problem. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <h1 className="font-heading text-[24px] font-bold text-navy">Post a problem</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Describe what's going wrong. A clip or screenshot helps people spot the issue faster.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-orange/10 px-3 py-2.5 text-[13px] text-navy">
            <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">What's the problem?</label>
          <textarea
            required
            className={`${inputClasses} min-h-28 resize-none`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. My React state isn't updating after a fetch call…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Attach</label>
          <div className="flex gap-2">
            {MEDIA_OPTIONS.map((opt) => {
              const isActive = mediaType === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMediaType(opt.id)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-[1.5px] px-3 py-3 text-[12px] font-medium transition-colors ${
                    isActive ? 'border-orange text-orange' : 'border-border text-text-secondary'
                  }`}
                >
                  <opt.icon size={18} strokeWidth={1.75} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {mediaType !== 'none' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-navy">
              {mediaType === 'video' ? 'Video URL' : 'Image URL'}
            </label>
            <input
              required
              className={inputClasses}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={mediaType === 'video' ? 'https://…/clip.mp4' : 'https://…/screenshot.png'}
            />
          </div>
        )}

        <Button type="submit" variant="primary" disabled={!canSubmit || submitting} className="w-full py-3">
          {submitting ? 'Posting…' : 'Post problem'}
        </Button>
      </form>
    </div>
  )
}
