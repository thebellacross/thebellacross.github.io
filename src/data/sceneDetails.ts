import { musicProduction } from './musicProduction'
import type { ArchiveContent, ArchiveImage } from './musicProduction'

const image = (folder: string, filename: string, alt: string, width: number, height: number): ArchiveImage => ({
  src: `${import.meta.env.BASE_URL}assets/images/${folder}/${encodeURIComponent(filename)}`,
  alt, width, height, fit: 'contain',
})
const controls = (title: string, sceneTitle = title) => ({
  ...musicProduction.controls,
  backLabel: `Back to ${sceneTitle}`,
  openLabel: `Open ${title}`,
  scrollLabel: `${title} images`,
  end: `End of ${title}`,
  restart: 'Return to the first image',
})

export const djPerformance: ArchiveContent = {
  title: 'DJ Performance',
  controls: controls('DJ Performance', 'DJ /Live Performance'),
  chapters: [{
    id: 'dj-performance',
    title: 'DJ Performance',
    description: 'BELLACROSS performs as a DJ across luxury hotels, lounges, rooftop bars, clubs, and events, adapting musical selection to the venue, time of day, and audience.',
    descriptionZh: 'BELLACROSS 的 DJ 演出涵盖五星级酒店、酒廊、屋顶酒吧、俱乐部及各类活动现场，并根据场所氛围、不同时段与听众特点调整音乐选择。',
    paragraphs: [{
      text: 'Timing, crowd reading, and spatial awareness guide each set. Experience in premium venues informs a measured presence, balancing musical taste with the rhythm of a room to shape mood across an evening.',
      translationZh: 'BELLACROSS 注重音乐的节奏与层次、现场听众的反应及空间氛围，根据现场状态调整曲目选择与音乐的推进节奏，营造自然、连贯且契合场所特点的音乐体验。',
    }],
    selection: [{
      title: 'Selected Residencies',
      titleZh: '驻场',
      items: [
        'The Ritz-Carlton Chengdu / FLAIR',
        'Fairmont Hotel Chengdu / CUBE & Manhattan',
        'Niccolo Hotel Chengdu / The Bar',
        'W Hotel / Lobby Lounge & SPARK',
        'The St. Regis Chengdu / Vantage',
      ],
    }, {
      title: 'Selected Performances',
      items: [
        'MIDI NYE Festival Chengdu',
        'Celia Shanghai',
        'ADIDAS Taikuli',
        'POP Bar Shanghai',
        'Marriott Chongqing',
        'DEEP Guangzhou',
      ],
    }],
    images: [
      image('dj-performance', '1-p.jpg', 'BELLACROSS performing beneath red light at a DJ booth.', 2400, 1590),
      image('dj-performance', '2.JPG', 'Black-and-white BELLACROSS DJ performance photograph.', 2400, 1344),
      image('dj-performance', '3.jpg', 'BELLACROSS at a DJ booth in front of an illuminated wing installation.', 2400, 1798),
      image('dj-performance', '7986be66-b8f6-49a4-b4ff-3e65334d0b93.jpg', 'BELLACROSS performing at a booth beneath blue and red club lighting.', 2400, 1475),
      image('dj-performance', 'B8AC960E-8C3A-4C93-BCE1-BF2EAE229DBF.JPG', 'Black-and-white close portrait of BELLACROSS.', 2400, 1629),
      image('dj-performance', 'e7e3d248-9e7e-4b32-86e5-c1b7e559d05f.jpg', 'BELLACROSS at an outdoor DJ booth surrounded by palms and a city skyline.', 998, 518),
      image('dj-performance', 'playatflair.jpg', 'BELLACROSS performing at Flair with the city illuminated behind the booth.', 2400, 1351),
    ],
    links: [],
  }],
}

export const musicCuration: ArchiveContent = {
  title: 'Music Curation',
  controls: controls('Music Curation'),
  chapters: [{
    id: 'music-curation',
    title: 'Music Curation',
    description: 'BELLACROSS develops music curation for hospitality and lifestyle spaces, shaping atmosphere through careful selection, daypart sensitivity, and spatial listening.',
    descriptionZh: 'BELLACROSS 为酒店及生活方式空间提供音乐策划，通过精心的音乐选择、对不同时段的把握及对空间环境的理解，塑造符合场所特质的音乐氛围。',
    paragraphs: [{
      text: 'The work includes background music programming, time-of-day playlists, and ongoing library updates. Musical tone responds to guest profiles, venue identity, and service rhythm across hotels, restaurants, bars, lounges, and retail environments.',
      translationZh: '工作内容涵盖背景音乐编排、不同时段的播放方案及曲库的持续更新。根据宾客群体、场所定位和服务节奏，调整酒店、餐厅、酒吧、酒廊及零售空间的音乐风格与整体氛围。',
    }],
    selection: {
      title: 'Selected Spaces',
      titleZh: '合作空间',
      items: [
        "Abbye, GRAPPA'S / Taikoo Li Restaurants, Chengdu",
        'Adidas store / Taikoo Li Chengdu',
        'Ritz-Carlton Chengdu / tea lounge and dining',
        'Fairmont Chengdu / lobby, restaurants, bars and club spaces',
        'InterContinental / public and dining spaces',
        'Niccolo Chengdu / dining, events and hotel atmosphere',
        'W Chengdu / lobby, restaurant and bar environments',
        'Additional hospitality and restaurant spaces',
      ],
    },
    note: 'This practice considers the relationship between sound, mood, the service environment, and the identity of a space.',
    images: [
      image('music-curation', 'fairmont cube.jpeg', 'Warmly lit Fairmont Cube lounge with a chandelier and red seating.', 1024, 682),
      image('music-curation', 'fairmont cube2.jpeg', 'Fairmont Cube bar with pendant lighting and red bar stools.', 1024, 683),
      image('music-curation', 'fairmont manhattan 1.jpg', 'Illuminated entrance to the Fairmont Manhattan bar.', 1920, 1281),
      image('music-curation', 'fairmont manhattan.jpg', 'Fairmont Manhattan interior with a curved staircase and amber lighting.', 1765, 1920),
      image('music-curation', 'NICCOLO_CDU_Rendering_TeaLounge1.jpg', 'Architectural rendering of the Niccolo Chengdu tea lounge.', 600, 400),
      image('music-curation', 'niccolo the bar.jpg', 'Niccolo bar with dark seating, bottles and a colorful artwork.', 1920, 840),
      image('music-curation', 'Image.png', 'Hotel lounge interior with sculptural lighting and warm seating.', 1317, 532),
      image('music-curation', '056-W-Chengdu-Hotel-Chengdu-China-Spark-Rooftop-W-Bar.jpg', 'W Chengdu Spark rooftop terrace at dusk.', 1840, 1226),
      image('music-curation', '057-W-Chengdu-Hotel-Chengdu-China-Spark-Rooftop-Bar.jpg', 'W Chengdu Spark rooftop bar interior with lounge seating.', 1840, 1227),
    ],
    links: [],
  }],
}
