import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { musicProduction } from '../data/musicProduction'
import type { ArchiveContent, ArchiveImage, MusicProductionChapter } from '../data/musicProduction'
import { useProductionScroll } from '../motion/useProductionScroll'
import { FocusDialog } from './FocusDialog'

function ChapterInformation({ chapter }: { chapter: MusicProductionChapter }) {
  const selections = Array.isArray(chapter.selection) ? chapter.selection : chapter.selection ? [chapter.selection] : []
  const details = [
    { label: 'Year', value: chapter.year },
    { label: 'Label', value: chapter.label },
    { label: 'Catalog', value: chapter.catalog },
    { label: 'Format', value: chapter.format },
    { label: 'Publication', value: chapter.publication },
    { label: 'Released', value: chapter.releaseDate },
    ...(chapter.credits ?? []),
  ].filter(detail => detail.value)
  return <div className="chapter-information" data-scroll-content={chapter.selection ? '' : undefined}
    tabIndex={chapter.selection ? 0 : undefined} role={chapter.selection ? 'region' : undefined}
    aria-label={chapter.selection ? `${chapter.title} information` : undefined}>
    <h2 id={chapter.introduction ? 'production-title' : `${chapter.id}-title`}>{chapter.title}</h2>
    {!!details.length && <dl className="chapter-details">{details.map(detail =>
      <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>
    )}</dl>}
    <p className="chapter-description">{chapter.description}</p>
    {chapter.paragraphs?.map(paragraph => <p key={paragraph} className="chapter-description chapter-copy">{paragraph}</p>)}
    {selections.map(selection => <div key={selection.title} className="chapter-selection">
      <h3>{selection.title}</h3>
      <ul>{selection.items.map(item => <li key={item}>{item}</li>)}</ul>
    </div>)}
    {chapter.note && <p className="chapter-description chapter-note">{chapter.note}</p>}
    {!!chapter.tracks?.length && <ol className="chapter-tracks">{chapter.tracks.map(track => <li key={track}>{track}</li>)}</ol>}
    {!!chapter.links.length && <div className="chapter-links">{chapter.links.filter(link => /^https?:\/\//.test(link.url)).map(link =>
      <a key={link.url} href={link.url} target="_blank" rel={chapter.introduction ? 'noopener noreferrer' : 'noreferrer'}>{link.label}<span aria-hidden="true">↗</span></a>
    )}</div>}
  </div>
}

function ImageViewer({ image, reduced, onClose, returnFocus }: {
  image: ArchiveImage; reduced: boolean; onClose: () => void; returnFocus: HTMLElement | null
}) {
  const [zoomed, setZoomed] = useState(false)
  const { controls } = musicProduction
  return createPortal(<FocusDialog className="production-viewer" labelId="production-viewer-title" reduced={reduced} onClose={onClose} returnFocus={returnFocus}>
    <h2 id="production-viewer-title" className="sr-only">{controls.viewerTitle}</h2>
    <div className="viewer-topline">
      <button className="text-control" aria-label={controls.viewerClose} onClick={onClose}>← <span>Close</span></button>
      <button className="text-control" aria-pressed={zoomed} onClick={() => setZoomed(current => !current)}>{zoomed ? controls.zoomOut : controls.zoomIn}<span aria-hidden="true">{zoomed ? '−' : '+'}</span></button>
    </div>
    <div className="viewer-scroll" role="region" aria-label={image.alt} tabIndex={0}>
      <div className={`viewer-canvas ${zoomed ? 'is-zoomed' : ''}`} style={{ '--image-width': `${image.width}px`, '--image-height': `${image.height}px` } as CSSProperties}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} draggable={false} />
      </div>
    </div>
  </FocusDialog>, document.body)
}

type DetailProps = { reduced: boolean; onClose: () => void; returnFocus: HTMLElement | null }

export function MusicProductionDetail(props: DetailProps) {
  return <SceneArchiveDetail content={musicProduction} {...props} />
}

export function SceneArchiveDetail({ content, reduced, onClose, returnFocus }: DetailProps & { content: ArchiveContent }) {
  const scroller = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const exitTween = useRef<gsap.core.Tween | null>(null)
  const imageOpener = useRef<HTMLElement | null>(null)
  const [viewer, setViewer] = useState<ArchiveImage | null>(null)
  const state = useProductionScroll(scroller, content.chapters, reduced)
  useEffect(() => () => { exitTween.current?.kill() }, [])
  const closeViewer = useCallback(() => setViewer(null), [])
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const dialog = scroller.current?.closest('.dialog')
    if (reduced || !dialog) { onClose(); return }
    exitTween.current = gsap.to(dialog, { opacity: 0, duration: .24, ease: 'power2.out', overwrite: 'auto', onComplete: onClose })
  }, [onClose, reduced])
  const { controls, chapters } = content
  const active = chapters[state.chapter]
  const titleId = chapters[0].introduction ? 'production-title' : `${chapters[0].id}-title`
  return <>
    <FocusDialog className={`production-detail ${chapters.length === 1 ? 'production-detail--single' : ''}`} labelId={titleId} reduced={reduced} onClose={close} returnFocus={returnFocus} inactive={!!viewer}>
      <div className="dialog-topline">
        <button className="text-control" onClick={close} aria-label={controls.backLabel}>← <span>{controls.back}</span></button>
        <div className="chapter-progress" aria-hidden="true"><span style={{ transform: `scaleX(${state.progress})` }} /></div>
      </div>
      <div ref={scroller} className="production-scroll" role="region" aria-label={controls.scrollLabel} tabIndex={0}
        data-active-chapter={active.id} data-active-image={state.images[state.chapter]} data-progress={state.progress} data-moving={state.moving}>
        <div className="production-track"><div className="production-pinned">
          {chapters.map((chapter, chapterIndex) => <section key={chapter.id} className={`production-chapter ${chapter.introduction ? 'production-chapter--intro' : ''} ${state.chapter === chapterIndex ? 'is-active' : ''}`}
            data-chapter={chapter.id} inert={state.chapter !== chapterIndex} aria-hidden={state.chapter !== chapterIndex || undefined} aria-labelledby={chapter.introduction ? 'production-title' : `${chapter.id}-title`}>
            <div className="chapter-stage">
              <div className="chapter-media">
                {chapter.images.map((image, imageIndex) => <button key={image.src}
                  className={`chapter-image-layer ${state.images[chapterIndex] === imageIndex ? 'is-active' : ''}`}
                  disabled={state.chapter !== chapterIndex || state.images[chapterIndex] !== imageIndex} aria-label={`${controls.imageLabel}: ${image.alt}`} aria-haspopup="dialog"
                  onClick={event => { event.currentTarget.focus({ preventScroll: true }); imageOpener.current = event.currentTarget; setViewer(image) }}>
                  <img src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" draggable={false}
                    style={{ objectFit: image.fit ?? 'contain' }} fetchPriority={chapterIndex === 0 ? 'high' : 'auto'} />
                  <span className="image-inspect" aria-hidden="true">↗</span>
                </button>)}
              </div>
              <ChapterInformation chapter={chapter} />
            </div>
          </section>)}
        </div></div>
      </div>
      <div className={`production-end ${state.progress > .99 ? 'is-visible' : ''}`} inert={state.progress <= .99} aria-hidden={state.progress <= .99 || undefined}><span>{controls.end}</span><button aria-label={controls.restart} onClick={() => {
        scroller.current?.focus({ preventScroll: true })
        scroller.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      }}>↑</button></div>
      <span className="sr-only" role="status" aria-live="polite">{active.title}, image {state.images[state.chapter] + 1} of {active.images.length}</span>
    </FocusDialog>
    {viewer && <ImageViewer image={viewer} reduced={reduced} onClose={closeViewer} returnFocus={imageOpener.current} />}
  </>
}
