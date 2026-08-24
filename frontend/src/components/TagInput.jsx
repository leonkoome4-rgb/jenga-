import { useState } from 'react'
import { X } from 'lucide-react'

export default function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim()
    if (value && !tags.includes(value)) {
      onChange([...tags, value])
    }
    setDraft('')
  }

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 rounded-xl border-[1.5px] border-navy px-4 py-2.5 text-[13px] font-medium text-navy hover:bg-navy/5"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border-[1.5px] border-blue/40 bg-blue/10 px-3 py-1 text-[13px] text-blue"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
