import mobileRemotePng from '../../assets/product/mobile-remote.png?url';
import mobileRemote from '../../assets/product/mobile-remote.webp?url';
import mobileRemoteSmall from '../../assets/product/mobile-remote-small.webp?url';
import mobileSearchPng from '../../assets/product/mobile-search.png?url';
import mobileSearch from '../../assets/product/mobile-search.webp?url';
import mobileSearchSmall from '../../assets/product/mobile-search-small.webp?url';

const screens = [
  {
    label: 'Search and add',
    source: mobileSearch,
    smallSource: mobileSearchSmall,
    fallback: mobileSearchPng,
    alt: 'Zoff app showing YouTube and SoundCloud search results with add buttons',
  },
  {
    label: 'Pair as a remote',
    source: mobileRemote,
    smallSource: mobileRemoteSmall,
    fallback: mobileRemotePng,
    alt: 'Zoff app pairing a phone with another player using a QR code or pairing code',
  },
];

// Two real screens from the mobile app, side by side. No motion: the
// screenshots carry the page, and the larger one is a fast, stable LCP.
export function ProductScreenshots() {
  return (
    <figure className="relative isolate min-w-0">
      <div
        aria-hidden="true"
        className="bg-primary/20 absolute inset-x-10 top-1/4 bottom-1/4 -z-10 rounded-full blur-3xl"
      />
      <div className="flex items-end justify-center gap-4 sm:gap-6">
        {screens.map((screen, index) => (
          <div
            key={screen.label}
            className={
              index === 0
                ? 'w-[46%] max-w-64'
                : 'w-[40%] max-w-56 translate-y-0 sm:-translate-y-8'
            }
          >
            <div className="overflow-hidden rounded-[2rem] border-[6px] border-[#302139] bg-[#120b1e] shadow-xl">
              <picture>
                <source
                  type="image/webp"
                  sizes="(min-width: 640px) 256px, 46vw"
                  srcSet={`${screen.smallSource} 260w, ${screen.source} 520w`}
                />
                <img
                  src={screen.fallback}
                  width={520}
                  height={1130}
                  decoding="async"
                  {...(index === 0 && { fetchPriority: 'high' as const })}
                  alt={screen.alt}
                  className="block h-auto w-full"
                />
              </picture>
            </div>
            <p className="text-theme-muted mt-3 text-center text-sm">
              {screen.label}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">
        Screens from the Zoff app for iOS and Android.
      </figcaption>
    </figure>
  );
}
