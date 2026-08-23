import { useState } from 'react'

const sizes = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-14 w-14 text-[18px]',
  xl: 'h-24 w-24 text-[28px]',
}

const initials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizeClasses = sizes[size]
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClasses} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full bg-blue/15 font-medium text-navy ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
