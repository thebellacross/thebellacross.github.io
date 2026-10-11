import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { scenes } from './data/scenes'
import type { Project } from './data/scenes'
import { useReducedMotion } from './motion/useMotion'
import { useSceneController } from './navigation/useSceneController'
import { ExhibitionScene } from './scenes/ExhibitionScene'
import { SceneNavigation } from './components/SceneNavigation'
import { MusicProductionDetail, SceneArchiveDetail } from './components/MusicProductionDetail'

export default function App() {
  const stage = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [project, setProject] = useState<Project | null>(null)
  const projectOpener = useRef<HTMLElement | null>(null)
  const wheelState = useRef({ total: 0, lastEvent: -Infinity, direction: 0, consumed: false })
  const controller = useSceneController(stage, reduced)
  const { active, phase, navigate, step } = controller
  const scene = scenes[active]
  const overlayOpen = !!project
  const closeProject = useCallback(() => { setProject(null); projectOpener.current = null }, [])
  const selectProject = useCallback((item: Project) => {
    if (!projectOpener.current) projectOpener.current = document.activeElement as HTMLElement
    setProject(item)
  }, [])

  useEffect(() => {
    const canvas = shell.current!
    let touchStart: { x: number; y: number; time: number } | null = null
    const isMediaControl = (target: EventTarget | null) => target instanceof Element && !!target.closest('audio, video, input, textarea, select')
    const wheel = (event: WheelEvent) => {
      if (overlayOpen || isMediaControl(event.target) || event.ctrlKey) return
      event.preventDefault()
      const now = performance.now()
      const gesture = wheelState.current
      const previousWheel = gesture.lastEvent
      gesture.lastEvent = now
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
      if (!delta) return
      const direction = Math.sign(delta)
      if (now - previousWheel > 110 || direction !== gesture.direction) { gesture.total = 0; gesture.consumed = false }
      gesture.direction = direction
      if (phase !== 'idle') { gesture.total = 0; gesture.consumed = true; return }
      if (gesture.consumed) return
      gesture.total += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      if (Math.abs(gesture.total) >= 24) { gesture.consumed = true; gesture.total = 0; step(direction) }
    }
    const keyboard = (event: KeyboardEvent) => {
      if (overlayOpen || isMediaControl(event.target) || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); step(1) }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); step(-1) }
      if (/^[123]$/.test(event.key)) navigate(Number(event.key) - 1)
    }
    const touchDown = (event: TouchEvent) => {
      if (overlayOpen || event.touches.length !== 1 || isMediaControl(event.target)) { touchStart = null; return }
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now() }
    }
    const touchUp = (event: TouchEvent) => {
      if (!touchStart || overlayOpen || !event.changedTouches.length) return
      const dx = event.changedTouches[0].clientX - touchStart.x
      const dy = event.changedTouches[0].clientY - touchStart.y
      if (performance.now() - touchStart.time < 1500 && Math.max(Math.abs(dx), Math.abs(dy)) >= 30) step((Math.abs(dx) > Math.abs(dy) ? dx : dy) < 0 ? 1 : -1)
      touchStart = null
    }
    const touchCancel = () => { touchStart = null }
    canvas.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', keyboard)
    canvas.addEventListener('touchstart', touchDown, { passive: true })
    canvas.addEventListener('touchend', touchUp, { passive: true })
    canvas.addEventListener('touchcancel', touchCancel, { passive: true })
    return () => {
      canvas.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', keyboard)
      canvas.removeEventListener('touchstart', touchDown)
      canvas.removeEventListener('touchend', touchUp)
      canvas.removeEventListener('touchcancel', touchCancel)
    }
  }, [overlayOpen, phase, step, navigate])

  useEffect(() => {
    const frame = shell.current!
    if (reduced || overlayOpen) {
      frame.style.setProperty('--pointer-x', '0px')
      frame.style.setProperty('--pointer-y', '0px')
      return
    }
    let request = 0
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      cancelAnimationFrame(request)
      request = requestAnimationFrame(() => {
        frame.style.setProperty('--pointer-x', `${(event.clientX / window.innerWidth - 0.5) * 6}px`)
        frame.style.setProperty('--pointer-y', `${(event.clientY / window.innerHeight - 0.5) * 6}px`)
      })
    }
    const reset = () => { frame.style.setProperty('--pointer-x', '0px'); frame.style.setProperty('--pointer-y', '0px') }
    frame.addEventListener('pointermove', move)
    frame.addEventListener('pointerleave', reset)
    return () => { cancelAnimationFrame(request); frame.removeEventListener('pointermove', move); frame.removeEventListener('pointerleave', reset) }
  }, [reduced, overlayOpen])

  const motionOff = reduced
  return <main ref={shell} className={`exhibition ${motionOff ? 'motion-paused' : ''}`} style={{ '--scene-accent': active === 1 ? 'var(--red)' : 'var(--copper)' } as CSSProperties}>
    <div className="exhibition-content" inert={overlayOpen}>
      <h1 className="wordmark">BELLACROSS</h1>
      <div ref={stage} className="scene-stage" aria-busy={phase !== 'idle'}><ExhibitionScene active={active} moving={phase !== 'idle'} reduced={motionOff} paused={overlayOpen} onNavigate={navigate} onSelect={selectProject} /></div>
      <footer className="stage-footer"><SceneNavigation active={active} onNavigate={navigate} onStep={step} /></footer>
    </div>
    {project && (scene.id === 'music-production'
      ? <MusicProductionDetail reduced={motionOff} onClose={closeProject} returnFocus={projectOpener.current} />
      : <SceneArchiveDetail key={scene.id} content={scene.detail} reduced={motionOff} onClose={closeProject} returnFocus={projectOpener.current} />)}
    <span className="sr-only" role="status" aria-live="polite">Scene {active + 1} of 3: {scene.title}</span>
  </main>
}
