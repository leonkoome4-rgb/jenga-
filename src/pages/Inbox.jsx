import { useState } from 'react'
import { Inbox as InboxIcon } from 'lucide-react'
import NotificationRow from '../components/NotificationRow.jsx'
import { notifications as initialNotifications } from '../data/notifications.js'

export default function Inbox() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const updateStatus = (id, status) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <h1 className="font-heading text-[24px] font-bold text-navy">Inbox</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Likes on your builds and collaboration requests from other students.
      </p>

      {notifications.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center">
          <InboxIcon size={24} strokeWidth={1.75} className="text-text-muted" />
          <p className="text-[14px] text-text-secondary">You're all caught up.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onAccept={(id) => updateStatus(id, 'accepted')}
              onDecline={(id) => updateStatus(id, 'declined')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
