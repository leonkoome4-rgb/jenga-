import { useState } from 'react'
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function MediaBackground({
  imageUrl,
  videoUrl,
  name,
  tint,
  className = '',
  iconSize = 40,
  playing = true,
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  if (videoUrl && playing && !videoFailed) {
    return (
      <video
        src={videoUrl}
        poster={imageUrl && !imageFailed ? imageUrl : undefined}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setVideoFailed(true)}
        className={`${className} object-contain`}
      />
    )
  }

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setImageFailed(true)}
        className={`${className} object-contain`}
      />
    )
  }

  return <ImagePlaceholder className={className} iconSize={iconSize} tint={tint} />
}
