import electroParty from '../../assets/product/electro-party.webp?url';
import mobileRemote from '../../assets/product/mobile-remote.webp?url';
import mobileSearch from '../../assets/product/mobile-search.webp?url';

interface ProductScreenshotsProps {
  kind?: 'room' | 'apps';
}

export function ProductScreenshots({ kind = 'room' }: ProductScreenshotsProps) {
  if (kind === 'apps') {
    return (
      <figure className="product-device-stage relative isolate overflow-hidden rounded-3xl border border-theme bg-theme-surface px-6 pt-7 sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,46,151,0.14),transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-md grid-cols-2 items-start gap-4 sm:gap-6">
          <div className="mt-9 overflow-hidden rounded-3xl border-4 border-[#261636] bg-[#120b1e] shadow-xl">
            <img
              src={mobileSearch}
              width={520}
              height={1130}
              loading="lazy"
              decoding="async"
              alt="Zoff mobile app searching YouTube and SoundCloud, with song results and add buttons"
              className="block h-auto w-full"
            />
          </div>
          <div className="overflow-hidden rounded-3xl border-4 border-[#261636] bg-[#120b1e] shadow-xl">
            <img
              src={mobileRemote}
              width={520}
              height={1130}
              loading="lazy"
              decoding="async"
              alt="Zoff mobile app pairing a remote using a QR code or pairing code"
              className="block h-auto w-full"
            />
          </div>
        </div>
        <figcaption className="relative py-5 text-center font-pixel text-theme-muted text-xs">
          Song search and remote pairing in the Zoff app.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-3xl border border-theme bg-[#120b1e] shadow-xl">
      <div className="flex items-center justify-between gap-3 border-white/10 border-b px-4 py-3 font-pixel text-2xs text-[#bfa8d6] tracking-widest">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#00d9ff]"
          />
          ELECTRO / PARTY SCREEN
        </span>
      </div>
      <img
        src={electroParty}
        width={1120}
        height={732}
        loading="lazy"
        decoding="async"
        alt="The electro room in Zoff's party screen, with the music player, shared queue, votes and a QR code to join"
        className="block h-auto w-full"
      />
      <figcaption className="border-white/10 border-t px-4 py-3 text-[#bfa8d6] text-xs">
        Party view, with the player, queue and a QR code to join.
      </figcaption>
    </figure>
  );
}
