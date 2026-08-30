/**
 * Stylised country outlines, drawn as single continuous lines.
 *
 * These are simplified silhouettes for a line-drawing motif, not a map: they
 * carry the gesture from Thailand to Japan and nothing else. Each path is
 * authored in its own local box and positioned by the chapter.
 */

/** Local box: 100 × 160. Wide north, long narrow southern peninsula. */
export const THAILAND_PATH =
  'M 40 3 L 55 8 L 62 18 L 58 28 L 68 30 L 76 40 L 80 52 L 72 60 L 62 62 L 58 70 ' +
  'L 50 74 L 46 82 L 44 92 L 40 100 L 38 112 L 34 124 L 31 136 L 28 148 L 26 158 ' +
  'L 21 150 L 23 136 L 26 124 L 30 110 L 32 98 L 33 86 L 30 78 L 24 70 L 18 60 ' +
  'L 14 48 L 20 36 L 26 24 L 32 12 Z'

/** Local box: 120 × 160. Kyushu through Honshu to Aomori, as one stroke. */
export const JAPAN_MAIN_PATH =
  'M 14 140 L 22 128 L 30 126 L 40 118 L 52 110 L 62 102 L 72 90 L 80 76 L 88 62 ' +
  'L 94 48 L 100 36 L 104 26 L 96 22 L 90 34 L 84 48 L 78 62 L 70 74 L 62 86 ' +
  'L 52 96 L 42 106 L 32 114 L 22 118 L 12 128 Z'

/** Local box: 120 × 160. Shikoku. */
export const JAPAN_SOUTH_PATH = 'M 48 122 L 60 116 L 67 121 L 55 129 Z'

/** Local box: 120 × 160. Hokkaido. */
export const JAPAN_NORTH_PATH = 'M 106 20 L 116 10 L 112 2 L 100 6 L 98 16 Z'
