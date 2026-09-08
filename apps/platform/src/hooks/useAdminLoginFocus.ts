import { useEffect, useRef } from 'react';

export function useAdminLoginFocus(requested: boolean) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!requested) return;
    // Run after modal focus effects and lazy settings have mounted.
    const frame = window.requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.scrollIntoView({ block: 'center', behavior: 'instant' });
      input.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [requested]);
  return inputRef;
}
