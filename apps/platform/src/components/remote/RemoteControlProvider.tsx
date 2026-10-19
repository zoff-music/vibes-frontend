import {
  useFetcher,
  useURLLocation as useLocation,
  useNavigate,
  useParams,
} from '@kasperrt/smolter/preact';
import { useRemoteEvents } from '@vibes/api';
import type {
  RemoteEventV2,
  RemotePairingV2,
  RemoteStatusV2,
} from '@vibes/models';
import {
  classNames,
  showToast,
  usePlaybackStore,
  useRoomStore,
} from '@vibes/shared';
import { LinkButton, RemoteIcon, Tooltip } from '@vibes/ui/web';
import { AnimatePresence } from 'framer-motion';
import {
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'preact/compat';
import type { RemoteControlActionData } from '../../routes/resources.remotes/clientAction';
import { subscribeRemoteReports } from '../../utils/remoteReporting';
import { createEmptyRemoteStatus } from '../../utils/remoteStatus';
import { canUseViewTransition } from '../../utils/viewTransition';

interface RemoteRoomUpdate {
  origin: string;
  roomId: string;
}

const loadRemoteControlDialog = () => import('./RemoteControlDialog');

const LazyRemoteControlDialog = lazy(async () => {
  const module = await loadRemoteControlDialog();

  return {
    default: module.RemoteControlDialog,
  };
});

interface RemoteControlContextValue {
  remoteHref: string;
  setMachineRoomId: (roomId: string) => void;
}

const RemoteControlContext = createContext<RemoteControlContextValue | null>(
  null,
);

interface Props {
  children: ReactNode;
  initialRemote?: RemoteStatusV2;
}

export function RemoteControlProvider({ children, initialRemote }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const controlFetcher = useFetcher<RemoteControlActionData>();
  const reportFetcher = useFetcher<RemoteControlActionData>();
  const roomId = params.id;
  const isOpen = Boolean(roomId) && params['*'] === 'settings/remote';
  const panelUrl = new URL(
    typeof window === 'undefined' ? location.href : window.location.href,
  );
  const panelSuffix = `${panelUrl.search}${panelUrl.hash}`;
  const remotePath = `/${encodeURIComponent(roomId ?? '')}/settings/remote${panelSuffix}`;
  const [machineRoomId, setMachineRoomId] = useState('');
  const partyMode =
    Boolean(machineRoomId) &&
    new URLSearchParams(location.search).get('view') === 'party';
  const currentPlaylistItemId = usePlaybackStore(
    (state) => state.currentPlaylistItem?.id ?? '',
  );
  const roomMode = useRoomStore((state) => state.room?.mode);
  const applyRemotePlayback = usePlaybackStore(
    (state) => state.applyRemotePlayback,
  );
  const [remote, setRemote] = useState<RemoteStatusV2>(
    initialRemote ?? createEmptyRemoteStatus,
  );
  const [pairing, setPairing] = useState<RemotePairingV2 | null>(null);

  useEffect(() => {
    if (!remote.enabled || !remote.id) return;

    return subscribeRemoteReports(() =>
      reportFetcher.submit(
        {
          intent: 'update',
          remoteId: remote.id,
          roomId: machineRoomId,
          partyMode: String(partyMode),
        },
        { method: 'post', action: '/resources/remotes' },
      ),
    );
  }, [
    remote.enabled,
    remote.id,
    machineRoomId,
    partyMode,
    reportFetcher.submit,
  ]);

  useEffect(() => {
    if (controlFetcher.state !== 'idle' || !controlFetcher.data) return;

    if (controlFetcher.data.error) {
      showToast(controlFetcher.data.error, 'error');

      return;
    }

    if (
      controlFetcher.data.intent === 'enable' &&
      controlFetcher.data.pairing
    ) {
      const nextPairing = controlFetcher.data.pairing;
      setPairing(nextPairing);
      setRemote({
        currentRoomId: nextPairing.currentRoomId,
        currentPlaylistItemId: nextPairing.currentPlaylistItemId,
        enabled: true,
        id: nextPairing.id,
        online: true,
        paired: false,
        partyMode: nextPairing.partyMode,
        playbackIsPlaying: nextPairing.playbackIsPlaying,
        playbackObservedAt: nextPairing.playbackObservedAt,
        playbackPositionMs: nextPairing.playbackPositionMs,
      });

      return;
    }

    if (controlFetcher.data.intent === 'delete') {
      setPairing(null);
      setRemote(createEmptyRemoteStatus());
      showToast('Remote control disabled', 'success');
    }
  }, [controlFetcher.data, controlFetcher.state]);

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteRoomUpdate) => {
      if (event.origin !== 'controller' || !event.roomId) return;

      navigate(`/${encodeURIComponent(event.roomId)}`, {
        viewTransition: canUseViewTransition(),
      });
    },
    [navigate],
  );

  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEventV2) => {
      setRemote((current) => ({
        ...current,
        currentRoomId: event.roomId,
        currentPlaylistItemId: event.currentPlaylistItemId,
        online: event.online,
        paired: event.paired,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        partyMode: event.partyMode,
        playbackPositionMs: event.playbackPositionMs,
      }));

      if (event.paired) {
        setPairing((current) => {
          if (current) {
            showToast('Remote paired successfully', 'success');
          }

          return null;
        });
      }

      if (
        event.origin !== 'controller' ||
        event.roomId !== machineRoomId ||
        !roomMode
      ) {
        return;
      }

      if (
        !event.currentPlaylistItemId ||
        event.currentPlaylistItemId === currentPlaylistItemId
      ) {
        applyRemotePlayback(
          event.playbackIsPlaying,
          event.playbackPositionMs,
          roomMode,
        );
      }
    },
    [currentPlaylistItemId, machineRoomId, roomMode, applyRemotePlayback],
  );

  useRemoteEvents({
    remoteId: remote.enabled ? remote.id : undefined,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    onPresentationUpdate: (event) => {
      if (
        event.origin !== 'controller' ||
        !machineRoomId ||
        event.roomId !== machineRoomId
      )
        return;

      const search = new URLSearchParams(location.search);

      if (event.partyMode) search.set('view', 'party');
      else search.delete('view');

      void navigate(
        {
          pathname: location.pathname,
          search: search.toString(),
          hash: location.hash,
        },
        { replace: true, preventScrollReset: true },
      );
    },
  });

  const closeRemoteControl = useCallback(() => {
    if (roomId) {
      void navigate(`/${encodeURIComponent(roomId)}/settings${panelSuffix}`, {
        replace: true,
        preventScrollReset: true,
        viewTransition: false,
      });
      return;
    }
  }, [roomId, navigate, panelSuffix]);

  const value = useMemo(
    () => ({
      remoteHref: remotePath,
      setMachineRoomId,
    }),
    [remotePath],
  );

  return (
    <RemoteControlContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <Suspense
            fallback={
              <p role="status" className="sr-only">
                Loading remote controls...
              </p>
            }
          >
            <LazyRemoteControlDialog
              controlFetcher={controlFetcher}
              remote={remote}
              pairing={pairing}
              machineRoomId={roomId ?? machineRoomId}
              isOpen={isOpen}
              closeRemoteControl={closeRemoteControl}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </RemoteControlContext.Provider>
  );
}

export function useRemoteControl() {
  const context = useContext(RemoteControlContext);

  if (!context) {
    throw new Error(
      'useRemoteControl must be used within RemoteControlProvider',
    );
  }

  return context;
}

interface RemoteControlButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function RemoteControlButton({
  className,
  showLabel = false,
}: RemoteControlButtonProps) {
  const { remoteHref } = useRemoteControl();
  const tooltipClassName = classNames(
    showLabel ? 'flex w-full' : 'inline-flex',
  );

  return (
    <Tooltip
      align="end"
      className={tooltipClassName}
      content="Remote control"
      side="bottom"
    >
      <LinkButton
        to={remoteHref}
        replace
        preventScrollReset
        viewTransition={false}
        prefetch="intent"
        prefetchData
        variant="tertiary"
        size={showLabel ? 'medium' : 'icon'}
        className={className}
        aria-label="Remote control"
      >
        <RemoteIcon className="h-5 w-5" />
        {showLabel && 'Remote control'}
      </LinkButton>
    </Tooltip>
  );
}
