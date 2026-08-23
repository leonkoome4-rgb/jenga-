import { getUserById } from './users.js'

const asActor = (id) => {
  const u = getUserById(id)
  return { id: u.id, name: u.name, avatarUrl: u.avatarUrl }
}

export const notifications = [
  {
    id: 'n1',
    type: 'collab',
    actor: asActor('u5'),
    projectId: 'p1',
    text: 'wants to collaborate on Pathway',
    createdAt: '2026-08-19',
    status: 'pending',
  },
  {
    id: 'n2',
    type: 'like',
    actor: asActor('u3'),
    projectId: 'p1',
    text: 'liked your build Pathway',
    createdAt: '2026-08-19',
  },
  {
    id: 'n3',
    type: 'like',
    actor: asActor('u7'),
    projectId: 'p1',
    text: 'liked your build Pathway',
    createdAt: '2026-08-18',
  },
  {
    id: 'n4',
    type: 'collab',
    actor: asActor('u6'),
    projectId: 'p9',
    text: 'wants to collaborate on Cadence',
    createdAt: '2026-08-16',
    status: 'pending',
  },
  {
    id: 'n5',
    type: 'like',
    actor: asActor('u2'),
    projectId: 'p9',
    text: 'liked your build Cadence',
    createdAt: '2026-08-14',
  },
  {
    id: 'n6',
    type: 'collab',
    actor: asActor('u8'),
    projectId: 'p1',
    text: 'wants to collaborate on Pathway',
    createdAt: '2026-08-10',
    status: 'accepted',
  },
]
