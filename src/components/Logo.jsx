import { Link } from 'react-router-dom'

function BranchMark({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <line x1="40" y1="70" x2="40" y2="46" stroke="#F1793D" strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="52" x2="22" y2="34" stroke="#F1793D" strokeWidth="4" strokeLinecap="round" />
      <line x1="40" y1="46" x2="52" y2="26" stroke="#F1793D" strokeWidth="4" strokeLinecap="round" />
      <line x1="22" y1="34" x2="14" y2="16" stroke="#F1793D" strokeWidth="4" strokeLinecap="round" />
      <line x1="22" y1="34" x2="30" y2="14" stroke="#F1793D" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="70" r="6" fill="#F1793D" />
      <circle cx="40" cy="46" r="5" fill="#F1793D" />
      <circle cx="22" cy="34" r="5" fill="#F1793D" />
      <circle cx="52" cy="26" r="6" fill="#F1793D" />
      <circle cx="14" cy="16" r="6" fill="#F1793D" />
      <circle cx="30" cy="14" r="6" fill="#F1793D" />
    </svg>
  )
}

export default function Logo({ to = '/', size = 'compact', className = '' }) {
  const isLarge = size === 'large'

  return (
    <Link
      to={to}
      className={`inline-flex items-center ${isLarge ? 'gap-5' : 'gap-2.5'} ${className}`}
    >
      <BranchMark className={isLarge ? 'h-14 w-14 shrink-0' : 'h-8 w-8 shrink-0'} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-heading font-bold ${isLarge ? 'text-[26px]' : 'text-[18px]'}`}
        >
          <span className="text-navy">MORINGA</span>{' '}
          <span className={`font-normal text-text-muted ${isLarge ? 'text-[20px]' : 'text-[14px]'}`}>
            &times;
          </span>{' '}
          <span className="text-orange">TAWI</span>
        </span>
        <span
          className={`font-medium uppercase text-text-secondary ${
            isLarge ? 'mt-2 text-[11.5px] tracking-[1.2px]' : 'mt-0.5 text-[8px] tracking-wide'
          }`}
        >
          Where your work branches out
        </span>
      </span>
    </Link>
  )
}
