import { useNavigate, useURLLocation } from '@kasperrt/smolter/preact';
import { useState } from 'preact/hooks';
import { homePanelBase } from '../utils/homePanel';

export function useDeviceSettings() {
  const location = useURLLocation();
  const navigate = useNavigate();
  const [localOpen, setLocalOpen] = useState(false);
  const base = homePanelBase(location.pathname);
  const isOpen = base
    ? location.pathname.endsWith('/settings/device')
    : localOpen;
  const href = (open: boolean) => {
    const url = new URL(
      typeof window === 'undefined' ? location.href : window.location.href,
    );
    url.pathname = open
      ? `${base === '/' ? '' : base}/settings/device`
      : (base ?? url.pathname);

    return `${url.pathname}${url.search}${url.hash}`;
  };
  const setOpen = (open: boolean) => {
    if (!base) {
      setLocalOpen(open);

      return;
    }

    void navigate(href(open), {
      replace: true,
      preventScrollReset: true,
      viewTransition: false,
    });
  };
  return { isOpen, setOpen, settingsHref: base ? href(true) : undefined };
}
