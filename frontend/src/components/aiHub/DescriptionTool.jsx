import { useState } from 'react'
import { AlertCircle, Sparkles, Copy, Check } from 'lucide-react'
import Button from '../Button.jsx'
import TagInput from '../TagInput.jsx'
import { useAITool } from '../../hooks/useAITool.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex items-center gap-1.5 text-[12px] font-medium text-orange"
    >
      {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function DescriptionTool() {
  const [name, setName] = useState('')
  const [tech, setTech] = useState([])
  const [features, setFeatures] = useState('')
  const [audience, setAudience] = useState('')
  const { run, loading, error, result } = useAITool('/api/ai/project-description')

  const handleSubmit = (e) => {
    e.preventDefault()
    run({ name, tech, features, audience })
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Project name</label>
          <input
            required
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pathway"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Tech stack</label>
          <TagInput tags={tech} onChange={setTech} placeholder="Add a technology" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Key features</label>
          <textarea
            className={`${inputClasses} min-h-20 resize-none`}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="What can users do with it?"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Target audience</label>
          <input
            className={inputClasses}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Who is it for?"
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Writing…' : 'Generate description'}
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
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
                  Short description
                </p>
                <CopyButton text={result.short_description} />
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">
                {result.short_description}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
                  Full description
                </p>
                <CopyButton text={result.full_description} />
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-text-secondary">
                {result.full_description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
