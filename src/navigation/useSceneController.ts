import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { scenes } from '../data/scenes'

type Slot = 'left' | 'center' | 'right'
type Box = { x: number; y: number; width: number; height: number }
type Layout = Record<Slot, Box>
const wrap = (index: number) => (index + scenes.length) % scenes.length
const slotFor = (index: number, active: number): Slot => index === active ? 'center' : index === wrap(active - 1) ? 'left' : 'right'
const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress

// Old bookmarks keep working; current routes use the three scene identities.
const legacyRoutes: Record<string, string> = { 'music-product': 'music-production', 'music-direction': 'music-curation' }
const sceneFromHash = () => {
  const id = window.location.hash.slice(1)
  return Math.max(0, scenes.findIndex(scene => scene.id === (legacyRoutes[id] || id)))
}
const canonicalizeHash = () => {
  const canonical = legacyRoutes[window.location.hash.slice(1)]
  if (canonical) window.history.replaceState(null, '', `#${canonical}`)
}

export function useSceneController(stage: RefObject<HTMLDivElement | null>, reduced: boolean) {
  const [state, setState] = useState<{ active: number; phase: 'entering' | 'moving' | 'idle' }>(() => ({ active: sceneFromHash(), phase: 'entering' }))
  const active = useRef(state.active)
  const busy = useRef(true)
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced
  const frames = useRef<HTMLElement[]>([])
  const layout = useRef<Layout | null>(null)
  const animation = useRef<gsap.core.Tween | null>(null)
  const destination = useRef<number | null>(null)
  const pending = useRef<number | null>(null)
  const request = useRef<(index: number) => void>(() => {})

  const place = useCallback((index: number) => {
    if (!layout.current) return
    frames.current.forEach((frame, i) => {
      const slot = slotFor(i, index)
      gsap.set(frame, { ...layout.current![slot], opacity: 1, zIndex: slot === 'center' ? 3 : 2 })
    })
  }, [])

  const finish = useCallback((index: number) => {
    animation.current = null
    destination.current = null
    active.current = index
    busy.current = false
    place(index)
    setState({ active: index, phase: 'idle' })
    window.history.replaceState(null, '', `#${scenes[index].id}`)
    const next = pending.current
    pending.current = null
    if (next !== null && next !== index) request.current(next)
  }, [place])

  const navigate = useCallback((index: number) => {
    const target = wrap(index)
    if (busy.current) { pending.current = target; return }
    const previous = active.current
    if (target === previous) return
    const positions = layout.current
    if (!positions || reducedRef.current) { finish(target); return }
    busy.current = true
    destination.current = target
    setState(current => ({ ...current, phase: 'moving' }))
    const direction = target === wrap(previous + 1) ? 1 : -1
    const wrappingImage = wrap(previous - direction)
    const title = stage.current?.querySelector<HTMLElement>('.scene-title-block')
    const safeBottom = (title?.offsetTop ?? (stage.current?.clientHeight ?? 800) * .83) - 18
    const travel = { progress: 0 }
    animation.current = gsap.to(travel, {
      progress: 1, duration: .56, ease: 'power2.inOut',
      onUpdate: () => {
        const t = travel.progress
        frames.current.forEach((frame, i) => {
          const from = positions[slotFor(i, previous)]
          const to = positions[slotFor(i, target)]
          let width = interpolate(from.width, to.width, t)
          let height = interpolate(from.height, to.height, t)
          let x = interpolate(from.x, to.x, t)
          let y = interpolate(from.y, to.y, t)
          if (i === wrappingImage) {
            // The third photograph travels beneath the composition along the
            // same reversible arc, rather than teleporting or changing its src.
            const shrink = 1 - .6 * Math.sin(Math.PI * t)
            width *= shrink
            height *= shrink
            const midHeight = (from.height + to.height) * .2
            const midY = Math.min(positions.center.y + positions.center.height + 18, safeBottom) - midHeight
            const controlY = 2 * midY - (from.y + to.y) * .5
            y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * controlY + t ** 2 * to.y
            y = Math.min(y, safeBottom - height)
            const around = direction > 0 ? t * t : 1 - (1 - t) ** 2
            x = interpolate(from.x, to.x, around)
          }
          gsap.set(frame, {
            x, y, width, height,
            zIndex: i === wrappingImage ? 1 : slotFor(i, target) === 'center' ? 3 : 2,
          })
        })
      },
      onComplete: () => finish(target),
    })
  }, [finish, stage])
  request.current = navigate

  const step = useCallback((direction: number) => {
    if (!busy.current) navigate(active.current + direction)
  }, [navigate])

  useLayoutEffect(() => {
    const element = stage.current
    if (!element) return
    frames.current = Array.from(element.querySelectorAll<HTMLElement>('[data-carousel-index]'))
    const measure = (initial = false) => {
      const next = Object.fromEntries((['left', 'center', 'right'] as const).map(slot => {
        const guide = element.querySelector<HTMLElement>(`[data-slot-measure="${slot}"]`)!
        return [slot, { x: guide.offsetLeft, y: guide.offsetTop, width: guide.offsetWidth, height: guide.offsetHeight }]
      })) as Layout
      if (!initial && JSON.stringify(layout.current) === JSON.stringify(next)) return
      layout.current = next
      const target = destination.current ?? active.current
      animation.current?.kill()
      place(target)
      if (!initial) finish(target)
    }
    canonicalizeHash()
    measure(true)
    if (reducedRef.current) finish(active.current)
    else animation.current = gsap.from(frames.current, { opacity: 0, duration: .48, ease: 'power2.out', onComplete: () => finish(active.current) })
    const observer = new ResizeObserver(() => measure())
    observer.observe(element)
    return () => { observer.disconnect(); animation.current?.kill() }
  }, [stage, finish, place])

  useEffect(() => {
    const update = () => { canonicalizeHash(); navigate(sceneFromHash()) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [navigate])

  useEffect(() => { if (reduced) animation.current?.progress(1) }, [reduced])

  return { ...state, navigate, step }
}
