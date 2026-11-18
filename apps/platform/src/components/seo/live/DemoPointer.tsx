import { m as motion } from 'framer-motion';
import { type RefObject, useLayoutEffect, useState } from 'preact/compat';

interface DemoPointerProps {
  containerRef: RefObject<HTMLElement | null>;
  target: string | null;
  pressed: boolean;
  phase: number;
}

interface Point {
  x: number;
  y: number;
}

function locate(container: HTMLElement, target: string): Point | null {
  const vote = target.startsWith('vote:');
  const selector =
    target === 'add'
      ? '[data-demo-target="controls"] a[title], [data-demo-target="add"]'
      : `[data-demo-target="${vote ? `item-${target.slice(5)}` : target}"]`;
  const element = [...container.querySelectorAll(selector)].find(
    (candidate) => candidate.getClientRects().length > 0,
  );

  if (!element) return null;

  const bounds = container.getBoundingClientRect();
  const rect = element.getBoundingClientRect();

  return {
    x: (vote ? rect.right - 40 : rect.left + rect.width * 0.55) - bounds.left,
    y: rect.top + rect.height * 0.55 - bounds.top,
  };
}

// The viewer's own pointer, showing where a person would tap.
export function DemoPointer({
  containerRef,
  target,
  pressed,
  phase,
}: DemoPointerProps) {
  const [point, setPoint] = useState<Point | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || !target) return;

    // Let dialogs open and reordered rows settle, then follow the target.
    const timeout = window.setTimeout(
      () => {
        const next = locate(container, target);

        if (next) setPoint(next);
      },
      pressed ? 80 : 600,
    );

    return () => window.clearTimeout(timeout);
  }, [containerRef, target, pressed]);

  if (!point) return null;

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{ x: point.x, y: point.y, opacity: target ? 1 : 0 }}
      transition={{
        x: { type: 'spring', stiffness: 110, damping: 20 },
        y: { type: 'spring', stiffness: 110, damping: 20 },
        opacity: { duration: 0.3 },
      }}
      className="pointer-events-none absolute top-0 left-0 z-40 text-white"
    >
      {pressed && target && (
        <span
          key={phase}
          className="motion-safe:animate-demo-ping absolute -top-4 -left-4 size-8 rounded-full border-2 border-white/80 opacity-0 [animation-delay:450ms]"
        />
      )}
      <motion.svg
        viewBox="0 0 16 20"
        animate={{ scale: pressed && target ? [1, 1, 0.82, 1] : 1 }}
        transition={{ duration: 0.8, times: [0, 0.5, 0.65, 1] }}
        className="size-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
      >
        <path
          d="M1 1v15l4-4 3 7 3-1.4-3-6.8h6Z"
          fill="currentColor"
          stroke="#0b0814"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}
