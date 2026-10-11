import { musicProduction } from './musicProduction'
import type { ArchiveContent, ArchiveImage } from './musicProduction'
import { djPerformance, musicCuration } from './sceneDetails'

export type Media = {
  type: 'image' | 'video' | 'audio'
  src: string
  alt: string
  poster?: string
}

export type Project = {
  id: string
  title: string
  label: string
  description: string
  media: Media
  supportingMedia?: Media[]
  metadata: { label: string; value: string }[]
  externalLinks?: { label: string; url: string }[]
  placeholder?: boolean
}

export type Scene = {
  id: string
  title: string
  label: string
  description: string
  composition: 'production' | 'performance' | 'curation'
  detail: ArchiveContent
  projects: Project[]
}

// Exactly one representative image per scene. The same three previews remain
// mounted while the carousel rotates; all other photographs stay in the archives.
const preview = (id: string, title: string, image: ArchiveImage): Project => ({
  id: `${id}-preview`,
  title,
  label: '', description: '', metadata: [],
  media: { type: 'image', src: image.src, alt: image.alt },
})

export const scenes: Scene[] = [
  {
    id: 'music-production', title: musicProduction.title, label: '', description: '',
    composition: 'production', detail: musicProduction,
    projects: [preview('music-production', musicProduction.title, musicProduction.chapters[0].images[0])],
  },
  {
    id: 'live-performance', title: 'DJ /Live Performance', label: '', description: '',
    composition: 'performance', detail: djPerformance,
    projects: [preview('live-performance', 'DJ /Live Performance', djPerformance.chapters[0].images[0])],
  },
  {
    id: 'music-curation', title: musicCuration.title, label: '', description: '',
    composition: 'curation', detail: musicCuration,
    projects: [preview('music-curation', musicCuration.title, musicCuration.chapters[0].images[0])],
  },
]
