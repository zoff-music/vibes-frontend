import { useEffect, useState } from 'preact/hooks';

interface CriticalStylesProps {
  href: string;
}

export function CriticalStyles({ href }: CriticalStylesProps) {
  const [css] = useState(() =>
    typeof document === 'undefined'
      ? ''
      : (document.getElementById('critical-css')?.textContent ?? ''),
  );
  const [ready, setReady] = useState(false);

  // The client entry hydrates after this stylesheet loads, so activation cannot repaint.
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      <style id="critical-css" dangerouslySetInnerHTML={{ __html: css }} />
      <link
        rel="stylesheet"
        href={href}
        media={ready ? 'all' : 'print'}
        data-critical-stylesheet=""
      />
      <noscript>
        <link rel="stylesheet" href={href} />
      </noscript>
    </>
  );
}
