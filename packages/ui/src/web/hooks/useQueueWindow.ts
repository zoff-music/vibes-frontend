import { useEffect, useRef, useState } from 'preact/compat';

export function useQueueWindow(blockCount: number, pageVisible: boolean) {
  const ref = useRef<HTMLOListElement>(null);
  const [visibleBlocks, setVisibleBlocks] = useState<ReadonlySet<number>>(
    () => new Set([0]),
  );

  useEffect(() => {
    const list = ref.current;
    if (!list || !pageVisible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisibleBlocks(
        new Set(Array.from({ length: blockCount }, (_, i) => i)),
      );
      return;
    }

    let observer: IntersectionObserver | null = null;
    let scrollRoot: HTMLElement | null | undefined;
    const connect = () => {
      let parent = list.parentElement;
      while (parent) {
        if (parent === document.body || parent === document.documentElement) {
          parent = null;
          break;
        }
        if (
          /(auto|scroll)/.test(getComputedStyle(parent).overflowY) &&
          parent.scrollHeight > parent.clientHeight
        )
          break;
        parent = parent.parentElement;
      }

      if (observer && parent === scrollRoot) return;
      observer?.disconnect();
      scrollRoot = parent;
      observer = new IntersectionObserver(
        (entries) => {
          setVisibleBlocks((previous) => {
            const next = new Set(previous);
            for (const entry of entries) {
              const index = Number(
                (entry.target as HTMLElement).dataset.queueBlock,
              );
              if (entry.isIntersecting) next.add(index);
              else next.delete(index);
            }

            if (
              next.size === previous.size &&
              [...next].every((i) => previous.has(i))
            ) {
              return previous;
            }
            return next;
          });
        },
        { root: parent, rootMargin: '600px 0px' },
      );
      for (const block of list.querySelectorAll('[data-queue-block]')) {
        observer.observe(block);
      }
    };

    connect();
    const resize = new ResizeObserver(connect);
    resize.observe(list);
    if (list.parentElement) resize.observe(list.parentElement);
    window.addEventListener('resize', connect);

    return () => {
      observer?.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', connect);
    };
  }, [blockCount, pageVisible]);

  return { ref, visibleBlocks };
}
