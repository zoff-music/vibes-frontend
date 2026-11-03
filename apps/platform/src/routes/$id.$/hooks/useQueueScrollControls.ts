import { type RefObject, useEffect, useState } from 'preact/compat';

export function useQueueScrollControls(
  queueRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [visible, setVisible] = useState({ top: false, bottom: false });

  useEffect(() => {
    const queue = queueRef.current;
    if (!enabled || !queue) {
      setVisible({ top: false, bottom: false });
      return;
    }

    const desktop = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      const bounds = queue.getBoundingClientRect();
      const top = desktop.matches
        ? queue.scrollTop > 8
        : bounds.top < 0 && bounds.bottom > 100;
      const bottom =
        top &&
        (desktop.matches
          ? queue.scrollHeight - queue.scrollTop - queue.clientHeight > 8
          : bounds.bottom > window.innerHeight + 8);

      setVisible((previous) => {
        if (previous.top === top && previous.bottom === bottom) return previous;
        return { top, bottom };
      });
    };
    update();
    queue.addEventListener('scroll', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(queue);
    if (queue.firstElementChild) observer.observe(queue.firstElementChild);

    return () => {
      queue.removeEventListener('scroll', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [enabled, queueRef]);

  const scrollTo = (direction: 'top' | 'bottom') => {
    const queue = queueRef.current;
    if (!queue) return;

    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 'instant'
      : 'smooth';
    if (window.matchMedia('(min-width: 1024px)').matches) {
      queue.scrollTo({
        top: direction === 'top' ? 0 : queue.scrollHeight,
        behavior,
      });
      return;
    }

    queue.scrollIntoView({
      block: direction === 'top' ? 'start' : 'end',
      behavior,
    });
  };

  return { visible, scrollTo };
}
