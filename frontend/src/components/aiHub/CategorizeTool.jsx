import { useState } from 'react'
import { AlertCircle, Sparkles } from 'lucide-react'
import Button from '../Button.jsx'
import TagInput from '../TagInput.jsx'
import { useAITool } from '../../hooks/useAITool.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function CategorizeTool() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState([])
  const { run, loading, error, result } = useAITool('/api/ai/project-categorize')

  const handleSubmit = (e) => {
    e.preventDefault()
    run({ title, description, tech })
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Project title</label>
          <input
            required
            className={inputClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pathway"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Description</label>
          <textarea
            required
            className={`${inputClasses} min-h-24 resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does it do?"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Tech stack</label>
          <TagInput tags={tech} onChange={setTech} placeholder="Add a technology" />
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Categorizing…' : 'Categorize project'}
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
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-navy px-3 py-1 text-[12px] font-medium text-white">
                {result.category}
              </span>
              <span className="rounded-full border-[1.5px] border-orange px-3 py-1 text-[12px] font-medium text-orange">
                {result.difficulty}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(result.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border-[1.5px] border-blue/40 bg-blue/10 px-2.5 py-1 text-[12px] text-blue"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Reasoning</p>
              <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">{result.reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
