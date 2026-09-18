import { usePageVisibility } from '@vibes/shared';
import { useInView } from 'framer-motion';
import { type ReactNode, Suspense, useEffect, useRef, useState } from 'react';

interface DeferredContentProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function DeferredContent({ children, fallback }: DeferredContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const nearby = useInView(ref, { once: true, margin: '240px 0px' });
  const visible = usePageVisibility();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (nearby && visible) {
      setReady(true);
    }
  }, [nearby, visible]);

  return (
    <div ref={ref} className="min-w-0">
      {ready && <Suspense fallback={fallback}>{children}</Suspense>}
      {!ready && fallback}
    </div>
  );
}
