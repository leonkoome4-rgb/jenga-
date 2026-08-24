import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import Button from './Button.jsx'
import GradientHero from './GradientHero.jsx'
import TrustStatBand from './TrustStatBand.jsx'
import ProjectCard from './ProjectCard.jsx'
import { projects } from '../data/projects.js'

const previewProjects = [...projects].sort((a, b) => b.likes - a.likes).slice(0, 3)

const highlights = [
  {
    title: 'Showcase your work',
    copy: 'Turn every project into a clean, shareable page — proof of what you can actually build, not just a line on a CV.',
    tone: 'orange',
    imageUrl: 'https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849824_640.jpg',
  },
  {
    title: 'Get discovered',
    copy: 'Employers, mentors, and future teammates browse the project bank looking for exactly the kind of work you’ve already shipped.',
    tone: 'blue',
    imageUrl: 'https://cdn.pixabay.com/photo/2019/03/27/09/43/team-4084637_640.jpg',
  },
  {
    title: 'Compete & climb',
    copy: 'Likes decide the leaderboard. Beat your cohort, top the charts, and see your build featured on Tawi.',
    tone: 'orange',
    imageUrl: 'https://cdn.pixabay.com/photo/2019/04/21/23/15/trophy-4145177_640.png',
  },
]

export default function MarketingContent({ heroTopPadding = 'pt-20' }) {
  return (
    <>
      <GradientHero>
        <div className={`mx-auto max-w-3xl px-6 ${heroTopPadding} pb-24 text-center`}>
          <h1 className="font-heading text-[36px] font-bold leading-[1.15] tracking-tight text-navy sm:text-[46px]">
            Your work.
            <br />
            Your reputation.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-text-secondary">
            Tawi is where Moringa students turn their builds into a portfolio that gets seen —
            compete with your cohort, climb the leaderboard, and get discovered by the people
            hiring.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button to="/discover" variant="primary" className="px-6 py-3">
              Watch the feed
            </Button>
            <Button to="/add-project" variant="secondary" className="px-6 py-3">
              Share your work
            </Button>
          </div>
        </div>
      </GradientHero>

      <TrustStatBand />

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-[26px] font-bold text-navy">How Tawi works</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
            Three steps between finishing a project and having it actually count for something.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {highlights.map(({ title, copy, tone, imageUrl }) => (
            <div key={title} className="overflow-hidden rounded-2xl">
              <img src={imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className={`p-6 ${tone === 'orange' ? 'bg-orange' : 'bg-blue'}`}>
                <h3 className="font-heading text-[18px] font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/90">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-heading text-[26px] font-bold text-white">
            Join the Tawi community of builders
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">
            Every project you publish is a chance to stand out — to classmates sizing up the
            competition, and to the employers looking for their next hire.
          </p>
          <Button to="/explore" variant="primary" className="mt-7 px-6 py-3">
            Start exploring
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Trophy size={16} strokeWidth={1.75} className="text-orange" />
          <p className="text-[13px] font-medium uppercase tracking-wide text-text-muted">
            Top rated from the project bank
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {previewProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/top" className="text-[14px] font-medium text-orange">
            See the full leaderboard →
          </Link>
        </div>
      </section>
    </>
  )
}
