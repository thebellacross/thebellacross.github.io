"""Regenerate the original procedural placeholder artwork. Python standard library only."""
from pathlib import Path
import math
import random

OUT = Path(__file__).resolve().parents[1] / 'public' / 'assets' / 'studies'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(41)

DEFS = '''<defs>
  <radialGradient id="ambient"><stop stop-color="#582519" stop-opacity=".38"/><stop offset="1" stop-color="#090909" stop-opacity="0"/></radialGradient>
  <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3d160d"/><stop offset=".32" stop-color="#d98751"/><stop offset=".52" stop-color="#f1b17b"/><stop offset=".7" stop-color="#7d351e"/><stop offset="1" stop-color="#20100b"/></linearGradient>
  <linearGradient id="ring" x1="0" y1="0" x2=".9" y2=".6"><stop stop-color="#22110b"/><stop offset=".28" stop-color="#db8759"/><stop offset=".43" stop-color="#f0b38a"/><stop offset=".61" stop-color="#9b4626"/><stop offset="1" stop-color="#170b07"/></linearGradient>
  <linearGradient id="warm"><stop stop-color="#0b0908"/><stop offset=".42" stop-color="#6b2c19"/><stop offset=".73" stop-color="#c98250"/><stop offset="1" stop-color="#2e150e"/></linearGradient>
  <linearGradient id="beam" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#120807" stop-opacity="0"/><stop offset=".55" stop-color="#bc3920" stop-opacity=".55"/><stop offset="1" stop-color="#f5a35d"/></linearGradient>
  <radialGradient id="disc"><stop stop-color="#080807"/><stop offset=".16" stop-color="#080807"/><stop offset=".18" stop-color="#db9463"/><stop offset=".21" stop-color="#291c16"/><stop offset=".74" stop-color="#422419"/><stop offset=".95" stop-color="#a5653e"/><stop offset="1" stop-color="#16100c"/></radialGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="8" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>'''

def save(name, shapes, background='#0b0908'):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
    <title>Original procedural visual study — placeholder, not BELLACROSS project media</title>
    {DEFS}<rect width="1200" height="800" fill="{background}"/>{shapes}
    <rect width="1200" height="800" filter="url(#grain)" opacity=".043" style="mix-blend-mode:soft-light"/>
    </svg>'''
    (OUT / f'{name}.svg').write_text(svg)

def path(points):
    return 'M' + ' L'.join(f'{x:.2f},{y:.2f}' for x, y in points)

# A contoured copper torus, lit on one edge, with a quiet black central void.
shapes = '<ellipse cx="610" cy="420" rx="570" ry="390" fill="url(#ambient)"/>'
shapes += '<g transform="rotate(-28 600 400)">'
shapes += '<ellipse cx="614" cy="428" rx="315" ry="204" fill="#000" opacity=".7" filter="url(#soft)"/>'
for i in range(170):
    v = math.pi * i / 169
    r = 214 + 112 * math.cos(v)
    depth = 76 * math.sin(v)
    points = []
    for j in range(181):
        u = math.tau * j / 180
        ripples = 2.6 * math.sin(u * 5 + v * 2)
        points.append((600 + (r + ripples) * math.cos(u), 385 + (r + ripples) * math.sin(u) * .69 + depth))
    opacity = .5 + .46 * math.sin(v)
    shapes += f'<path d="{path(points)}Z" fill="none" stroke="url(#ring)" stroke-width="1.5" opacity="{opacity:.2f}"/>'
shapes += '<ellipse cx="600" cy="387" rx="102" ry="69" fill="#0b0908"/></g>'
save('signal', shapes)

# Flowing fine-line surface, with depth rather than a flat gradient.
shapes = '<ellipse cx="720" cy="470" rx="620" ry="440" fill="url(#ambient)"/>'
for i in range(140):
    points = []
    for j in range(151):
        x = -160 + j * 10
        y = 80 + i * 4.9 + 210 * math.sin(x / 410 + i / 175) + 66 * math.sin(x / 177 + i / 160)
        points.append((x, y))
    shapes += f'<path d="{path(points)}" fill="none" stroke="url(#copper)" stroke-width="1.7" opacity=".78"/>'
save('wave', shapes)

shapes = '<ellipse cx="600" cy="400" rx="410" ry="360" fill="url(#ambient)"/>'
shapes += '<g transform="rotate(-18 600 400)"><ellipse cx="600" cy="400" rx="289" ry="278" fill="url(#disc)"/>'
for i in range(80):
    r = 66 + i * 2.7
    shapes += f'<ellipse cx="600" cy="400" rx="{r}" ry="{r*.96}" fill="none" stroke="#c88759" stroke-width=".6" opacity=".17"/>'
shapes += '<ellipse cx="600" cy="400" rx="35" ry="34" fill="#080807"/></g>'
save('disc', shapes)

# Controlled performance light: a tilted fan of red, amber, and black planes.
shapes = '<rect width="1200" height="800" fill="#0a0808"/>'
shapes += '<ellipse cx="850" cy="130" rx="490" ry="530" fill="url(#ambient)"/>'
for i in range(13):
    x = 170 + i * 69
    shapes += f'<path d="M{x} -30 L{x+35} -30 L{x-210} 830 L{x-265} 830Z" fill="url(#beam)" opacity="{.18 + (i%4)*.17}"/>'
for i in range(60):
    x = 295 + i * 8
    shapes += f'<path d="M{x} -20 L{x-282} 820" stroke="#f99b59" stroke-width=".7" opacity=".13"/>'
shapes += '<path d="M0 650 L1200 495 V800 H0Z" fill="#090808" opacity=".76"/>'
save('light', shapes)

shapes = '<ellipse cx="620" cy="420" rx="530" ry="350" fill="url(#ambient)"/>'
for i in range(70):
    y = 60 + i * 10
    width = 520 + 145 * math.sin(i / 11)
    x = 600 - width / 2 + 50 * math.sin(i / 12)
    shapes += f'<rect x="{x}" y="{y}" width="{width}" height="{2+math.sin(i/8)}" fill="url(#copper)" opacity="{.35+.4*math.sin(i/70*math.pi):.2f}"/>'
save('pulse', shapes)

shapes = '<ellipse cx="620" cy="420" rx="470" ry="390" fill="url(#ambient)"/>'
for i in range(110):
    r = 70 + i * 2.3
    shapes += f'<ellipse cx="600" cy="400" rx="{r}" ry="{r*1.13}" fill="none" stroke="#b53822" stroke-width="1.5" opacity="{.19 + .48*math.sin(i/110*math.pi):.2f}" transform="rotate({i*.15} 600 400)"/>'
save('afterimage', shapes)

# Architectural study: recessed planes, an amber light source, long shadows.
shapes = '''<rect width="1200" height="800" fill="#17130f"/>
<path d="M0 0H1200V180L890 440H320L0 165Z" fill="#211910"/>
<path d="M0 800V170L320 440V800Z" fill="#0c0b09"/>
<path d="M1200 800V180L890 440V800Z" fill="#39271a"/>
<path d="M320 440H890V800H320Z" fill="url(#warm)"/>
<path d="M440 120H840V650H440Z" fill="#090908"/>
<path d="M440 120H478V650H440Z" fill="#925334"/>
<path d="M478 159H807V650H478Z" fill="url(#warm)"/>
<path d="M515 205H765V650H515Z" fill="#17120e"/>
<path d="M568 263H739V650H568Z" fill="#070707"/>
<path d="M739 263H765V650H739Z" fill="#b57846"/>
<path d="M440 650H840L1200 800H0Z" fill="#22170f"/>
<path d="M568 650H739L994 800H595Z" fill="url(#warm)" opacity=".72"/>
<path d="M568 263H576V650H568Z" fill="#ba8454" opacity=".55"/>
<path d="M840 120V650L1044 800H1150L920 640V40Z" fill="#100f0c"/>
<path d="M300 0V800M920 0V640" stroke="#e0a36f" opacity=".12"/>
<path d="M0 740H1200" stroke="#a0744d" opacity=".17"/>'''
save('space', shapes)

shapes = '''<rect width="1200" height="800" fill="#15110e"/>
<path d="M0 0H735V800H0Z" fill="#21170f"/>
<path d="M640 0H945V800H640Z" fill="url(#warm)"/>
<path d="M720 120H906V800H720Z" fill="#0b0907"/>
<path d="M737 134H904V800H737Z" fill="#57311c"/>
<path d="M795 134H904V800H795Z" fill="#0b0907"/>
<path d="M906 0H1200V800H906Z" fill="#080807"/>
<path d="M0 615H720L1080 800H0Z" fill="#291c12"/>
<path d="M737 615H795L610 800H165Z" fill="#af7547" opacity=".43"/>
<path d="M640 0V615M720 120V615" stroke="#e8a271" stroke-width="2" opacity=".3"/>
<path d="M0 615H720" stroke="#4a2b17"/>'''
save('threshold', shapes)

shapes = '<rect width="1200" height="800" fill="#16110e"/>'
for i in range(75):
    x = i * 18 - 70
    shapes += f'<path d="M{x} 0L{x+220} 800" stroke="url(#copper)" stroke-width="{9+i%3}" opacity="{.12 + .7*math.sin(i/75*math.pi):.2f}"/>'
shapes += '<path d="M0 0H1200V235L0 605Z" fill="#080807" opacity=".75"/>'
save('material', shapes)
print(f'Generated 9 original placeholder studies in {OUT}')
