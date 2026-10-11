import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import type { MusicProductionChapter } from '../data/musicProduction'

type ChapterMeasure = { start: number; readThrough: number; step: number; count: number; duration: number }
type ScrollState = { chapter: number; images: number[]; progress: number; moving: boolean }

const WHEEL_THRESHOLD = 24
const GESTURE_GAP = 110
const TRANSITION_DURATION = .44
const STEP_DISTANCE = 96

// Each deliberate gesture moves one image/chapter. A short scroll tween drives
// the existing paired timelines; gesture sensitivity does not depend on distance.
export function useProductionScroll(ref: RefObject<HTMLDivElement | null>, chapters: MusicProductionChapter[], reduced: boolean) {
  const [state, setState] = useState<ScrollState>({ chapter: 0, images: chapters.map(() => 0), progress: 0, moving: false })
  useLayoutEffect(() => {
    const scroller = ref.current
    if (!scroller) return
    const track = scroller.querySelector<HTMLElement>('.production-track')!
    const elements = Array.from(scroller.querySelectorAll<HTMLElement>('.production-chapter'))
    const stages = elements.map(element => element.querySelector<HTMLElement>('.chapter-stage')!)
    const layers = elements.map(element => Array.from(element.querySelectorAll<HTMLElement>('.chapter-image-layer')))
    let measures: ChapterMeasure[] = []
    let imageTimelines: gsap.core.Timeline[] = []
    let chapterTimelines: gsap.core.Timeline[] = []
    let context: gsap.Context | undefined
    let frame = 0
    let resizeFrame = 0
    let previousY = scroller.scrollTop
    let moving = false
    let navigationTween: gsap.core.Tween | undefined
    const originalTouchAction = scroller.style.touchAction
    scroller.style.touchAction = 'pinch-zoom'
    const gesture = { last: -Infinity, total: 0, direction: 0, consumed: false, reading: -1 }
    let touch: { x: number; y: number; lastY: number; time: number; reading: number } | null = null
    const readingContent = (target: EventTarget | null) => {
      const content = target instanceof Element ? target.closest<HTMLElement>('[data-scroll-content]') : null
      return content && content.scrollHeight > content.clientHeight + 1
    }

    const locate = (y: number) => {
      let chapter = 0
      measures.forEach((measure, index) => { if (y >= measure.start) chapter = index })
      return chapter
    }
    const update = () => {
      const y = scroller.scrollTop
      const images = measures.map((measure, index) => {
        const local = y - measure.start
        const sequence = Math.max(0, local - measure.readThrough)
        // Taller mobile content reads through in this same scroll area; no nested pane.
        stages[index].style.transform = `translateY(${-Math.min(Math.max(0, local - measure.step * .5), measure.readThrough)}px)`
        imageTimelines[index]?.time(sequence, false)
        chapterTimelines[index]?.time(Math.max(0, local), false)
        return Math.min(measure.count - 1, Math.floor((sequence + .5) / measure.step))
      })
      const chapter = locate(y)
      const progress = y / Math.max(1, scroller.scrollHeight - scroller.clientHeight)
      setState(current => current.chapter === chapter && current.progress === progress && current.moving === moving && images.every((image, i) => image === current.images[i])
        ? current : { chapter, images, progress, moving })
      previousY = y
    }
    const measure = () => {
      navigationTween?.kill()
      moving = false
      const oldChapter = locate(previousY)
      const old = measures[oldChapter]
      const local = old ? previousY - old.start : 0
      const reading = old && local < old.readThrough + old.step * .5
      const relative = old ? (reading ? Math.max(0, local - old.step * .5) / Math.max(1, old.readThrough) : (local - old.readThrough) / old.step) : 0
      context?.revert()
      imageTimelines = []
      chapterTimelines = []
      const viewport = scroller.clientHeight
      scroller.style.setProperty('--chapter-viewport', `${viewport}px`)
      const step = STEP_DISTANCE
      let start = 0
      measures = stages.map((stage, index) => {
        const readThrough = Math.max(0, stage.offsetHeight - viewport)
        const count = chapters[index].images.length
        const duration = readThrough + count * step
        const result = { start, readThrough, step, count, duration }
        start += duration
        return result
      })
      track.style.height = `${start + viewport}px`
      if (!reduced) {
        context = gsap.context(() => {
          imageTimelines = layers.map((group, chapterIndex) => {
            gsap.set(group, { autoAlpha: 0, y: 8 })
            gsap.set(group[0], { autoAlpha: 1, y: 0 })
            const timeline = gsap.timeline({ paused: true })
            const reveal = step * .6
            group.slice(1).forEach((layer, i) => {
              const at = (i + 1) * step - reveal / 2
              timeline.to(group[i], { autoAlpha: 0, y: -8, duration: reveal, ease: 'none' }, at)
              timeline.fromTo(layer, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: reveal, ease: 'none', immediateRender: false }, at)
            })
            // A full final image step keeps the information stationary after the last reveal.
            timeline.set({}, {}, measures[chapterIndex].count * step)
            return timeline
          })
          chapterTimelines = stages.map((stage, index) => {
            gsap.set(stage, { autoAlpha: index === 0 ? 1 : 0 })
            const timeline = gsap.timeline({ paused: true })
            const reveal = step * .45
            if (index > 0) timeline.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: reveal, ease: 'none', immediateRender: false }, 0)
            if (index < stages.length - 1) timeline.to(stage, { autoAlpha: 0, duration: reveal, ease: 'none' }, measures[index].duration - reveal)
            else timeline.set({}, {}, measures[index].duration)
            return timeline
          })
        }, scroller)
      }
      if (old) {
        const next = measures[oldChapter]
        scroller.scrollTop = next.start + (reading ? next.step * .5 + relative * next.readThrough : next.readThrough + relative * next.step)
      }
      update()
    }

    const readingChapter = (direction: number) => {
      const index = locate(scroller.scrollTop)
      const current = measures[index]
      const local = scroller.scrollTop - current.start
      const beginning = current.step * .5
      const end = current.readThrough + beginning
      if (current.readThrough > 0 && (direction > 0 ? local < end - 1 : local > beginning + 1 && local <= end + 1)) return index
      return -1
    }
    const read = (index: number, delta: number) => {
      const current = measures[index]
      const beginning = current.start + current.step * .5
      const end = beginning + current.readThrough
      scroller.scrollTop = Math.max(beginning, Math.min(end, Math.max(beginning, scroller.scrollTop) + delta))
      update()
    }
    const navigate = (direction: number) => {
      if (moving) return
      const steps = measures.flatMap((current, chapter) => Array.from({ length: current.count }, (_, image) => ({
        chapter, image, position: current.start + current.readThrough + (image + .5) * current.step,
      })))
      const chapter = locate(scroller.scrollTop)
      const current = measures[chapter]
      const image = Math.min(current.count - 1, Math.floor(Math.max(0, scroller.scrollTop - current.start - current.readThrough) / current.step))
      const maximum = scroller.scrollHeight - scroller.clientHeight
      const atEnd = scroller.scrollTop >= maximum - 1
      const index = atEnd ? steps.length : steps.findIndex(step => step.chapter === chapter && step.image === image)
      const next = Math.max(0, Math.min(steps.length, index + direction))
      if (next === index) return
      // Enter taller chapters at the top; subsequent gestures read their text
      // before advancing. Reverse entry lands at the end of that same read range.
      const target = next === steps.length ? maximum : direction > 0 && steps[next].chapter !== chapter
        ? measures[steps[next].chapter].start + current.step * .5 : steps[next].position
      // Start from a settled frame so the first gesture animates immediately too.
      if (!atEnd) scroller.scrollTop = steps[index].position
      if (reduced) { scroller.scrollTop = target; update(); return }
      moving = true
      update()
      const position = { y: scroller.scrollTop }
      navigationTween = gsap.to(position, {
        y: target, duration: TRANSITION_DURATION, ease: 'power2.inOut',
        onUpdate: () => { scroller.scrollTop = position.y; update() },
        onComplete: () => { scroller.scrollTop = target; moving = false; update() },
      })
    }
    const wheel = (event: WheelEvent) => {
      // Unified galleries keep long editorial copy independently readable,
      // while a gesture over the image still advances exactly one frame.
      if (readingContent(event.target)) return
      if (event.ctrlKey || !event.deltaY || (event.target instanceof Element && event.target.closest('input, textarea, select, audio, video'))) return
      event.preventDefault()
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1)
      const direction = Math.sign(delta)
      const now = performance.now()
      if (now - gesture.last > GESTURE_GAP || direction !== gesture.direction) {
        gesture.total = 0; gesture.consumed = false; gesture.reading = -1
      }
      gesture.last = now
      gesture.direction = direction
      if (moving) { gesture.consumed = true; gesture.total = 0; return }
      if (gesture.reading >= 0) { read(gesture.reading, delta); return }
      if (gesture.consumed) return
      const reading = readingChapter(direction)
      if (reading >= 0) { gesture.reading = reading; read(reading, delta); return }
      gesture.total += delta
      if (Math.abs(gesture.total) >= WHEEL_THRESHOLD) {
        gesture.consumed = true; gesture.total = 0
        navigate(direction)
      }
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target !== scroller) return
      const direction = ['ArrowDown', 'PageDown', ' '].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0
      if (!direction) return
      event.preventDefault()
      const reading = readingChapter(direction)
      if (reading >= 0) read(reading, direction * Math.min(120, scroller.clientHeight * .4))
      else navigate(direction)
    }
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || readingContent(event.target)) { touch = null; return }
      const point = event.touches[0]
      touch = { x: point.clientX, y: point.clientY, lastY: point.clientY, time: performance.now(), reading: -1 }
    }
    const touchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return
      const point = event.touches[0]
      const dy = touch.y - point.clientY
      const dx = touch.x - point.clientX
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return
      if (event.cancelable) event.preventDefault()
      if (moving) return
      if (touch.reading < 0 && Math.abs(dy) >= Math.abs(dx)) touch.reading = readingChapter(Math.sign(dy))
      if (touch.reading >= 0) read(touch.reading, touch.lastY - point.clientY)
      touch.lastY = point.clientY
    }
    const touchEnd = (event: TouchEvent) => {
      const start = touch
      touch = null
      if (!start || !event.changedTouches.length || start.reading >= 0 || performance.now() - start.time > 1500) return
      const point = event.changedTouches[0]
      const dx = start.x - point.clientX
      const dy = start.y - point.clientY
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx
      if (Math.abs(delta) >= 30) navigate(Math.sign(delta))
    }
    const touchCancel = () => { touch = null }
    const scroll = () => { if (moving) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    const resize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measure) }
    measure()
    const observer = new ResizeObserver(resize)
    observer.observe(scroller)
    stages.forEach(stage => observer.observe(stage))
    scroller.addEventListener('scroll', scroll, { passive: true })
    scroller.addEventListener('wheel', wheel, { passive: false })
    scroller.addEventListener('keydown', keyboard)
    scroller.addEventListener('touchstart', touchStart, { passive: true })
    scroller.addEventListener('touchmove', touchMove, { passive: false })
    scroller.addEventListener('touchend', touchEnd, { passive: true })
    scroller.addEventListener('touchcancel', touchCancel, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', scroll)
      scroller.removeEventListener('wheel', wheel)
      scroller.removeEventListener('keydown', keyboard)
      scroller.removeEventListener('touchstart', touchStart)
      scroller.removeEventListener('touchmove', touchMove)
      scroller.removeEventListener('touchend', touchEnd)
      scroller.removeEventListener('touchcancel', touchCancel)
      navigationTween?.kill()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(resizeFrame)
      context?.revert()
      stages.forEach(stage => stage.style.removeProperty('transform'))
      scroller.style.touchAction = originalTouchAction
    }
  }, [ref, chapters, reduced])
  return state
}
