import { useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'
import Button from '../Button.jsx'
import TagInput from '../TagInput.jsx'
import { useAITool } from '../../hooks/useAITool.js'

const PRIORITY_COLOR = {
  high: 'text-orange border-orange',
  medium: 'text-blue border-blue',
  low: 'text-text-muted border-border',
}

export default function SkillGapTool() {
  const [skills, setSkills] = useState([])
  const [requiredTech, setRequiredTech] = useState([])
  const { run, loading, error, result } = useAITool('/api/ai/skill-gap')

  const handleSubmit = (e) => {
    e.preventDefault()
    run({ skills, required_tech: requiredTech })
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Your current skills</label>
          <TagInput tags={skills} onChange={setSkills} placeholder="e.g. HTML, CSS" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Project's required tech</label>
          <TagInput tags={requiredTech} onChange={setRequiredTech} placeholder="e.g. React, Flask" />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || requiredTech.length === 0}
          className="w-full py-3"
        >
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Analyzing…' : 'Find my skill gaps'}
        </Button>
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-orange/10 px-3 py-2.5 text-[13px] text-navy">
            <AlertCircle size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange" />
            {error}
          </div>
        )}
      </form>

      <div className="flex-1 rounded-2xl border border-border bg-white p-5">
        {!result ? (
          <p className="text-[13px] text-text-muted">Results will appear here.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] leading-relaxed text-text-secondary">{result.summary}</p>
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {(result.missing_skills || [])
                .slice()
                .sort((a, b) => (a.learning_order || 0) - (b.learning_order || 0))
                .map((item) => (
                  <div key={item.skill} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">
                        {item.learning_order}
                      </span>
                      <span className="text-[14px] font-medium text-navy">{item.skill}</span>
                    </div>
                    <span
                      className={`rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-medium capitalize ${PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.low}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
