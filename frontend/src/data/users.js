import { PLACEHOLDER_LINK } from './constants.js'

export const users = [
  {
    id: 'u1',
    name: 'Amara Chen',
    avatarUrl: `https://i.pravatar.cc/300?u=u1`,
    bio: 'Full-stack developer who likes building tools that make other builders faster.',
    cohort: 'Cohort 12',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u2',
    name: 'Diego Ramirez',
    avatarUrl: `https://i.pravatar.cc/300?u=u2`,
    bio: 'Mobile engineer focused on Android and Kotlin. Previously interned at a fintech startup.',
    cohort: 'Cohort 12',
    skills: ['Kotlin', 'Android', 'Firebase'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u3',
    name: 'Priya Nair',
    avatarUrl: `https://i.pravatar.cc/300?u=u3`,
    bio: 'Designer-developer hybrid. Cares a lot about the details most people skip over.',
    cohort: 'Cohort 11',
    skills: ['Figma', 'React', 'Design Systems', 'CSS'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u4',
    name: 'Jordan Lee',
    avatarUrl: `https://i.pravatar.cc/300?u=u4`,
    bio: 'Backend-leaning engineer, currently deep in data pipelines and ML tooling.',
    cohort: 'Cohort 11',
    skills: ['Python', 'Flask', 'Pandas', 'Docker'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u5',
    name: 'Sofia Petrov',
    avatarUrl: `https://i.pravatar.cc/300?u=u5`,
    bio: 'Frontend engineer with a soft spot for accessibility and motion design.',
    cohort: 'Cohort 10',
    skills: ['React', 'Accessibility', 'Framer Motion'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u6',
    name: 'Marcus Webb',
    avatarUrl: `https://i.pravatar.cc/300?u=u6`,
    bio: 'Full-stack builder, three years into a career switch from finance.',
    cohort: 'Cohort 9',
    skills: ['JavaScript', 'Express', 'MongoDB'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u7',
    name: 'Hana Kobayashi',
    avatarUrl: `https://i.pravatar.cc/300?u=u7`,
    bio: 'Product-minded engineer. Likes shipping small, useful things quickly.',
    cohort: 'Cohort 12',
    skills: ['React Native', 'Swift', 'UI/UX'],
    githubLink: PLACEHOLDER_LINK,
  },
  {
    id: 'u8',
    name: 'Elena Volkov',
    avatarUrl: `https://i.pravatar.cc/300?u=u8`,
    bio: 'Data-curious developer exploring the intersection of ML and product design.',
    cohort: 'Cohort 10',
    skills: ['Python', 'TensorFlow', 'UI/UX'],
    githubLink: PLACEHOLDER_LINK,
  },
]

export const currentUser = users[0]

export const getUserById = (id) => users.find((u) => u.id === id)
