# Asset replacement guide

Six assets are required for the final presentation and are not yet supplied.
Everything below is what the build is currently substituting, and exactly what
has to arrive to replace it.

Check status at any time:

```bash
npm run assets:check          # terminal report
npm run dev                   # then open http://127.0.0.1:5173/?debug=assets
```

## Supplied

| Path | Supplied as | Where it appears |
|---|---|---|
| `public/assets/brand/coconut-bros-logo.png` | 4096×1978, transparent | The Chapter 3 signage reveal |
| `public/assets/images/bangkok-store.jpg` | 1023×1537, portrait | Chapter 3's storefront reveal and hold, and Chapter 7's closing frame. Both are composed around the portrait shape so the signage and pavement are never cropped away. |
| `public/assets/images/siam-reserve-bottle-hero.png` | 1024×1536, portrait | Chapter 5's final hold, which dissolves into it from the live bottle. A still, not the model — see the GLB row below. |
| `public/assets/images/uniforms.jpg` | 1662×946 | Not currently placed in a composition. |

## Required for the final presentation

| Path | What it is | What the build shows instead |
|---|---|---|
| `public/assets/brand/siam-reserve-label.png` | Supplied label artwork, unwrapped to the bottle UV, ≈2:1 | A blank deep-green label band on the 3D bottle in chapters 6 and 7, plus an on-screen "artwork pending" note |
| `public/assets/images/nam-hom-harvest.jpg` | Pole harvesting, 16:9 | Labelled 16:9 placeholder frame in the same slot |
| `public/assets/images/nam-hom-selection.jpg` | Sorting, trimming, chilling, 16:9 | Labelled 16:9 placeholder frame in the same slot |
| `public/assets/video/bottle-transformation.mp4` | The Blender hero render, 18–26s, 1920×1080 | The WebGL transformation stand-in, on the identical beat map |
| `public/assets/models/siam-reserve-bottle.glb` | The bottle model | A lathe stand-in built from `src/three/bottleProfile.ts`. The supplied raster hero covers Chapter 5's hold, but chapters 6 and 7 move the camera around the bottle and need real geometry. |
| `public/poster.jpg` | Global fallback still, and the matched last frame of the hero render | A deep jungle-black field |

## Optional enhancements

| Path | What it is | Current behaviour |
|---|---|---|
| `assets/brand/coconut-bros-logo.svg` | Vector of the approved mark | The supplied 4096px PNG covers every use in this build; vector is only needed if the mark is printed or scaled beyond that |
| `assets/images/nam-hom-grove.jpg` | Grove still | The procedural WebGL grove carries Chapter 1 |
| `assets/video/discovery.mp4` | Droplet push-through | Procedural WebGL droplet and grove |
| `assets/video/provenance.mp4` | Grow → harvest → select | Still-image beats with a simulated camera move |
| `assets/video/bangkok.mp4` | Storefront reveal | Procedural counter assembly, dissolving into the photograph |
| `assets/video/business-ritual.mp4` | The cutting ritual | Procedural counter plate and customer path |
| `assets/video/japan-transition.mp4` | Tropical → ivory | Live palette transition on the chapter timeline |
| `assets/audio/*` (6 files) | Ambience and sound design | Restrained synthesised stand-ins at low level |

## Specifications worth getting right first time

**`bottle-transformation.mp4`** — constant frame rate, H.264, 1920×1080, no
burned-in text, and a total length of 24s to match `src/three/heroTimeline.ts`.
If the render lands at a different length, change `HERO.total` and the beat
ranges in that one file; nothing else needs to move. Its final frame must match
the live 3D composition — see `docs/video-to-3d-handoff.md`.

**`siam-reserve-bottle.glb`** — real-world scale in metres (the stand-in is
0.232m tall), Y-up, origin at the centre of the base. Separate materials for
glass, contents and label so the label texture can be swapped without touching
geometry. 1K–2K textures except the label. Draco and KTX2 are both supported and
their decoders are bundled locally — nothing is fetched from a CDN.

**Brand artwork** — supply the approved files. This build will not generate,
redraw, or approximate the logo or the label, and will keep showing a labelled
placeholder until the real artwork is in the tree.
