import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export function useCarouselDrift(ref: RefObject<HTMLDivElement | null>, reduced: boolean, paused: boolean) {
  useEffect(() => {
    if (reduced || paused) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.media-drift').forEach((element, index) => {
        gsap.to(element, {
          x: index % 2 ? -5 : 6, y: index % 2 ? 5 : -6, scale: 1.04,
          duration: index === 1 ? 10 : 18,
          ease: 'sine.inOut', repeat: -1, yoyo: true, delay: index * .3,
        })
      })
    }, ref)
    return () => context.revert()
  }, [reduced, paused, ref])
}
