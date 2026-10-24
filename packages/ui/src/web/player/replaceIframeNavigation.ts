import { safeWrap } from '@vibes/shared';

export function replaceIframeNavigation(
  iframe: HTMLIFrameElement,
  load: () => void,
): Error | null {
  const frameWindow = iframe.contentWindow;

  if (!frameWindow) return new Error('Player frame is unavailable');

  const descriptor = Object.getOwnPropertyDescriptor(iframe, 'src');
  const currentSrc = iframe.src;
  let nextSrc = '';

  // SoundCloud's synchronous load() sets src after preparing its READY bridge.
  // Capture that navigation only; keep the SDK's setup and the iframe intact.
  const [loadError] = safeWrap(() => {
    Object.defineProperty(iframe, 'src', {
      configurable: true,
      get: () => currentSrc,
      set: (value: string) => {
        nextSrc = value;
      },
    });
    load();
  });

  const [restoreError] = safeWrap(() => {
    if (descriptor) {
      Object.defineProperty(iframe, 'src', descriptor);

      return;
    }

    Reflect.deleteProperty(iframe, 'src');
  });

  if (loadError) return loadError;
  if (restoreError) return restoreError;
  if (!nextSrc) return new Error('Player did not provide a navigation URL');

  const [navigationError] = safeWrap(() =>
    frameWindow.location.replace(nextSrc),
  );

  return navigationError;
}
