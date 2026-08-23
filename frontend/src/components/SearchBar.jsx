import { Search } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search projects, technologies, or creators',
  className = '',
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-full border border-border bg-white px-4 py-3 ${className}`}
    >
      <Search size={17} strokeWidth={1.75} className="shrink-0 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[14px] text-navy placeholder:text-text-muted focus:outline-none"
      />
    </div>
  )
}
