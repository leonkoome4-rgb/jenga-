import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, Send } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import {
  fetchSosPost,
  addSosComment,
  resolveSosPost,
  selectCurrentSosPost,
  selectCurrentSosPostStatus,
} from '../features/sos/sosSlice.js'
import { selectAuthUser, selectIsAuthenticated } from '../features/auth/authSlice.js'

export default function SosPostDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const post = useSelector(selectCurrentSosPost)
  const status = useSelector(selectCurrentSosPostStatus)
  const authUser = useSelector(selectAuthUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    dispatch(fetchSosPost(id))
  }, [id, dispatch])

  if (status === 'failed') {
    return <Navigate to="/sos" replace />
  }

  if (!post) {
    return <p className="p-8 text-center text-[14px] text-text-muted">Loading…</p>
  }

  const isOwner = authUser && String(authUser.id) === String(post.author?.id)

  const handleComment = async (e) => {
    e.preventDefault()
    const body = comment.trim()
    if (!body || posting) return
    setPosting(true)
    const result = await dispatch(addSosComment({ postId: post.id, body }))
    if (addSosComment.fulfilled.match(result)) setComment('')
    setPosting(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <div className="flex items-center gap-3">
        <Avatar name={post.author?.name} src={post.author?.avatar_url} size="lg" />
        <div>
          <p className="text-[14px] font-semibold text-navy">{post.author?.name || 'Someone'}</p>
          {post.resolved && (
            <span className="flex items-center gap-1 text-[12px] font-medium text-blue">
              <CheckCircle2 size={12} strokeWidth={2} />
              Marked as solved
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 text-[16px] leading-relaxed text-navy">{post.question}</p>

      {post.media_type === 'video' && post.media_url && (
        <video
          src={post.media_url}
          controls
          className="mt-4 w-full rounded-2xl bg-black"
          style={{ maxHeight: '480px' }}
        />
      )}
      {post.media_type === 'image' && post.media_url && (
        <img src={post.media_url} alt="" className="mt-4 w-full rounded-2xl object-cover" />
      )}

      {isOwner && !post.resolved && (
        <Button
          variant="secondary"
          className="mt-4 px-4 py-2 text-[13px]"
          onClick={() => dispatch(resolveSosPost(post.id))}
        >
          <CheckCircle2 size={14} strokeWidth={1.75} />
          Mark as solved
        </Button>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-[14px] font-semibold text-navy">
          {post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {(post.comments || []).map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar name={c.author?.name} src={c.author?.avatar_url} size="sm" />
              <div className="min-w-0 flex-1 rounded-2xl bg-bg px-3.5 py-2.5">
                <p className="text-[13px] font-medium text-navy">{c.author?.name || 'Someone'}</p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-text-secondary">{c.body}</p>
              </div>
            </div>
          ))}
          {(post.comments || []).length === 0 && (
            <p className="text-[13px] text-text-muted">No replies yet. Be the first to help.</p>
          )}
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mt-5 flex items-center gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Suggest a fix…"
              className="min-w-0 flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange"
            />
            <button
              type="submit"
              disabled={!comment.trim() || posting}
              aria-label="Reply"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange text-white disabled:opacity-40"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        ) : (
          <p className="mt-5 text-center text-[13px] text-text-muted">
            <Link to="/login" className="font-medium text-orange">
              Log in
            </Link>{' '}
            to reply and help solve this.
          </p>
        )}
      </div>
    </div>
  )
}
