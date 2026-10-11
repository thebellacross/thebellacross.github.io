import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from 'gsap'

export function FocusDialog({ children, labelId, className, reduced, onClose, returnFocus, inactive = false }: {
  children: ReactNode; labelId: string; className: string; reduced: boolean; onClose: () => void; returnFocus: HTMLElement | null; inactive?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (reduced) return
    const context = gsap.context(() => {
      gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      const targets = ref.current!.querySelectorAll('[data-dialog-reveal]')
      if (targets.length) gsap.fromTo(targets, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    }, ref)
    return () => context.revert()
  }, [reduced])
  useEffect(() => {
    const previous = returnFocus
    const element = ref.current!
    const focusable = () => Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], audio[controls], video[controls], [tabindex="0"]'))
      .filter(item => !item.closest('[inert]') && getComputedStyle(item).visibility !== 'hidden' && item.getClientRects().length > 0)
    focusable()[0]?.focus({ preventScroll: true })
    const trap = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    element.addEventListener('keydown', trap)
    return () => {
      element.removeEventListener('keydown', trap)
      // Wait for React to remove inert. Ignore StrictMode's simulated unmount.
      requestAnimationFrame(() => { if (!element.isConnected && previous?.isConnected) previous.focus({ preventScroll: true }) })
    }
  }, [onClose, returnFocus])
  return <div ref={ref} className={`dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelId} inert={inactive} aria-hidden={inactive || undefined}>
    {children}
  </div>
}
