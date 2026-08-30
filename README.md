# Coconut Bros — The Nam Hom Legend

A cinematic, full-screen, offline-first interactive presentation, built to be
shown on a laptop to a prospective founding Japan partner.

Seven chapters, one at a time, driven entirely from the keyboard. Nothing
auto-advances: every chapter plays its sequence, settles into a stable
composition, and waits indefinitely for the presenter.

> **This is a functional first prototype.** Nine production assets — the
> approved logo, the Siam Reserve label, three photographs, the Blender hero
> render, the bottle GLB and the poster still — have not been supplied. They
> appear as clearly labelled placeholders. Nothing invents, redraws or
> approximates the Coconut Bros logo, the bottle or the label.

---

## Running it

```bash
npm install
npm run dev            # http://127.0.0.1:5173
```

Production build and local preview:

```bash
npm run build          # type-checks, then builds to dist/
npm run preview        # serves dist/ at http://127.0.0.1:4173
```

Other commands:

```bash
npm run typecheck      # types only
npm run assets:check   # which production assets are still outstanding
```

### Running it offline, on the presentation laptop

The build has no runtime network dependency: fonts, decoders and every asset are
bundled locally, and `base` is relative so `dist/` is portable.

1. `npm run build`
2. Copy the whole `dist/` folder onto the presentation machine.
3. Serve it from that folder with any static server, with the network off:

   ```bash
   npx serve dist          # or: python3 -m http.server 8080 --directory dist
   ```

4. Open the address, press `F` for fullscreen, then `BEGIN`.

A local static server is the recommended launch. Opening `dist/index.html`
directly from `file://` works in some browsers but is blocked by others' module
and worker security rules, so do not rely on it for the live presentation.

### URL modes

| URL | Purpose |
|---|---|
| `/` | The presentation |
| `/?debug=assets` | Asset status board — present/missing, path, type, expected aspect ratio, whether it is required, and what is standing in |
| `/?mode=scroll` | Development scroll-scrub mode: the page scroll drives the same chapter clock, for tuning beat timing by hand. Not for presenting. |

---

## The seven chapters

| # | Chapter | What it establishes |
|---|---|---|
| 1 | Discovery | Nam Hom is a specific aromatic Thai coconut, not a generic term |
| 2 | Provenance | Aroma, sweetness and freshness are decided by cultivation, harvest judgement and handling |
| 3 | Bangkok | One product, one visible ritual, one unforgettable Bangkok experience |
| 4 | Business model | Outside ordering, live cutting, fast conversion, Bangkok as the validation market |
| 5 | Siam Reserve | The hero transformation and the reveal of the bottled product |
| 6 | Japan | Siam Reserve carries the Bangkok legend to Japan, on a proposed validation pathway |
| 7 | Founding partnership | Authorship, judgment, guardianship, recognition, discipline |

Full keyboard reference: [`docs/keyboard-controls.md`](docs/keyboard-controls.md).

---

## How it is put together

```
src/
├── state/presentation.tsx     the seven-chapter state machine and its clock
├── data/assets.ts             the asset manifest — every path and what belongs there
├── data/chapters.ts           chapter definitions, durations, palettes, presenter notes
├── chapters/                  one component per chapter
├── components/                stage, typography, placeholders, presenter overlay
├── three/                     the persistent WebGL layer, grove and hero bottle
├── animation/                 easing and the beat hook chapters are written against
└── audio/                     gesture-gated audio engine and chapter ambience
```

Two decisions shape everything else:

**One clock, not scroll.** Each chapter has a duration; a single
`requestAnimationFrame` clock advances `elapsed` and every beat, camera move and
crossfade is a pure function of it. That is what lets the presenter pause
anywhere and hold indefinitely, and what keeps the rendered video and the live
3D bottle in lockstep through the hero handoff. Scroll drives the same clock
only in `?mode=scroll`, for development.

**One canvas.** A single WebGL renderer serves all seven chapters; scenes swap
inside it. Mounting a renderer per chapter is the quickest way to leak GPU
memory across a presentation's worth of forward-and-back navigation. Rendering
stops entirely when the page is hidden or when no chapter needs it.

The rendered-video → live-3D handoff in chapter 5 has its own note:
[`docs/video-to-3d-handoff.md`](docs/video-to-3d-handoff.md).

---

## Assets

Every filename in `public/assets/` is contractual. `src/data/assets.ts` is the
single source of truth; a Vite plugin scans `public/` at build time and tells
the app which files exist, so the experience never requests an asset that is not
there — no 404s in the console during a live presentation.

When an asset is missing the layout is preserved and a labelled placeholder
takes its place at the correct aspect ratio, stating the exact path the real
file must land at. Drop the file in and it is picked up with no code change.

Full guide: [`docs/asset-replacement-guide.md`](docs/asset-replacement-guide.md).

---

## Remaining blockers

Honest status. None of the placeholders below is a finished asset.

**Blocking a real presentation**

1. **`assets/brand/coconut-bros-logo.svg` / `.png`** — the approved logo. The
   Chapter 3 signage reveal and the Chapter 7 system currently show a labelled
   brand slot. This build will not draw a logo, and a storefront photograph
   crop is not an acceptable substitute.
2. **`assets/brand/siam-reserve-label.png`** — the label artwork. The 3D bottle
   carries a blank deep-green band, and says so on screen. Label typography is
   never generated procedurally.
3. **`assets/video/bottle-transformation.mp4`** — the Blender hero render. The
   WebGL stand-in plays the same beat map and hands off at the same frame, so
   timing and rehearsal are correct now, but the finished chapter needs the
   render.
4. **`assets/models/siam-reserve-bottle.glb`** — the bottle. The lathe stand-in
   has the right height, framing and materials, but it is a proportion study,
   not the product.
5. **`public/poster.jpg`** — the matched hero still, which is also the global
   video-failure fallback.
6. **`assets/images/nam-hom-harvest.jpg`, `nam-hom-selection.jpg`,
   `bangkok-store.jpg`** — the three photographs the narrative names directly.

**Known limitations of this build**

- **Audio is synthesised.** Six sound files are outstanding. Restrained
  synthesised beds and transients stand in; they hold the shape of the sound
  design without pretending to be it.
- **Chapter 3's storefront is a constructed diagram**, not the store. It
  animates the assembly correctly and labels itself as a stand-in; the
  photograph replaces it for the reveal once supplied.
- **Country outlines in Chapter 6 are stylised line drawings**, deliberately, to
  serve the gold-line motif. If the partner conversation needs geographic
  accuracy, they should be redrawn from real boundary data.
- **Typography is Inter and Noto Sans JP**, both bundled locally. If a licensed
  display family is chosen, add it under `public/assets/fonts/` and swap the
  `@import`s at the top of `src/styles.css`.
- **`?debug=assets` ships in the production build.** It is reachable only by
  URL, never during the presentation. Remove the `AssetDebugOverlay` mount in
  `src/App.tsx` if it should not exist in a handover build.

**Verified in this build**

Production build completes with no type errors. Driven end to end in Chromium at
16:10 and 16:9: all seven chapters reach their hold state and stay there, no
chapter auto-advances, forward, backward and direct `1`–`7` navigation all work,
repeated navigation churn does not grow the heap, and the console is free of
errors and failed requests.
