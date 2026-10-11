# BELLACROSS

A fixed-screen interactive exhibition with exactly three scenes:

1. **Music Production**
2. **DJ /Live Performance**
3. **Music Curation**

Vite · React · TypeScript · GSAP. Supplied music, performance, and venue photography, with no remote imagery or font dependencies.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

On this Mac, you can also double-click **`scripts/local-preview.command`**, or run
`./scripts/local-preview.command`. It uses the Node and pnpm runtime bundled with Codex when
those commands are absent from your shell's PATH. Dependencies are already installed in this checkout.

```sh
pnpm check     # TypeScript checks
pnpm build     # TypeScript checks + production build in dist/
pnpm preview   # Serve the production build, normally port 4173
```

If you prefer npm, `npm install`, `npm run dev`, and `npm run build` work too.
The supplied deployment workflow uses the committed pnpm lockfile.

## Controls

- Click the numbered scene navigation, or arrows to choose a scene.
- Use arrow keys, or **1**, **2**, **3** to move directly to a scene.
- Scroll the wheel/trackpad or swipe horizontally/vertically to advance one scene.
- Scenes wrap in both directions. A 24-pixel wheel gesture advances once; continuing momentum is ignored.
- Click either small neighboring image to bring that scene to the center.
- Click the large center image or active scene title to enter its detail view.
- Music Production uses four chapters; DJ Performance and Music Curation each use one image sequence with stable information.
- **Back** or **Escape** closes every detail view.
- Click a detail image to inspect it. **Zoom in** opens its full web resolution;
  scroll to inspect the image, then **Close** or **Escape** returns to the same chapter and image.
- System reduced-motion settings remove animated transitions,
  idle motion, and parallax automatically. Navigation and all content remain available.
- Each scene has a shareable fragment: `#music-production`, `#live-performance`, or `#music-curation`.
  Older production and direction bookmarks redirect to the current routes.

The viewport stays fixed. Each detail view has one coordinated scroll area;
the main scene's wheel and swipe navigation stays inactive while the detail is open.
Dialogs trap keyboard focus, make the underlying stage inert, and restore focus when closed.

## Edit content and replace assets

### Music Production archive

Edit **`src/data/musicProduction.ts`** for the complete Scene 01 detail experience:

- `title`: shared main scene title.
- `chapters`: exactly four ordered groups: introduction, Sounds of China 2019,
  That's Arts & Life: BELLACROSS, and BELLACROSS [WELTER152].
- Each chapter's `title`, `description`, `year`, `label`, `catalog`, `format`, `publication`,
  `releaseDate`, `credits`, `tracks`, and `links` (`label` / `url`) control its information panel.
- `images`: add, remove or reorder verified images (`src`, `alt`, `width`, `height`, `fit`).
  Each chapter needs at least one image. Adding an image extends its sequence automatically.
- `controls`: opening, Back, image viewer, scroll-region and end-state labels.

The supplied Discogs, That's Magazine and official Bandcamp URLs are configured. Only HTTP(S)
links render. Metadata follows the supplied verified brief; Welter's date and track names also
match its official Bandcamp listing. No unconfirmed release details are added.

All six supplied photographs are in **`public/assets/images/music-production/`**, with their
original filenames. Web copies are orientation-corrected, metadata-stripped, progressive JPEGs
at a maximum dimension of 2400 pixels. The original source files remain in the supplied ZIP.
Use the `asset()` helper in the content file for replacement filenames and update image dimensions.

Five verified images are used. `WechatIMG905 3.JPG` belongs only to Sounds of China;
`WechatIMG559 2.JPG` is Acidchicken x Cutt Records Vol.1 Remixes artwork and stays unassigned.

Both columns share one pinned stage. Scroll position advances the left image inside its current
chapter while the information stays in place; crossing a chapter boundary changes both columns.
Wheel input is normalized and a 24-pixel gesture advances one logical image or chapter.
A 440ms GSAP transition drives the existing paired timelines over a short internal scroll range.
The gesture latch suppresses continuing momentum; a fresh gesture is accepted after the transition.
Reverse scrolling reverses the sequence. A short touch swipe and focused arrow keys also advance
one step. The opening introduction includes Spotify, SoundCloud, and Bandcamp text links.
At widths up to 700px, the active image and information stack within the same stage.
Short viewports read taller information through the same scroll controller, without a nested pane.
Resize recalculates distances while preserving the chapter and relative image position.
All transitions respect the system reduced-motion preference.

### DJ Performance and Music Curation

Edit **`src/data/sceneDetails.ts`** for the two unified galleries. `description`, `paragraphs`,
`selection` (`title` / `items`), and `note` control the editorial information. The copy uses the
supplied experience and venue list, without dates, awards, or invented event details.

DJ Performance uses all seven supplied images, with `1-p.jpg`, `2.JPG`, and `3.jpg` first.
Music Curation uses all nine supplied images in the order listed in the brief. Assets live in
**`public/assets/images/dj-performance/`** and **`public/assets/images/music-curation/`**.
The web copies preserve orientation and aspect ratio, remove metadata, and limit large originals
to 2400 pixels; the original ZIP archives remain unchanged.

All three detail views share the existing chapter stage, responsive gesture controller, image
viewer, and focus handling. Within a sequence, the information stays in place as images change.
The two unified galleries allow long information to scroll independently on smaller screens;
gestures over the image advance the sequence while preserving the text's reading position.
Music Production retains its coordinated chapter reading behavior.

### Homepage carousel

Edit **`src/data/scenes.ts`** to change the three representative image assignments: the vinyl
portrait, `1-p.jpg`, and `fairmont cube.jpeg`. These are the only three images in the homepage.
The same image elements persist as they rotate between the small left, large center, and small
right positions. Left represents the previous scene; right represents the next scene.
Scrolling down follows 01 → 02 → 03 → 01, and scrolling up reverses the cycle.

`src/navigation/useSceneController.ts` animates position and dimensions over 560ms. The wrapping
image follows a reversible arc beneath the composition, clear of the title. Slot geometry lives
in the desktop and responsive CSS. Navigation labels and the title update when the new center
arrives. Opening details leaves the carousel intact, so Back returns to the same active scene.
Other uploaded images remain available in their respective detail galleries.

The unused prototype SVG studies remain in `public/assets/studies/`; none are rendered in the current
homepage or galleries. Their generator is retained in `scripts/generate-studies.py`.

## Adjust the art direction

- **`src/styles/tokens.css`**: colors, system font stacks, frame inset, spacing, easing.
- **`src/styles/global.css`**: desktop compositions, typography, media frames, overlays.
- **`src/styles/responsive.css`**: deliberately recomposed mobile and short-screen layouts.
- **`src/motion/useMotion.ts`**: reduced-motion preference and idle image drift.
- **`src/motion/useProductionScroll.ts`**: shared chapters and single-chapter image sequences.
- **`src/styles/music-production.css`**: chapter composition, mobile layouts and image viewer.
- **`src/navigation/useSceneController.ts`**: circular carousel motion, transition lock, latest-request queue.

Typography uses Helvetica Neue / Helvetica / Arial and Iowan Old Style / Baskerville / Times New Roman,
with local monospace fallbacks. No licensed or inaccessible font assets are required.

## GitHub Pages

Website: **https://thebellacross.github.io/**

Repository: **https://github.com/thebellacross/thebellacross.github.io**

After editing locally, review the changes, build, commit, and push:

```sh
pnpm build
git status
git add .
git commit -m "Describe your update"
git push origin main
```

Every push to `main` triggers **`.github/workflows/deploy.yml`**. It installs dependencies from
the existing lockfile, builds with Node 24 and pnpm 11, uploads `dist/`, and deploys through the
`github-pages` environment using the [official Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
Check the repository's **Actions** tab for the deployment result. A manual run is also available there.

Vite uses `base: '/'`; media uses `BASE_URL`; navigation uses fragments. Scene URLs work directly
at the root domain without server-side route rewrites. Local environment files, credentials,
dependencies, build output, and verification artifacts are excluded from Git.
GitHub authentication is managed outside the project; no access tokens belong in source files.

## Browser verification

`scripts/verify.mjs` is an optional interaction and responsive regression check. It uses an existing
Playwright installation and browser; neither is a runtime dependency of the exhibition.
With Playwright available, start `pnpm dev` and run `node scripts/verify.mjs`.
Set `BELLACROSS_PLAYWRIGHT_MODULE` to its module path if it is installed outside this project,
`BELLACROSS_BROWSER_PATH` to an existing Chrome executable, and `BELLACROSS_TEST_URL` for another preview URL.
Screenshots and the check report are saved to the ignored `artifacts/` directory.

## File map

```text
src/
  App.tsx                         Fixed exhibition shell + wheel/key/swipe/parallax input
  components/                     Media, reusable frames, focus dialogs, project details
  data/scenes.ts                  Main scenes and real photograph preview assignments
  data/musicProduction.ts         Music Production archive text, images, details and links
  data/sceneDetails.ts            DJ Performance and Music Curation gallery content
  motion/useMotion.ts             Reduced-motion preference + idle image animation
  motion/useProductionScroll.ts   Single native scroll controller for editorial chapters
  navigation/useSceneController.ts Shared circular state, persistent image motion, queued direct navigation
  scenes/ExhibitionScene.tsx       Three persistent images and the active scene title
  styles/                         Visual tokens, desktop and responsive styles
public/assets/studies/            Nine unused original SVG studies
public/assets/images/            Supplied music, DJ and curation photographs, optimized for the galleries
scripts/generate-studies.py       Deterministic procedural artwork generator
scripts/local-preview.command    Mac local launcher with a bundled-runtime fallback
.github/workflows/deploy.yml      Automatic GitHub Pages build and deployment on main
```
