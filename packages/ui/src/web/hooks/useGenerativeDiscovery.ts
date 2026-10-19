import { useEffect, useState } from 'preact/compat';

export function useGenerativeDiscovery(active: boolean, enabled: boolean) {
  const [discovered, setDiscovered] = useState(active);
  const [dismissed, setDismissed] = useState(false);
  const [hint, setHint] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (active) setDiscovered(true);
    if (!enabled || !visible || active || discovered || dismissed) {
      setHint(false);
      return;
    }
    const timer = window.setTimeout(() => setHint(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [active, discovered, dismissed, enabled, visible]);

  const dismiss = () => {
    setDismissed(true);
    setHint(false);
  };
  const discover = () => {
    setDiscovered(true);
    dismiss();
  };

  return {
    discover,
    dismiss,
    hint,
    inviting: !discovered,
    animate: enabled && visible,
  };
}
