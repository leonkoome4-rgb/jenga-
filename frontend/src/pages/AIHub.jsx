import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Sparkles,
  FileText,
  Tags,
  TrendingUp,
  Users,
  BookOpen,
  Bug,
  LogOut,
} from 'lucide-react'
import Button from '../components/Button.jsx'
import { selectIsAuthenticated, selectAuthUser, loggedOut } from '../features/auth/authSlice.js'
import CategorizeTool from '../components/aiHub/CategorizeTool.jsx'
import DescriptionTool from '../components/aiHub/DescriptionTool.jsx'
import TagsTool from '../components/aiHub/TagsTool.jsx'
import SkillGapTool from '../components/aiHub/SkillGapTool.jsx'
import TeamMatchTool from '../components/aiHub/TeamMatchTool.jsx'
import ReadmeTool from '../components/aiHub/ReadmeTool.jsx'
import DebugTool from '../components/aiHub/DebugTool.jsx'

const TOOLS = [
  { id: 'categorize', label: 'Categorize', icon: Sparkles, Component: CategorizeTool },
  { id: 'description', label: 'Description', icon: FileText, Component: DescriptionTool },
  { id: 'tags', label: 'Tags', icon: Tags, Component: TagsTool },
  { id: 'skill-gap', label: 'Skill gap', icon: TrendingUp, Component: SkillGapTool },
  { id: 'team-match', label: 'Team match', icon: Users, Component: TeamMatchTool },
  { id: 'readme', label: 'README', icon: BookOpen, Component: ReadmeTool },
  { id: 'debug', label: 'Debug', icon: Bug, Component: DebugTool },
]

export default function AIHub() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectAuthUser)
  const [activeTool, setActiveTool] = useState(TOOLS[0].id)

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange/10">
          <Sparkles size={26} strokeWidth={1.75} className="text-orange" />
        </div>
        <h1 className="font-heading text-[22px] font-bold text-navy">AI Hub</h1>
        <p className="text-[14px] leading-relaxed text-text-secondary">
          Categorize projects, generate descriptions, find skill gaps, match teammates, write
          READMEs, and debug code -- powered by real AI. Log in to use it.
        </p>
        <div className="mt-2 flex gap-3">
          <Button to="/login" variant="primary">
            Log in
          </Button>
          <Button to="/register" variant="secondary">
            Create account
          </Button>
        </div>
      </div>
    )
  }

  const ActiveComponent = TOOLS.find((t) => t.id === activeTool).Component

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[24px] font-bold text-navy">AI Hub</h1>
          <p className="mt-1 text-[14px] text-text-secondary">
            Signed in as {user?.name || '…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(loggedOut())}
          className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-orange"
        >
          <LogOut size={14} strokeWidth={1.75} />
          Log out
        </button>
      </div>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {TOOLS.map((tool) => {
          const isActive = tool.id === activeTool
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'border-orange text-orange'
                  : 'border-navy/70 text-navy hover:border-navy'
              }`}
            >
              <tool.icon size={14} strokeWidth={1.75} />
              {tool.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        <ActiveComponent />
      </div>

      <p className="mt-10 text-center text-[12px] text-text-muted">
        Every request here is authenticated and logged.{' '}
        <Link to="/profile" className="text-orange">
          Back to Tawi
        </Link>
      </p>
    </div>
  )
}
