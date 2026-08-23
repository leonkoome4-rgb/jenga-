import { Image } from 'lucide-react'

export default function ImagePlaceholder({ className = '', iconSize = 28, tint = '#4FA3DC' }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundColor: `${tint}1F` }}
    >
      <Image size={iconSize} strokeWidth={1.5} style={{ color: tint }} />
    </div>
  )
}
