// Optional browser regression check. Uses an existing Playwright installation and browser.
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.BELLACROSS_PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BELLACROSS_BROWSER_PATH ? { executablePath: process.env.BELLACROSS_BROWSER_PATH } : {}),
})
const url = process.env.BELLACROSS_TEST_URL || 'http://127.0.0.1:5173/'
const output = new URL('../artifacts/', import.meta.url).pathname
await mkdir(output, { recursive: true })
const checks = []
const errors = []
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', error => errors.push(error.message))
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`) })
const idle = async (target = page) => target.locator('.scene-stage[aria-busy="false"]').waitFor()
const title = async (expected, target = page) => assert.equal(await target.locator('.scene-title-block h2').textContent(), expected)
const sceneIds = ['music-production', 'live-performance', 'music-curation']
const sceneTitles = ['Music Production', 'DJ /Live Performance', 'Music Curation']
const imageNames = ['b25811b3-5a37-4fad-a23e-b98a05161ee6.jpg', '1-p.jpg', 'fairmont cube.jpeg']
let persistentImages = []
const carousel = async (active, target = page) => {
  await title(sceneTitles[active], target)
  const frames = await target.locator('[data-carousel-index]').evaluateAll(elements => elements.map(element => ({
    scene: element.getAttribute('data-carousel-scene'), slot: element.getAttribute('data-slot'),
    src: element.querySelector('img').getAttribute('src'), width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height, opacity: getComputedStyle(element).opacity,
  })))
  assert.equal(await target.locator('.scene-stage img').count(), 3)
  assert.deepEqual(frames.map(frame => frame.scene), sceneIds)
  assert.deepEqual(frames.map(frame => decodeURIComponent(frame.src.split('/').at(-1))), imageNames)
  assert.deepEqual(frames.map((_, index) => frames[index].slot), sceneIds.map((_, index) =>
    index === active ? 'center' : index === (active + 2) % 3 ? 'left' : 'right'))
  assert.ok(frames.every(frame => frame.opacity === '1'))
  assert.ok(frames.every(frame => frame.slot === 'center' ||
    frame.width < frames[active].width && frame.height < frames[active].height))
  assert.equal(await target.locator('.scene-nav [aria-current="page"]').getAttribute('aria-label'), `0${active + 1} ${sceneTitles[active]}`)
  if (target === page) for (const image of persistentImages) {
    assert.equal(await image.evaluate(element => element.isConnected), true, 'Original image nodes remain mounted')
  }
}
const screenshot = async (name, target = page) => {
  if (await target.locator('.dialog').count()) {
    await target.waitForFunction(() => Array.from(document.querySelectorAll('.dialog, [data-dialog-reveal]')).every(element => Number(getComputedStyle(element).opacity) >= 0.99))
  }
  await target.screenshot({ path: `${output}${name}.png` })
}
const dimensions = async target => target.evaluate(() => ({
  width: innerWidth, height: innerHeight,
  scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
  pageX: scrollX, pageY: scrollY,
  title: (() => { const r = document.querySelector('.scene-title-block').getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom } })(),
  footer: document.querySelector('.stage-footer').getBoundingClientRect().top,
  imagesClear: Array.from(document.querySelectorAll('.media-frame')).every(element => {
    const image = element.getBoundingClientRect()
    const title = document.querySelector('.scene-title-block').getBoundingClientRect()
    const footer = document.querySelector('.stage-footer').getBoundingClientRect()
    const overlaps = box => image.left < box.right && image.right > box.left && image.top < box.bottom && image.bottom > box.top
    return image.left >= 0 && image.right <= innerWidth && !overlaps(title) && !overlaps(footer)
  }),
}))

try {
  await page.goto(url)
  await idle()
  persistentImages = await page.locator('.scene-stage img').elementHandles()
  await carousel(0)
  await screenshot('desktop-01')
  checks.push('Initial entrance completes and Music Production is active')

  const startingWidths = await page.locator('.media-frame').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))
  await page.mouse.move(800, 220)
  await page.mouse.wheel(0, 30)
  await page.locator('.scene-stage[aria-busy="true"]').waitFor()
  await page.waitForTimeout(220)
  const movingWidths = await page.locator('.media-frame').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))
  assert.ok(movingWidths[0] < startingWidths[0] && movingWidths[1] > startingWidths[1])
  assert.equal(await page.locator('.media-frame').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), true)
  await idle()
  await carousel(1)
  await screenshot('desktop-02')
  await page.keyboard.press('ArrowRight')
  await idle()
  await carousel(2)
  await screenshot('desktop-03')
  checks.push('Exactly three persistent image nodes move and resize; center image, title and scene navigation agree')

  await page.locator('.media-frame[data-slot="left"]').click()
  await idle()
  await carousel(1)
  await page.locator('.media-frame[data-slot="right"]').click()
  await idle()
  await carousel(2)
  for (const direction of [1, -1]) {
    let active = 2
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(direction > 0 ? 'ArrowDown' : 'ArrowUp')
      active = (active + direction + 3) % 3
      await idle()
      await carousel(active)
    }
  }
  checks.push('Side previews navigate; repeated forward and reverse cycles preserve all three image identities and wrap correctly')

  await page.locator('.media-frame[data-slot="center"]').click()
  await page.locator('.production-detail').waitFor()
  assert.equal(await page.locator('#music-curation-title').textContent(), 'Music Curation')
  assert.equal(await page.locator('.exhibition-content').getAttribute('inert'), '')
  assert.equal(await page.locator('.chapter-image-layer').count(), 9)
  assert.equal(await page.locator('.chapter-selection li').count(), 8)
  const information = await page.locator('.chapter-information').innerHTML()
  const informationBox = await page.locator('.chapter-information').boundingBox()
  await screenshot('desktop-curation-detail')
  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Music Curation information')
  await page.keyboard.press('Tab')
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Back to Music Curation')
  await page.mouse.move(500, 450)
  for (let i = 0; i < 24; i++) await page.mouse.wheel(0, 30)
  await page.locator('.production-scroll[data-active-image="1"][data-moving="false"]').waitFor()
  assert.equal(await page.locator('.chapter-information').innerHTML(), information)
  assert.deepEqual(await page.locator('.chapter-information').boundingBox(), informationBox)
  assert.match(await page.locator('.chapter-image-layer.is-active img').getAttribute('src'), /fairmont%20cube2.jpeg$/)
  await page.mouse.wheel(0, -30)
  await page.locator('.production-scroll[data-active-image="0"][data-moving="false"]').waitFor()
  await page.keyboard.press('Escape')
  await page.locator('.production-detail').waitFor({ state: 'detached' })
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-slot') === 'center')
  await carousel(2)
  checks.push('Curation has nine real images, stable editorial information, one-step wheel/reverse navigation, a focus trap and restored opener focus')

  await page.getByRole('button', { name: '02 DJ /Live Performance', exact: true }).click()
  await idle()
  await page.locator('.media-frame[data-slot="center"]').click()
  assert.equal(await page.locator('#dj-performance-title').textContent(), 'DJ Performance')
  assert.equal(await page.locator('.chapter-image-layer').count(), 7)
  assert.equal(await page.locator('.chapter-selection li').count(), 11)
  assert.deepEqual(await page.locator('.chapter-selection h3').allTextContents(), ['Selected Residencies', 'Selected Performances'])
  const djImages = await page.locator('.chapter-image-layer img').evaluateAll(images => images.map(image => image.getAttribute('src')))
  assert.deepEqual(djImages.slice(0, 3).map(src => src.split('/').at(-1)), ['1-p.jpg', '2.JPG', '3.jpg'])
  await page.getByRole('region', { name: 'DJ Performance images', exact: true }).press('ArrowDown')
  await page.locator('.production-scroll[data-active-image="1"][data-moving="false"]').waitFor()
  await screenshot('desktop-dj-detail')
  await page.getByRole('button', { name: 'Back to DJ /Live Performance', exact: true }).click()
  await page.locator('.production-detail').waitFor({ state: 'detached' })
  checks.push('DJ Performance has seven images, the required numbered order, editable venue information and matching Back navigation')

  await page.goto(`${url}#music-product`)
  await idle()
  await title('Music Production')
  assert.equal(new URL(page.url()).hash, '#music-production')
  checks.push('Existing first-scene bookmarks redirect to the corrected production route')

  const removedText = /INDEX|FIG\.|SELECTED EXPLORATIONS|PLACEHOLDER|SCROLL TO EXPLORE|MOTION \/|SOUND TAKES SHAPE|SOUND STUDY|RELEASE ARTWORK|VISUAL FRAGMENT|INDEPENDENT MUSIC ARTIST/i
  assert.equal(removedText.test(await page.locator('body').innerText()), false)
  assert.equal(await page.locator('.stage-header, .frame-caption, .canvas-bottom, .scene-kicker').count(), 0)
  checks.push('Removed branding, index, captions, slogans, and footer metadata are absent from the rendered interface')

  await page.getByRole('button', { name: '02 DJ /Live Performance', exact: true }).click()
  await page.getByRole('button', { name: '03 Music Curation', exact: true }).click()
  await page.getByRole('button', { name: '01 Music Production', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-scene]')?.getAttribute('data-scene') === 'music-production' && document.querySelector('.scene-stage')?.getAttribute('aria-busy') === 'false')
  checks.push('Rapid direct navigation resolves to the last requested scene without a broken state')

  await page.mouse.move(800, 700)
  const burstEnd = Date.now() + 1600
  while (Date.now() < burstEnd) await page.mouse.wheel(0, 30)
  await idle()
  await carousel(1)
  await page.waitForTimeout(130)
  await page.mouse.wheel(0, -30)
  await idle()
  await carousel(0)
  checks.push('A continuous wheel burst advances once, including momentum after the animation; a new small reverse gesture is accepted')

  for (const size of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }, { width: 576, height: 320 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size)
    for (const [index, name] of ['Music Production', 'DJ /Live Performance', 'Music Curation'].entries()) {
      await page.keyboard.press(String(index + 1))
      await idle()
      await carousel(index)
      const d = await dimensions(page)
      assert.ok(d.scrollWidth <= d.width && d.scrollHeight <= d.height, `Page overflow at ${JSON.stringify(size)}`)
      assert.ok(d.title.x >= 0 && d.title.right <= d.width && d.title.bottom < d.footer, `Title overlaps footer at ${JSON.stringify(size)}: ${JSON.stringify(d)}`)
      assert.equal(d.imagesClear, true, `Images overlap the title or footer at ${JSON.stringify(size)}`)
      assert.equal(d.pageY, 0)
      const visibleLabels = await page.locator('.nav-title').evaluateAll(elements => elements.every(element => getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().width > 0))
      assert.equal(visibleLabels, true, 'Full scene labels remain visible on mobile')
      if (size.width === 390) await screenshot(`mobile-0${index + 1}`)
    }
  }
  checks.push('All scenes fit 320px phone, 390px phone, landscape, tablet, and large desktop viewports without page scrolling or title/footer overlap')

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const touchPage = await touchContext.newPage()
  await touchPage.goto(url)
  await idle(touchPage)
  const client = await touchContext.newCDPSession(touchPage)
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 290, y: 540 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 535 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 75, y: 535 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await idle(touchPage)
  await title('DJ /Live Performance', touchPage)
  await carousel(1, touchPage)
  await touchPage.locator('.media-frame[data-slot="center"]').tap()
  await touchPage.getByRole('dialog').waitFor()
  await screenshot('mobile-detail', touchPage)
  await touchPage.getByRole('button', { name: 'Back to DJ /Live Performance', exact: true }).tap()
  await touchPage.getByRole('dialog').waitFor({ state: 'detached' })
  await touchContext.close()
  checks.push('Real touch events swipe to the next scene; tapping opens and closes mobile details')

  const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await reducedPage.goto(`${url}#music-curation`)
  await idle(reducedPage)
  await carousel(2, reducedPage)
  assert.equal(await reducedPage.locator('main').evaluate(element => element.classList.contains('motion-paused')), true)
  await reducedPage.keyboard.press('ArrowRight')
  await idle(reducedPage)
  await carousel(0, reducedPage)
  const hidden = await reducedPage.locator('.media-frame').evaluateAll(elements => elements.some(element => getComputedStyle(element).opacity === '0'))
  assert.equal(hidden, false)
  await reducedPage.close()
  checks.push('Deep links and system reduced motion work with visible content and wrapping navigation')

  assert.deepEqual(errors, [])
  checks.push('No page errors or failed HTTP requests')
  await writeFile(`${output}verification.json`, JSON.stringify({ url, checks, errors }, null, 2))
  console.log(JSON.stringify({ passed: checks.length, checks, errors, screenshots: output }, null, 2))
} finally {
  await browser.close()
}
