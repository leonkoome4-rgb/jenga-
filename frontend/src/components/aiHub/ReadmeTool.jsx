import { useState } from 'react'
import { AlertCircle, Sparkles, Copy, Check, Download } from 'lucide-react'
import Button from '../Button.jsx'
import TagInput from '../TagInput.jsx'
import { useAITool } from '../../hooks/useAITool.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

export default function ReadmeTool() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState([])
  const [githubLink, setGithubLink] = useState('')
  const [liveLink, setLiveLink] = useState('')
  const { run, loading, error, result } = useAITool('/api/ai/readme')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    run({
      name,
      description,
      tech,
      github_link: githubLink || undefined,
      live_link: liveLink || undefined,
    })
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(result.readme_markdown).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([result.readme_markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(name || 'README').replace(/\s+/g, '-')}-README.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
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
          <label className="text-[13px] font-medium text-navy">Description</label>
          <textarea
            required
            className={`${inputClasses} min-h-20 resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does it do?"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Tech stack</label>
          <TagInput tags={tech} onChange={setTech} placeholder="Add a technology" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-navy">GitHub link</label>
            <input
              className={inputClasses}
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/…"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-navy">Live link</label>
            <input
              className={inputClasses}
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Writing README…' : 'Generate README'}
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-[12px] font-medium text-orange"
              >
                {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-[12px] font-medium text-orange"
              >
                <Download size={13} strokeWidth={1.75} />
                Download .md
              </button>
            </div>
            <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-bg p-4 text-[12px] leading-relaxed text-navy">
              {result.readme_markdown}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
