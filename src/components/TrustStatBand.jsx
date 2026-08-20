import { Calendar, GraduationCap, Briefcase, Star } from 'lucide-react'

const stats = [
  { icon: Calendar, value: '2014', label: 'Year Moringa was founded', color: 'orange' },
  { icon: GraduationCap, value: '8,000+', label: 'Trained Professionals', color: 'blue' },
  { icon: Briefcase, value: '1,000+', label: 'Employers that trust Moringa', color: 'orange' },
  { icon: Star, value: '95%', label: 'Graduate Satisfaction Rating', color: 'blue' },
]

export default function TrustStatBand({ className = '' }) {
  return (
    <div className={`bg-navy ${className}`}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 sm:grid-cols-4 sm:gap-x-8">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="flex items-center gap-3.5">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <span className="absolute inset-y-0 left-0 w-3 border-y-2 border-l-2 border-white/40" />
              <Icon
                size={26}
                strokeWidth={1.75}
                className={color === 'orange' ? 'text-orange' : 'text-blue'}
              />
            </span>
            <div>
              <p className={`font-heading text-[24px] font-bold ${color === 'orange' ? 'text-orange' : 'text-blue'}`}>
                {value}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-white/80">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
