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
  'M 10 148 L 20 138 L 24 128 L 34 122 L 46 118 L 58 112 L 70 104 L 79 94 L 88 80 ' +
  'L 96 66 L 102 52 L 107 38 L 110 24 L 100 20 L 94 34 L 88 50 L 81 64 L 73 77 ' +
  'L 64 88 L 53 97 L 42 104 L 31 110 L 22 116 L 14 124 L 6 136 Z'

/** Local box: 120 × 160. Shikoku. */
export const JAPAN_SOUTH_PATH = 'M 44 126 L 58 120 L 66 126 L 52 133 Z'

/** Local box: 120 × 160. Hokkaido. */
export const JAPAN_NORTH_PATH = 'M 110 20 L 118 8 L 113 0 L 100 5 L 99 14 Z'
