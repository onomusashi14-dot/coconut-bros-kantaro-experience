# Drop production assets here

Every filename in this tree is contractual. The application reads
`src/data/assets.ts`, checks whether the file exists at build time, and either
uses it or renders a labelled placeholder in its place. Put the real file at the
exact path below and it is picked up with no code change.

```
public/
├── poster.jpg                              global fallback still + matched hero frame
└── assets/
    ├── brand/
    │   ├── coconut-bros-logo.svg           approved standalone logo, vector
    │   ├── coconut-bros-logo.png           same logo, transparent PNG, ≥2048px
    │   └── siam-reserve-label.png          supplied label artwork, unwrapped to UV
    ├── images/
    │   ├── nam-hom-grove.jpg               16:9
    │   ├── nam-hom-harvest.jpg             16:9
    │   ├── nam-hom-selection.jpg           16:9
    │   ├── bangkok-store.jpg               16:9
    │   └── uniforms.jpg                    3:2
    ├── video/
    │   ├── discovery.mp4                   16:9, H.264, no burned-in text
    │   ├── provenance.mp4
    │   ├── bangkok.mp4
    │   ├── business-ritual.mp4
    │   ├── bottle-transformation.mp4       the hero render — see docs/video-to-3d-handoff.md
    │   └── japan-transition.mp4
    ├── models/
    │   └── siam-reserve-bottle.glb         Draco/KTX2 compressed, metres, Y-up, base at origin
    ├── audio/
    │   ├── ambient-grove.mp3
    │   ├── bangkok-street.mp3
    │   ├── coconut-cut.wav
    │   ├── water-rise.wav
    │   ├── glass-resonance.wav
    │   └── final-note.wav
    └── fonts/                              only if a licensed display face replaces Inter
```

Run `npm run assets:check` for the current status, or open the running app at
`?debug=assets`.

Two rules this build does not break:

- The Coconut Bros logo and the Siam Reserve label are only ever shown from
  their own asset files. Nothing redraws, approximates or regenerates them.
- A placeholder always looks like a placeholder. Nothing here is presented as
  final artwork.
