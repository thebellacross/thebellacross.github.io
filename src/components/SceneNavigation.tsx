import { scenes } from '../data/scenes'

export function SceneNavigation({ active, onNavigate, onStep }: {
  active: number; onNavigate: (index: number) => void; onStep: (direction: number) => void
}) {
  return <>
    <nav className="scene-nav" aria-label="Scenes">
      {scenes.map((scene, i) => <button key={scene.id} className={active === i ? 'is-active' : ''} onClick={() => onNavigate(i)} aria-label={`0${i + 1} ${scene.title}`} aria-current={active === i ? 'page' : undefined}>
        <span className="nav-number">0{i + 1}</span><span className="nav-title">{scene.title}</span>
      </button>)}
    </nav>
    <div className="scene-arrows"><button onClick={() => onStep(-1)} aria-label="Previous scene">←</button><button onClick={() => onStep(1)} aria-label="Next scene">→</button></div>
  </>
}
