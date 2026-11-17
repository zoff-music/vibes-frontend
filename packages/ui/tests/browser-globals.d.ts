import type * as transitions from '../src/web/routeTransition';

declare global {
  interface Window {
    transitions: typeof transitions;
    start: (persistent: boolean) => void;
    minimize: (enabled: boolean) => void;
    surface: Element | null;
    renderRoom: (minimized: boolean) => void;
    closeRoom: () => void;
    mountReminder: () => void;
    loadReminder: () => Promise<unknown>;
    joined?: string;
  }
}
