import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MessageCircleQuestion, Video, Image as ImageIcon, CheckCircle2, Plus } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import Button from '../components/Button.jsx'
import { fetchHelpPosts, selectHelpPosts, selectHelpPostsStatus } from '../features/help/helpSlice.js'

const MEDIA_ICON = { video: Video, image: ImageIcon }

export default function HelpFeed() {
  const dispatch = useDispatch()
  const posts = useSelector(selectHelpPosts)
  const status = useSelector(selectHelpPostsStatus)

  useEffect(() => {
    dispatch(fetchHelpPosts())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[24px] font-bold text-navy">Help</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Stuck on something? Post a clip, image, or question and get help from other builders.
          </p>
        </div>
        <Button to="/help/new" variant="primary" className="px-4 py-2">
          <Plus size={16} strokeWidth={2.25} />
          Post a problem
        </Button>
      </div>

      {status === 'loading' && posts.length === 0 ? (
        <p className="mt-16 text-center text-[14px] text-text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <MessageCircleQuestion size={28} strokeWidth={1.5} className="text-text-muted" />
          <p className="text-[14px] text-text-secondary">No problems posted yet.</p>
          <Link to="/help/new" className="text-[14px] font-medium text-orange">
            Be the first to ask →
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {posts.map((post) => {
            const MediaIcon = MEDIA_ICON[post.media_type]
            return (
              <Link
                key={post.id}
                to={`/help/${post.id}`}
                className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 transition-colors hover:border-orange"
              >
                <Avatar name={post.author?.name} src={post.author?.avatar_url} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-navy">{post.author?.name || 'Someone'}</p>
                    {post.resolved && (
                      <span className="flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[11px] font-medium text-blue">
                        <CheckCircle2 size={11} strokeWidth={2} />
                        Solved
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-text-secondary">
                    {post.question}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[12px] text-text-muted">
                    {MediaIcon && (
                      <span className="flex items-center gap-1">
                        <MediaIcon size={13} strokeWidth={1.75} />
                        {post.media_type}
                      </span>
                    )}
                    <span>{post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
