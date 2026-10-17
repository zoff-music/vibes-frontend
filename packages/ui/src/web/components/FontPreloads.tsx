import boldFontUrl from '../../shared/assets/fonts/MSW98UI-Bold-latin.woff2?url';
import regularFontUrl from '../../shared/assets/fonts/MSW98UI-Regular-latin.woff2?url';

export function FontPreloads() {
  return (
    <>
      {[regularFontUrl, boldFontUrl].map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
