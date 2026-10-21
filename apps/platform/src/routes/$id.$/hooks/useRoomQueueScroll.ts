import { type RefObject, useEffect } from 'preact/compat';

export function useRoomQueueScroll(
  queueRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const queue = queueRef.current;
    const room = queue?.closest<HTMLElement>('section[role="main"]');
    if (!enabled || !queue || !room) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    const onWheel = (event: WheelEvent) => {
      if (
        !desktop.matches ||
        event.defaultPrevented ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        !(event.target instanceof Element) ||
        queue.contains(event.target)
      )
        return;

      if (
        event.target.closest(
          'input, textarea, select, [role="dialog"], [data-volume-control]',
        )
      )
        return;

      // Menus and other scrollable panels retain their own wheel behavior.
      let element: Element | null = event.target;
      while (element && element !== room) {
        const overflow = getComputedStyle(element).overflowY;
        if (
          (overflow === 'auto' || overflow === 'scroll') &&
          element.scrollHeight > element.clientHeight
        )
          return;
        element = element.parentElement;
      }

      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? queue.clientHeight
            : 1;
      const previous = queue.scrollTop;
      queue.scrollTop += event.deltaY * unit;
      if (queue.scrollTop !== previous) event.preventDefault();
    };

    room.addEventListener('wheel', onWheel, {
      passive: false,
    });
    return () => room.removeEventListener('wheel', onWheel);
  }, [enabled, queueRef]);
}
