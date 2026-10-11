import { useEffect, useRef } from 'react'
import type { Project, Scene } from '../data/scenes'
import { FocusDialog } from './FocusDialog'
import { Media } from './Media'

export function ProjectDetail({ project, scene, reduced, onClose, onSelect, returnFocus }: {
  project: Project; scene: Scene; reduced: boolean; onClose: () => void; onSelect: (project: Project) => void; returnFocus: HTMLElement | null
}) {
  const index = scene.projects.findIndex(item => item.id === project.id)
  const content = useRef<HTMLDivElement>(null)
  useEffect(() => { if (content.current) content.current.scrollTop = 0 }, [project.id])
  return <FocusDialog className={`project-detail ${project.placeholder ? 'project-detail--media-only' : ''}`} labelId="project-title" reduced={reduced} onClose={onClose} returnFocus={returnFocus}>
    <div className="dialog-topline"><button className="text-control" onClick={onClose} aria-label={`Back to ${scene.title}`}>← <span>Back</span></button><button className="close-control" onClick={onClose} aria-label="Close project detail">×</button></div>
    <div className="detail-art" data-dialog-reveal><Media key={project.id} media={project.media} controls paused={reduced} /></div>
    <div ref={content} className="detail-content" data-dialog-reveal>
      {!project.placeholder && project.label && <div className="eyebrow">{project.label}</div>}
      <h2 id="project-title">{project.placeholder ? scene.title : project.title}</h2>
      {!project.placeholder && <>
        {project.description && <p className="detail-description">{project.description}</p>}
        {!!project.metadata.length && <dl>{project.metadata.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>}
        {project.externalLinks?.map(link => /^https?:\/\//.test(link.url) && <a key={link.url} className="detail-link" href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}
        {!!project.supportingMedia?.length && <div className="detail-support">{project.supportingMedia.map(media => <div key={media.src}><Media media={media} controls paused={reduced} /></div>)}</div>}
      </>}
    </div>
    <div className="detail-footer"><button className="text-control" aria-label={project.placeholder ? 'Next image' : 'Next project'} onClick={() => onSelect(scene.projects[(index + 1) % scene.projects.length])}>Next <span>→</span></button></div>
  </FocusDialog>
}
