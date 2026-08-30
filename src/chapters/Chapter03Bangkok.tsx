import { Beat, Ja, Statement } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { BangkokCounter } from '../components/BangkokCounter'
import { AssetImage } from '../components/Placeholder'
import { PendingAssetNote } from '../components/PendingAssetNote'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic, lerp } from '../animation/ease'
import { useCueAt } from '../audio/AudioProvider'
import { isAssetPresent } from '../data/assets'

/**
 * Chapter 3 — The Bangkok Experience.
 *
 * The store assembles from a single coconut landing on rough wood, and resolves
 * into the photographed storefront. The purchase happens on the street side of
 * the counter, and the chapter holds on the offer.
 */
export function Chapter03Bangkok() {
  const { elapsed } = usePresentation()
  const product = useBeat(2.6, 7.0)
  const ritual = useBeat(7.2, 11.6)
  const experience = useBeat(11.8, 16.2)
  const offer = useBeat(17.0)

  useCueAt(1.0, 'coconut-cut', 0.35)

  // The built counter hands over to the photograph for the reveal.
  const storefront = isAssetPresent('img-store')
  const reveal = easeCinematic(clamp((elapsed - 16.4) / 2.0))
  const counterOpacity = storefront ? 1 - reveal : 1

  return (
    <ChapterShell>
      {/* The storefront photograph is portrait, and it carries the sign, the
          shelves and the pavement in one frame. It gets a portrait panel rather
          than a 16:9 crop, which would cut the top off the signage. */}
      {storefront && (
        <div
          className="layer"
          style={{
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: 'var(--edge)',
            paddingRight: 'calc(var(--edge) * 1.5)',
            opacity: reveal,
          }}
        >
          <div
            style={{
              height: 'min(78vh, 100%)',
              aspectRatio: '2 / 3',
              transform: `scale(${lerp(1.04, 1, reveal)})`,
              boxShadow: '0 40px 90px rgba(0, 0, 0, 0.55)',
            }}
          >
            <AssetImage
              assetId="img-store"
              alt="The Coconut Bros Bangkok flagship: an outside cutting counter, two shelves of whole Nam Hom coconuts, and the ornate signage above, seen from the pavement."
              ratio="2 / 3"
            />
          </div>
        </div>
      )}
      <BangkokCounter elapsed={elapsed} opacity={counterOpacity} />
      <div className="scrim scrim--bottom" style={{ zIndex: 3 }} aria-hidden="true" />

      <Beat from={2.6} to={7.0} placement="bottom-left">
        <Statement lines={['ONE EXCEPTIONAL', 'PRODUCT.']} progress={product.enter} />
        <Ja lines={['ひとつの特別な商品。']} />
      </Beat>

      <Beat from={7.2} to={11.6} placement="bottom-left">
        <Statement lines={['ONE VISIBLE RITUAL.']} progress={ritual.enter} />
        <Ja lines={['目の前で生まれる、ひとつの儀式。']} />
      </Beat>

      <Beat from={11.8} to={16.2} placement="bottom-left">
        <Statement lines={['ONE UNFORGETTABLE', 'BANGKOK EXPERIENCE.']} progress={experience.enter} />
        <Ja lines={['忘れられないバンコク体験。']} />
      </Beat>

      {/* With the photograph holding the right of the frame, the offer moves to
          the vertical centre of the left half so the two masses balance. */}
      <Beat
        from={17.0}
        placement={storefront ? 'center-left' : 'bottom-left'}
        scrim={storefront ? 'left' : 'bottom'}
      >
        <div className="price-plate" style={{ opacity: easeCinematic(offer.enter) }}>
          <span className="price-plate__product">Sweet Thai Nam Hom Coconut</span>
          <span className="price-plate__price">79 THB</span>
        </div>
      </Beat>

      {/* The assembled counter is a designed stand-in for the photograph, and
          says so rather than passing itself off as the storefront. */}
      {!storefront && <PendingAssetNote assetIds={['img-store']} />}
    </ChapterShell>
  )
}
