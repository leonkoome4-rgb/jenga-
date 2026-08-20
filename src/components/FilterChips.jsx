export default function FilterChips({ options, active, onChange, className = '' }) {
  return (
    <div
      className={`no-scrollbar flex gap-2 overflow-x-auto ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option === active
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`shrink-0 rounded-full border-[1.5px] bg-white px-4 py-2 text-[13px] font-medium transition-colors ${
              isActive ? 'border-orange text-orange' : 'border-navy/70 text-navy hover:border-navy'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
