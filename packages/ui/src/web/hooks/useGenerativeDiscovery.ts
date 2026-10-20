import { safeWrap } from '@vibes/shared';
import { useEffect, useState } from 'preact/compat';

const discoveryStorageKey = 'zoff-ai-discovered';

export function useGenerativeDiscovery(active: boolean, enabled: boolean) {
  const [discovered, setDiscovered] = useState(active);
  const [dismissed, setDismissed] = useState(false);
  const [hint, setHint] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const [, saved] = safeWrap(() =>
      window.localStorage.getItem(discoveryStorageKey),
    );
    if (saved === '1') setDiscovered(true);
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === discoveryStorageKey && event.newValue === '1') {
        setDiscovered(true);
        setHint(false);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (active) {
      setDiscovered(true);
      safeWrap(() => window.localStorage.setItem(discoveryStorageKey, '1'));
    }
    if (!ready || !enabled || !visible || active || discovered || dismissed) {
      setHint(false);
      return;
    }
    const timer = window.setTimeout(() => setHint(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [active, discovered, dismissed, enabled, visible, ready]);

  const dismiss = () => {
    setDismissed(true);
    setHint(false);
  };
  const discover = () => {
    safeWrap(() => window.localStorage.setItem(discoveryStorageKey, '1'));
    setDiscovered(true);
    dismiss();
  };

  return {
    discover,
    dismiss,
    hint,
    inviting: ready && !discovered,
    animate: enabled && visible,
  };
}
