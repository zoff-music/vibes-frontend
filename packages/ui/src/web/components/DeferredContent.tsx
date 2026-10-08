import { usePageVisibility } from '@vibes/shared';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import logo from '../assets/logo-header-96.webp?no-inline';

interface DeferredContentProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function DeferredContent({ children, fallback }: DeferredContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const nearby = useInView(ref, { once: true, margin: '400px 0px' });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const markLoaded = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    if (nearby && visible) {
      setReady(true);
    }
  }, [nearby, visible]);

  return (
    <div ref={ref} aria-busy={!loaded} className="relative grid min-w-0">
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: loaded ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
        className="pointer-events-none relative col-start-1 row-start-1 min-w-0"
      >
        {fallback}
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-full border border-theme bg-theme-surface/80 p-3 shadow-secondary-soft">
            <img
              src={logo}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full"
            />
          </div>
        </div>
      </motion.div>
      {ready && (
        <Suspense fallback={null}>
          <DeferredReveal visible={loaded} onReady={markLoaded}>
            {children}
          </DeferredReveal>
        </Suspense>
      )}
    </div>
  );
}

interface DeferredRevealProps {
  children: ReactNode;
  visible: boolean;
  onReady: () => void;
}

function DeferredReveal({ children, visible, onReady }: DeferredRevealProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;

    const reveal = () => {
      if (active) onReady();
    };

    // A newly mounted card can introduce a font weight not yet on the page.
    // Keep its text hidden until the font settles, including the failure path.
    void document.fonts.ready.then(reveal, reveal);

    return () => {
      active = false;
    };
  }, [onReady]);

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: reducedMotion || visible ? 0 : 12,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="col-start-1 row-start-1 min-w-0"
    >
      {children}
    </motion.div>
  );
}
