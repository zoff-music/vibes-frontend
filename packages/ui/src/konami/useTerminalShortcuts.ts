import { useEffect, useRef } from 'react';

export type TerminalShortcutKey =
  | 'Escape'
  | 'F1'
  | 'F2'
  | 'F3'
  | 'F4'
  | 'F5'
  | 'F6'
  | 'F7'
  | 'F8'
  | 'F9'
  | 'F10'
  | 'F11'
  | 'F12';

export interface TerminalShortcut {
  disabled?: boolean;
  key: TerminalShortcutKey;
  onTrigger: () => void;
}

interface UseTerminalShortcutsOptions {
  enabled?: boolean;
}

export function useTerminalShortcuts(
  shortcuts: readonly TerminalShortcut[],
  { enabled = true }: UseTerminalShortcutsOptions = {},
) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector('[role="dialog"][aria-modal="true"]')
      ) {
        return;
      }

      const shortcut = shortcutsRef.current.find(
        (candidate) => candidate.key === event.key,
      );
      if (!shortcut || shortcut.disabled) return;

      event.preventDefault();
      shortcut.onTrigger();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
