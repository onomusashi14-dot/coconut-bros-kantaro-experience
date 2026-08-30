# The rendered-video → live-3D handoff

The hero reveal in Chapter 5 is two different renderers playing one continuous
shot. This note explains how the seam is hidden and what the Blender render has
to deliver for it to stay hidden.

## Why it is split at all

The transformation — blade impact, water rising and suspending, glass
solidifying around a liquid silhouette, engraving, the seal closing — is beyond
what is worth simulating in a browser at 60fps. It is a Blender render.

The final composition is not. It has to be live, because the presenter holds on
it indefinitely while talking, and because a still frame in a room lit by a
laptop reads as a slide. Live WebGL keeps the glass alive: the environment
reflection moves microscopically, the condensation catches light, and the frame
never looks frozen.

So: the render carries the transformation, live WebGL carries the hold, and the
two are crossfaded at a frame where they are indistinguishable.

## How it works in the code

One timeline governs both. `src/three/heroTimeline.ts`:

```
anticipation  0.0 – 4.0 s
impact        4.0 – 6.5 s
formation     6.5 – 16.0 s
labelReveal  16.0 – 20.0 s
hold         20.0 – 24.0 s
handoff      20.4 – 22.0 s   ← the crossfade
```

- `src/chapters/Chapter05SiamReserve.tsx` scrubs `bottle-transformation.mp4`
  through `CinematicVideo` at `elapsed / HERO.total`, and drives the video
  layer's opacity from 1 to 0 across the `handoff` window.
- `src/three/BottleScene.tsx` drives the live bottle's opacity from 0 to 1
  across the same window, using the same easing.
- Both read the same `elapsed` from the presentation clock, so they cannot drift
  even if the presenter pauses mid-crossfade.

The crossfade sits *after* the label and seal have resolved and *before* the
silent hold, in the quietest 1.6 seconds of the chapter. Nothing is moving
except a slow rotation that both renderers share.

## What the render has to match

The live camera at the moment of handoff, from `BottleScene`:

| Property | Value |
|---|---|
| Camera position | `(-0.065, 0.125, 0.6)` metres |
| Look-at target | `(-0.065, 0.105, 0)` |
| Vertical field of view | 32° |
| Near / far | 0.01 / 60 |
| Bottle height | 0.232 m, base centred at the origin, Y-up |
| Background | `#030a06`, with very dark leaf forms far behind |
| Key light | from `(0.42, 0.7, 0.55)`, warm `#fff6e2` |
| Rim | from `(-0.6, 0.35, -0.5)`, antique gold `#c89636` |
| Tone mapping | ACES Filmic, exposure 1.05 |
| Rotation at handoff | slow Y rotation, easing to a complete stop by 24s |

The lateral offset settles between 16s and 20s and is completely still by the
handoff, so the bottle sits right of centre with the wordmark in the left half.
Render the last frame of the clip with the bottle at that exact scale, position
and rotation, and supply that same frame as `public/poster.jpg` — it doubles as
the global video-failure fallback.

## Verifying the match

1. Drop the render into `public/assets/video/`.
2. Run the app, press `5`, and let it play to the hold.
3. Press `Space` to pause anywhere inside 20.4–22.0s. Both layers are on screen
   at partial opacity; any mismatch in scale, position or lighting shows as a
   double image.
4. Nudge `HERO.handoff` if the render's beats land differently. It is the only
   value that needs to change.

## When the render does not exist

The WebGL stand-in plays the identical beat map: block and blade in
anticipation, the strike, water rising and suspending, particles resolving into
the bottle silhouette, glass solidifying, ridges, contents, condensation, then
the label band and seal. It ends on the same frame the render must end on, so
the timing, the copy and the presenter's rehearsal are all correct before the
render arrives. When the file lands, `videoDriven` flips and the stand-in stops
being used — nothing else changes.

If the render is present but fails to decode on the presentation laptop, the
chapter falls back to the stand-in immediately and silently, and a discreet
retry control appears in the corner.
