import { useState } from 'preact/hooks';

interface CriticalStylesProps {
  href: string;
  nonce?: string;
}

// Activate the full stylesheet as soon as it loads, independent of hydration.
const activateStylesheet =
  "(l=>{const a=()=>{l.media='all'};l.sheet?a():l.addEventListener('load',a)})(document.currentScript.previousElementSibling)";

export function CriticalStyles({ href, nonce }: CriticalStylesProps) {
  const [css] = useState(() =>
    typeof document === 'undefined'
      ? ''
      : (document.getElementById('critical-css')?.textContent ?? ''),
  );
  // The client entry hydrates after the stylesheet loads, so it is already active there.
  const active = typeof document !== 'undefined';

  return (
    <>
      <style id="critical-css" dangerouslySetInnerHTML={{ __html: css }} />
      <link
        rel="stylesheet"
        href={href}
        media={active ? 'all' : 'print'}
        data-critical-stylesheet=""
      />
      <script
        {...(nonce && { nonce })}
        dangerouslySetInnerHTML={{ __html: activateStylesheet }}
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
}
