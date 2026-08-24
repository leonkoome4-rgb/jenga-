// A small on-brand dog mascot for the assistant button -- built as inline
// SVG (no external art/licensing to worry about) using only the app's
// existing navy/orange/blue palette. The tail wags and the whole mascot
// bounces gently so it reads as "alive," not just a static icon.
export default function DogMascot({ className = '', animated = true, poked = false }) {
  return (
    <svg
      viewBox="0 0 100 112"
      className={`${className} ${animated ? 'mascot-idle' : ''} ${poked ? 'mascot-pop' : ''}`}
      aria-hidden="true"
    >
      <g className="mascot-tail" style={{ transformOrigin: '80px 90px' }}>
        <ellipse cx="80" cy="72" rx="7" ry="17" fill="#10204A" transform="rotate(15 80 72)" />
      </g>

      <ellipse cx="50" cy="92" rx="27" ry="17" fill="#F1793D" stroke="#10204A" strokeWidth="3" />

      <ellipse cx="37" cy="105" rx="7.5" ry="5" fill="#FFFFFF" stroke="#10204A" strokeWidth="2.5" />
      <ellipse cx="63" cy="105" rx="7.5" ry="5" fill="#FFFFFF" stroke="#10204A" strokeWidth="2.5" />

      <ellipse cx="21" cy="40" rx="10" ry="15.5" fill="#10204A" transform="rotate(-25 21 40)" />
      <ellipse cx="79" cy="40" rx="10" ry="15.5" fill="#10204A" transform="rotate(25 79 40)" />

      <circle cx="50" cy="52" r="30" fill="#F1793D" stroke="#10204A" strokeWidth="3" />

      <rect x="33" y="74" width="34" height="7" rx="3.5" fill="#4FA3DC" />
      <circle cx="50" cy="84" r="3.4" fill="#FFFFFF" stroke="#10204A" strokeWidth="1.5" />

      <ellipse cx="50" cy="62" rx="15.5" ry="10.5" fill="#FFFFFF" />
      <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#10204A" />

      <circle cx="36" cy="46" r="4" fill="#10204A" />
      <circle cx="64" cy="46" r="4" fill="#10204A" />
      <circle cx="34.5" cy="44.5" r="1.3" fill="#FFFFFF" />
      <circle cx="62.5" cy="44.5" r="1.3" fill="#FFFFFF" />
    </svg>
  )
}
