import { useEffect, useRef } from 'react'
import type { Media as MediaData } from '../data/scenes'

export function Media({ media, active = true, controls = false, paused = false }: {
  media: MediaData; active?: boolean; controls?: boolean; paused?: boolean
}) {
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const element = video.current
    if (!element) return
    if (!active || paused) element.pause()
    else if (!controls) void element.play().catch(() => { /* Browsers may require a tap. */ })
    return () => element.pause()
  }, [active, paused, controls])
  if (media.type === 'video') return <video ref={video} src={media.src} poster={media.poster} muted={!controls} loop={!controls} playsInline controls={controls} preload="metadata" aria-label={media.alt} />
  if (media.type === 'audio') return <div className="audio-media"><span>Audio / {media.alt}</span>{controls ? <audio src={media.src} controls preload="metadata" /> : <><span className="audio-wave" aria-hidden="true">▂ ▅ ▃ ▇ ▄ ▆ ▂ ▅ ▇ ▃ ▅ ▂</span><span className="eyebrow">Open to listen ↗</span></>}</div>
  return <img src={media.src} alt={media.alt} draggable={false} decoding="async" />
}
