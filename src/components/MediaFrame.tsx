import type { Scene } from '../data/scenes'
import { Media } from './Media'

export function MediaFrame({ scene, slot, index, paused, moving, onActivate }: {
  scene: Scene; slot: 'left' | 'center' | 'right'; index: number; paused: boolean; moving: boolean; onActivate: () => void
}) {
  const center = slot === 'center'
  return <button className={`media-frame media-frame--${slot}`} data-carousel-index={index} data-carousel-scene={scene.id} data-slot={slot}
    onClick={event => { if (moving) return; event.currentTarget.focus({ preventScroll: true }); onActivate() }}
    aria-disabled={moving || undefined} aria-haspopup={center ? 'dialog' : undefined}
    aria-label={center ? scene.detail.controls.openLabel : `Go to ${scene.title}`}>
    <span className="media-viewport"><span className="media-drift"><Media media={scene.projects[0].media} paused={paused} /></span></span>
    {center && <span className="frame-open" aria-hidden="true">↗</span>}
  </button>
}
