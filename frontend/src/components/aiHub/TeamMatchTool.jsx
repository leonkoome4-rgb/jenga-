import { useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'
import Button from '../Button.jsx'
import TagInput from '../TagInput.jsx'
import Avatar from '../Avatar.jsx'
import { useAITool } from '../../hooks/useAITool.js'

export default function TeamMatchTool() {
  const [requiredTech, setRequiredTech] = useState([])
  const { run, loading, error, result } = useAITool('/api/ai/team-match')

  const handleSubmit = (e) => {
    e.preventDefault()
    run({ required_tech: requiredTech })
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Project's required tech</label>
          <TagInput tags={requiredTech} onChange={setRequiredTech} placeholder="e.g. React, Flask" />
          <p className="text-[12px] text-text-muted">
            Matches are drawn from real registered Tawi accounts, ranked by their demonstrated
            skills across their own published projects.
          </p>
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || requiredTech.length === 0}
          className="w-full py-3"
        >
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Matching…' : 'Find teammates'}
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
        ) : result.matches.length === 0 ? (
          <p className="text-[13px] text-text-muted">
            No other Tawi accounts to match against yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {result.matches.map((match) => (
              <div key={match.user.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={match.user.name} src={match.user.avatar_url} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-medium text-navy">{match.user.name}</p>
                    <span className="shrink-0 text-[13px] font-bold text-orange">{match.score}%</span>
                  </div>
                  <ul className="mt-1 list-inside list-disc text-[12px] text-text-secondary">
                    {(match.reasons || []).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
