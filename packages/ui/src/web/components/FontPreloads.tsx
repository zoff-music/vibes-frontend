import regularFontUrl from '../../shared/assets/fonts/MSW98UI-Regular-latin.woff2?url';

export const fontPreloadUrls = [regularFontUrl];

export function FontPreloads() {
  return (
    <>
      {fontPreloadUrls.map((href) => (
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
