import { useState } from 'react'
import { AlertCircle, Sparkles, Copy, Check } from 'lucide-react'
import Button from '../Button.jsx'
import { useAITool } from '../../hooks/useAITool.js'

const inputClasses =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange'

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Other']

export default function DebugTool() {
  const [language, setLanguage] = useState('Python')
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const { run, loading, error, result } = useAITool('/api/ai/debug')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    run({ language, code, error_message: errorMessage })
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(result.corrected_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Language</label>
          <select
            className={inputClasses}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Code</label>
          <textarea
            required
            className={`${inputClasses} min-h-32 resize-none font-mono text-[13px]`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste the code that's failing"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-navy">Error message</label>
          <textarea
            required
            className={`${inputClasses} min-h-16 resize-none font-mono text-[13px]`}
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="Paste the error / traceback"
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
          <Sparkles size={15} strokeWidth={1.75} />
          {loading ? 'Debugging…' : 'Debug this'}
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
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Cause</p>
              <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">{result.cause}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">Fix</p>
              <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">{result.fix}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
                  Corrected code
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-orange"
                >
                  {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="mt-1 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl bg-bg p-4 font-mono text-[12px] leading-relaxed text-navy">
                {result.corrected_code}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
