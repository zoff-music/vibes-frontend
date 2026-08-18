import { type RefObject, useEffect, useRef, useState } from 'react';

export function useProgressiveList(
  itemCount: number,
  batchSize = defaultBatchSize,
): readonly [number, RefObject<HTMLDivElement | null>] {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(itemCount, batchSize),
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount((current) =>
      Math.min(itemCount, Math.max(current, Math.min(itemCount, batchSize))),
    );
  }, [batchSize, itemCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= itemCount) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisibleCount(itemCount);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisibleCount((current) => Math.min(itemCount, current + batchSize));
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [batchSize, itemCount, visibleCount]);

  return [visibleCount, sentinelRef] as const;
}

const defaultBatchSize = 12;
