import { useEffect } from 'react';

export function useEmbedScrollContainment() {
  useEffect(() => {
    let touchY: number | null = null;

    const handleWheel = (event: WheelEvent) => {
      if (!event.cancelable || event.ctrlKey || event.defaultPrevented) return;
      if (canScroll(event.target, event.deltaY)) return;
      event.preventDefault();
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (
        !event.cancelable ||
        event.touches.length !== 1 ||
        event.defaultPrevented
      ) {
        touchY = null;
        return;
      }
      const nextTouchY = event.touches[0].clientY;
      const deltaY = touchY === null ? 0 : touchY - nextTouchY;
      touchY = nextTouchY;
      if (canScroll(event.target, deltaY)) return;
      event.preventDefault();
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
}

function canScroll(target: EventTarget | null, deltaY: number): boolean {
  if (!(target instanceof Element)) return false;
  const scrollArea = target.closest('[data-embed-scroll]');
  if (!(scrollArea instanceof HTMLElement)) return false;
  if (deltaY < 0) return scrollArea.scrollTop > 0;
  if (deltaY > 0) {
    return (
      scrollArea.scrollTop + scrollArea.clientHeight <
      scrollArea.scrollHeight - 1
    );
  }
  return false;
}
