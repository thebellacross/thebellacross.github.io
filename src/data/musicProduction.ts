export type ArchiveImage = {
  src: string
  alt: string
  width: number
  height: number
  fit?: 'contain' | 'cover'
}

export type MusicProductionChapter = {
  id: string
  title: string
  introduction?: boolean
  year?: string
  label?: string
  catalog?: string
  format?: string
  publication?: string
  releaseDate?: string
  credits?: { label: string; value: string }[]
  description: string
  paragraphs?: string[]
  selection?: { title: string; items: string[] } | { title: string; items: string[] }[]
  note?: string
  tracks?: string[]
  images: ArchiveImage[]
  links: { label: string; url: string }[]
}

const asset = (filename: string) => `${import.meta.env.BASE_URL}assets/images/music-production/${encodeURIComponent(filename)}`

// Ordered chapters. Every additional image automatically extends its chapter's scroll sequence.
// All documentary artwork uses contain; unverified imagery stays outside these chapters.
export type ArchiveContent = {
  title: string
  controls: { back: string; backLabel: string; openLabel: string; scrollLabel: string; imageLabel: string; viewerTitle: string; viewerClose: string; zoomIn: string; zoomOut: string; end: string; restart: string }
  chapters: MusicProductionChapter[]
}

export const musicProduction: ArchiveContent = {
  title: 'Music Production',
  controls: {
    back: 'Back',
    backLabel: 'Back to Music Production',
    openLabel: 'Open Music Production',
    scrollLabel: 'Music Production chapters',
    imageLabel: 'Inspect image',
    viewerTitle: 'Image view',
    viewerClose: 'Close image view',
    zoomIn: 'Zoom in',
    zoomOut: 'Fit image',
    end: 'End of Music Production',
    restart: 'Return to the introduction',
  },
  chapters: [
    {
      id: 'introduction',
      title: 'Music Production',
      introduction: true,
      description: 'BELLACROSS creates electronic music across vinyl and digital releases. Explore selected productions, recordings, and press features.',
      images: [{
        src: asset('b25811b3-5a37-4fad-a23e-b98a05161ee6.jpg'),
        alt: 'Black-and-white portrait of BELLACROSS holding a vinyl record and its sleeve.',
        width: 2400, height: 1554, fit: 'contain',
      }],
      links: [
        { label: 'Spotify', url: 'https://open.spotify.com/artist/4li5A6KFEFJKHwrAm2HhQp?si=j1cDoWVHSVmoVqCtuIn5mQ' },
        { label: 'SoundCloud', url: 'https://soundcloud.com/bellacross' },
        { label: 'Bandcamp', url: 'https://bellacrossmusic.bandcamp.com/' },
      ],
    },
    {
      id: 'sounds-of-china-2019',
      title: 'Sounds of China 2019',
      year: '2019',
      label: 'House of China',
      catalog: 'HOC001',
      format: '12-inch vinyl compilation',
      credits: [{ label: 'BELLACROSS track', value: 'Char' }],
      description: 'Char, by BELLACROSS, appears on Sounds of China 2019, a vinyl compilation released by House of China.',
      images: [{
        src: asset('WechatIMG905 3.JPG'),
        alt: 'Full Sounds of China 2019 sleeve spread, including Side A and Side B listings and the BELLACROSS track Char.',
        width: 1440, height: 753, fit: 'contain',
      }],
      links: [{ label: 'View on Discogs', url: 'https://www.discogs.com/release/14191587-Mickey-Zhang-DJ-Blue-9-Kobe-Chen-BELLACROSS-Truetrue-Sounds-of-China-2019' }],
    },
    {
      id: 'thats-arts-and-life',
      title: "That's Arts & Life: BELLACROSS",
      publication: "That's Magazine",
      description: "A feature on BELLACROSS published in That's Arts & Life.",
      images: [
        {
          src: asset('DSCF1191.JPG'),
          alt: 'Magazine contents page listing the BELLACROSS feature under Arts & Life.',
          width: 2400, height: 1600, fit: 'contain',
        },
        {
          src: asset('DSCF1195.JPG'),
          alt: 'Printed BELLACROSS feature with text and a performance photograph.',
          width: 2400, height: 1600, fit: 'contain',
        },
      ],
      links: [{ label: 'Read Feature', url: 'https://www.thatsmags.com/gba/post/36010/that-s-arts-life-bellacross' }],
    },
    {
      id: 'welter152',
      title: 'BELLACROSS [WELTER152]',
      label: 'Welter Records',
      releaseDate: 'September 6, 2020',
      format: 'Digital EP',
      description: 'A three-track EP by BELLACROSS, released through Welter Records in September 2020.',
      tracks: ['If', 'Tomorrow Is Promised To No One', 'Where Are The Dreams Go When We Wake Up'],
      images: [{
        src: asset('bellacross welter152.jpg'),
        alt: 'Complete red eye release artwork for BELLACROSS [WELTER152], with Welter Records typography.',
        width: 1200, height: 1200, fit: 'contain',
      }],
      links: [{ label: 'Listen on Bandcamp', url: 'https://welterrecords.bandcamp.com/album/bellacross-welter152' }],
    },
  ],
}
