import { useNavigate, useURLLocation } from '@kasperrt/smolter/preact';

export function useDeviceSettings() {
  const location = useURLLocation();
  const navigate = useNavigate();
  const url = new URL(
    typeof window === 'undefined' ? location.href : window.location.href,
  );
  const isOpen = url.pathname.endsWith('/settings/device');
  const base = url.pathname
    .replace(/\/settings\/device\/?$/, '')
    .replace(/\/$/, '');
  const suffix = `${url.search}${url.hash}`;
  const settingsHref = `${base}/settings/device${suffix}`;
  const close = () => {
    void navigate(`${base}${suffix}`, {
      replace: true,
      preventScrollReset: true,
      viewTransition: false,
    });
  };

  return { isOpen, settingsHref, close };
}
