import { useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'forYou', label: 'For You' },
  { id: 'explore', label: 'Explore' },
]

export default function FeedTopTabs({ active = 'forYou' }) {
  const navigate = useNavigate()

  const handleClick = (id) => {
    if (id === 'explore') {
      navigate('/explore')
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center gap-8 pt-[calc(env(safe-area-inset-top)+18px)]">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleClick(tab.id)}
            className="pointer-events-auto flex flex-col items-center gap-1.5"
          >
            <span
              className={`text-scrim text-[15px] font-semibold ${
                isActive ? 'text-white' : 'text-white/70'
              }`}
            >
              {tab.label}
            </span>
            <span
              className={`h-[2px] w-6 rounded-full transition-colors ${
                isActive ? 'bg-orange' : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
