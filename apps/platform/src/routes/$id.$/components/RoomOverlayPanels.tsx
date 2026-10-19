import { useRouteLoaderData } from '@kasperrt/smolter/preact';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'preact/compat';
import type { RootLoaderData } from '../../../root';
import { useRoomPanel } from '../hooks/useRoomPanel';
import { DeferredModalLoading } from './DeferredModalLoading';

const ProfileSettingsModal = lazy(async () => {
  const module = await import(
    '../../../components/profile/ProfileSettingsModal'
  );
  return { default: module.ProfileSettingsModal };
});

const EmbedSharePanel = lazy(async () => {
  const module = await import('./EmbedSharePanel');
  return { default: module.EmbedSharePanel };
});

interface Props {
  roomId: string;
  url: string;
}

// Outside the animated room/header: fixed SSR dialogs must use the viewport.
export function RoomOverlayPanels({ roomId, url }: Props) {
  const { panel, open } = useRoomPanel();
  const root = useRouteLoaderData<RootLoaderData>('root');

  return (
    <AnimatePresence>
      {panel === 'settings/device' && (
        <Suspense
          key="device-settings"
          fallback={<DeferredModalLoading label="Loading device settings..." />}
        >
          <ProfileSettingsModal isOpen onClose={() => open('settings')} />
        </Suspense>
      )}
      {panel === 'share/embed' && (
        <Suspense
          key="embed-settings"
          fallback={<DeferredModalLoading label="Loading embed settings..." />}
        >
          <EmbedSharePanel
            isOpen
            onClose={() => open('share')}
            roomId={roomId}
            url={url}
            embedBasePath={root?.embedBasePath ?? '/embed'}
          />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
