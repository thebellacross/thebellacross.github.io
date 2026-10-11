import { useRef } from 'react'
import { scenes } from '../data/scenes'
import type { Project } from '../data/scenes'
import { MediaFrame } from '../components/MediaFrame'
import { useCarouselDrift } from '../motion/useMotion'

export function ExhibitionScene({ active, reduced, paused, moving, onNavigate, onSelect }: {
  active: number; reduced: boolean; paused: boolean; moving: boolean; onNavigate: (index: number) => void; onSelect: (project: Project) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scene = scenes[active]
  useCarouselDrift(ref, reduced, paused || moving)
  return <div ref={ref} className={`scene scene--carousel scene--${scene.composition}`} data-scene={scene.id}>
    <div className="composition">
      {(['left', 'center', 'right'] as const).map(slot => <span key={slot} className={`carousel-slot carousel-slot--${slot}`} data-slot-measure={slot} aria-hidden="true" />)}
      {scenes.map((item, index) => <MediaFrame key={item.id} scene={item} index={index}
        slot={index === active ? 'center' : index === (active + scenes.length - 1) % scenes.length ? 'left' : 'right'}
        paused={paused || reduced} moving={moving}
        onActivate={() => index === active ? onSelect(item.projects[0]) : onNavigate(index)} />)}
    </div>
    <div className="scene-title-block" data-reveal>
      <h2 aria-label={scene.title}><button className="scene-title-open" aria-label={scene.detail.controls.openLabel} aria-haspopup="dialog"
        aria-disabled={moving || undefined} onClick={event => { if (moving) return; event.currentTarget.focus({ preventScroll: true }); onSelect(scene.projects[0]) }}>{scene.title}</button></h2>
    </div>
  </div>
}
