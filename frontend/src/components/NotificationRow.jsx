import { Link } from 'react-router-dom'
import { Heart, Handshake } from 'lucide-react'
import Avatar from './Avatar.jsx'

const icons = {
  like: { Icon: Heart, className: 'text-orange' },
  collab: { Icon: Handshake, className: 'text-blue' },
}

function timeAgo(dateStr) {
  const days = Math.max(
    0,
    Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)),
  )
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}

export default function NotificationRow({ notification, onAccept, onDecline }) {
  const { Icon, className } = icons[notification.type]
  const isPendingCollab = notification.type === 'collab' && notification.status === 'pending'

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative shrink-0">
        <Link to={`/creators/${notification.actor.id}`}>
          <Avatar name={notification.actor.name} src={notification.actor.avatarUrl} size="md" />
        </Link>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-border">
          <Icon size={11} strokeWidth={2.25} className={className} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[14px] text-navy">
          <Link to={`/creators/${notification.actor.id}`} className="font-medium">
            {notification.actor.name}
          </Link>{' '}
          <span className="text-text-secondary">{notification.text}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-text-muted">{timeAgo(notification.createdAt)}</p>
      </div>

      {isPendingCollab ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onAccept(notification.id)}
            className="rounded-full bg-orange px-3 py-1.5 text-[12px] font-medium text-white"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => onDecline(notification.id)}
            className="rounded-full border-[1.5px] border-navy/70 px-3 py-1.5 text-[12px] font-medium text-navy"
          >
            Decline
          </button>
        </div>
      ) : notification.type === 'collab' ? (
        <span className="shrink-0 text-[12px] font-medium capitalize text-text-muted">
          {notification.status}
        </span>
      ) : notification.projectId ? (
        <Link
          to={`/projects/${notification.projectId}`}
          className="shrink-0 rounded-full border-[1.5px] border-navy/70 px-3 py-1 text-[12px] font-medium text-navy"
        >
          View
        </Link>
      ) : null}
    </div>
  )
}
