import { useRemoteEvents } from '@vibes/api';
import type {
  RemoteEventV2,
  RemotePairingV2,
  RemoteStatusV2,
} from '@vibes/models';
import {
  classNames,
  safeWrapAsync,
  showToast,
  usePlaybackStore,
  useRoomStore,
} from '@vibes/shared';
import { TerminalButton } from '@vibes/ui/konami';
import { Button, RemoteIcon, Tooltip } from '@vibes/ui/web';
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
} from 'react';
import { useFetcher, useNavigate } from 'react-router';
import type { RemoteControlActionData } from '../../routes/remote-control/action';
import { createEmptyRemoteStatus } from '../../utils/remoteStatus';
import { canUseViewTransition } from '../../utils/viewTransition';
import { useKonamiMode } from '../konami/KonamiModeContext';

const loadRemoteControlDialog = () => import('./RemoteControlDialog');

function preloadRemoteControlDialog() {
  void safeWrapAsync(loadRemoteControlDialog());
}

const LazyRemoteControlDialog = lazy(async () => {
  const module = await loadRemoteControlDialog();
  return { default: module.RemoteControlDialog };
});

interface RemoteControlContextValue {
  openRemoteControl: () => void;
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
  const terminalMode = useKonamiMode();
  const controlFetcher = useFetcher<RemoteControlActionData>();
  const [isOpen, setIsOpen] = useState(false);
  const [machineRoomId, setMachineRoomId] = useState('');
  const currentPlaylistItemId = usePlaybackStore(
    (state) => state.currentPlaylistItem?.id ?? '',
  );
  const roomMode = useRoomStore((state) => state.room?.mode);
  const setLocalPlaybackPosition = usePlaybackStore(
    (state) => state.setLocalPlaybackPosition,
  );
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );
  const [remote, setRemote] = useState<RemoteStatusV2>(
    initialRemote ?? createEmptyRemoteStatus,
  );
  const [pairing, setPairing] = useState<RemotePairingV2 | null>(null);

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
    (event: { origin: string; roomId: string }) => {
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
        setLocalPlaybackPosition(event.playbackPositionMs);
      }
      setLocalPlayingState(event.playbackIsPlaying, roomMode);
    },
    [
      currentPlaylistItemId,
      machineRoomId,
      roomMode,
      setLocalPlaybackPosition,
      setLocalPlayingState,
    ],
  );

  useRemoteEvents({
    remoteId: remote.enabled ? remote.id : undefined,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
  });

  const openRemoteControl = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeRemoteControl = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openRemoteControl,
      setMachineRoomId,
    }),
    [openRemoteControl],
  );

  return (
    <RemoteControlContext.Provider value={value}>
      {children}

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
            machineRoomId={machineRoomId}
            terminalMode={terminalMode}
            isOpen={isOpen}
            closeRemoteControl={closeRemoteControl}
          />
        </Suspense>
      )}
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
  terminalMode?: boolean;
}

export function RemoteControlButton({
  className,
  showLabel = false,
  terminalMode = false,
}: RemoteControlButtonProps) {
  const { openRemoteControl } = useRemoteControl();
  const tooltipClassName = classNames(
    showLabel ? 'flex w-full' : 'inline-flex',
  );

  if (terminalMode) {
    return (
      <TerminalButton
        className={className}
        onClick={openRemoteControl}
        onFocus={preloadRemoteControlDialog}
        onPointerEnter={preloadRemoteControlDialog}
      >
        [REMOTE]
      </TerminalButton>
    );
  }

  return (
    <Tooltip
      align="end"
      className={tooltipClassName}
      content="Remote control"
      side="bottom"
    >
      <Button
        type="button"
        onClick={openRemoteControl}
        onFocus={preloadRemoteControlDialog}
        onPointerEnter={preloadRemoteControlDialog}
        variant="tertiary"
        size={showLabel ? 'medium' : 'icon'}
        className={className}
        aria-label="Remote control"
      >
        <RemoteIcon className="h-5 w-5" />
        {showLabel && 'Remote control'}
      </Button>
    </Tooltip>
  );
}
