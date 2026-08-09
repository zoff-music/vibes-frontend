import { useRemoteEvents } from '@vibes/api';
import type { RemoteEvent, RemotePairing, RemoteStatus } from '@vibes/models';
import {
  classNames,
  showToast,
  usePlaybackStore,
  useRoomStore,
} from '@vibes/shared';
import { Button, CloseIcon, Modal, RemoteIcon, Tooltip } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFetcher, useNavigate } from 'react-router';
import type { RemoteControlActionData } from '../../routes/remote-control/action';
import type { RemoteControlLoaderData } from '../../routes/remote-control/clientLoader';

interface RemoteControlContextValue {
  openRemoteControl: () => void;
  setMachineRoomId: (roomId: string) => void;
}

const RemoteControlContext = createContext<RemoteControlContextValue | null>(
  null,
);

interface Props {
  children: ReactNode;
}

export function RemoteControlProvider({ children }: Props) {
  const navigate = useNavigate();
  const statusFetcher = useFetcher<RemoteControlLoaderData>();
  const controlFetcher = useFetcher<RemoteControlActionData>();
  const heartbeatFetcher = useFetcher<RemoteControlActionData>();
  const heartbeatFormRef = useRef<HTMLFormElement>(null);
  const heartbeatSubmitRef = useRef(heartbeatFetcher.submit);
  const [isOpen, setIsOpen] = useState(false);
  const [machineRoomId, setMachineRoomId] = useState('');
  const currentSongId = usePlaybackStore(
    (state) => state.currentSong?.id ?? '',
  );
  const playbackPositionMs = usePlaybackStore(
    (state) => state.actualPositionMs,
  );
  const playbackIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const roomMode = useRoomStore((state) => state.room?.mode);
  const setLocalPlaybackPosition = usePlaybackStore(
    (state) => state.setLocalPlaybackPosition,
  );
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );
  const [remote, setRemote] = useState<RemoteStatus>({
    currentRoomId: '',
    currentSongId: '',
    enabled: false,
    id: '',
    online: false,
    paired: false,
    playbackIsPlaying: false,
    playbackObservedAt: '',
    playbackPositionMs: 0,
  });
  const [pairing, setPairing] = useState<RemotePairing | null>(null);

  useEffect(() => {
    statusFetcher.load('/remote-control');
  }, [statusFetcher.load]);

  useEffect(() => {
    if (statusFetcher.data?.remote) {
      setRemote(statusFetcher.data.remote);
      if (statusFetcher.data.remote.paired && pairing) {
        setPairing(null);
        showToast('Remote paired successfully', 'success');
      }
    }
  }, [pairing, statusFetcher.data]);

  useEffect(() => {
    if (!isOpen || !pairing) return;

    const interval = window.setInterval(() => {
      statusFetcher.load('/remote-control');
    }, remotePairingStatusIntervalMs);

    return () => window.clearInterval(interval);
  }, [isOpen, pairing, statusFetcher.load]);

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
        currentSongId: nextPairing.currentSongId,
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
      setRemote({
        currentRoomId: '',
        currentSongId: '',
        enabled: false,
        id: '',
        online: false,
        paired: false,
        playbackIsPlaying: false,
        playbackObservedAt: '',
        playbackPositionMs: 0,
      });
      showToast('Remote control disabled', 'success');
    }
  }, [controlFetcher.data, controlFetcher.state]);

  const handleRemoteRoomUpdate = useCallback(
    (event: { origin: string; roomId: string }) => {
      if (event.origin !== 'controller' || !event.roomId) return;
      navigate(`/${encodeURIComponent(event.roomId)}`, {
        viewTransition: true,
      });
    },
    [navigate],
  );

  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEvent) => {
      if (
        event.origin !== 'controller' ||
        event.roomId !== machineRoomId ||
        roomMode !== 'server' ||
        (event.currentSongId && event.currentSongId !== currentSongId)
      ) {
        return;
      }
      setLocalPlaybackPosition(event.playbackPositionMs);
      setLocalPlayingState(event.playbackIsPlaying, 'server');
    },
    [
      currentSongId,
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

  useEffect(() => {
    heartbeatSubmitRef.current = heartbeatFetcher.submit;
  }, [heartbeatFetcher.submit]);

  useEffect(() => {
    if (!remote.enabled || !heartbeatFormRef.current) return;

    const submitHeartbeat = () => {
      if (!heartbeatFormRef.current) return;
      heartbeatSubmitRef.current(heartbeatFormRef.current);
    };
    submitHeartbeat();
    const interval = window.setInterval(
      submitHeartbeat,
      remoteHeartbeatIntervalMs,
    );

    return () => window.clearInterval(interval);
  }, [machineRoomId, remote.enabled, remote.id]);

  const value = useMemo(
    () => ({
      openRemoteControl: () => setIsOpen(true),
      setMachineRoomId,
    }),
    [],
  );

  const pairingUrl = pairing
    ? `${window.location.origin}/remotes?remoteId=${encodeURIComponent(pairing.id)}&pair=${encodeURIComponent(pairing.pairingToken)}`
    : '';

  return (
    <RemoteControlContext.Provider value={value}>
      {children}

      <heartbeatFetcher.Form
        ref={heartbeatFormRef}
        action="/remote-control"
        method="post"
        className="hidden"
      >
        <input type="hidden" name="intent" value="heartbeat" />
        <input type="hidden" name="remoteId" value={remote.id} />
        <input type="hidden" name="roomId" value={machineRoomId} />
        <input type="hidden" name="currentSongId" value={currentSongId} />
        <input
          type="hidden"
          name="playbackPositionMs"
          value={Math.round(playbackPositionMs)}
        />
        <input
          type="hidden"
          name="playbackIsPlaying"
          value={String(playbackIsPlaying)}
        />
      </heartbeatFetcher.Form>

      <Modal
        ariaLabelledBy="remote-control-title"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="sm"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="remote-control-title"
              className="font-display text-lg text-theme"
            >
              Remote Control
            </h2>
            <p className="mt-2 text-sm text-theme-muted">
              Pair another device to control this browser. Disabling remote
              control revokes access immediately.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            aria-label="Close remote control"
          >
            <CloseIcon className="h-5 w-5" />
          </Button>
        </div>

        {pairing && (
          <div className="space-y-5 text-center">
            <div className="inline-flex rounded-2xl bg-white p-3">
              <QRCodeSVG
                value={pairingUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#2a1840"
                level="H"
                marginSize={3}
                title="Pair Zoff remote"
                imageSettings={{
                  src: platformLogoUrl,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="rounded-2xl border border-theme bg-theme-surface p-4">
              <p className="font-pixel text-2xs text-theme-muted tracking-label">
                Manual pairing
              </p>
              <p className="mt-3 break-all font-mono text-theme text-xs">
                {pairing.id}
              </p>
              <p className="mt-3 font-display text-2xl text-secondary tracking-widest">
                {pairing.pairingCode}
              </p>
            </div>
            <p className="text-theme-subtle text-xs">
              This pairing expires shortly and can only be used once.
            </p>
          </div>
        )}

        {!pairing && remote.enabled && (
          <div className="rounded-2xl border border-theme bg-theme-surface p-5 text-center">
            <RemoteIcon className="mx-auto h-10 w-10 text-secondary" />
            {remote.paired && (
              <>
                <p className="mt-3 font-display text-sm text-theme">
                  Remote paired
                </p>
                <p className="mt-2 text-theme-muted text-xs">
                  The one-time pairing has been used. The paired device can now
                  control this browser until remote control is disabled or
                  replaced.
                </p>
              </>
            )}
            {!remote.paired && (
              <>
                <p className="mt-3 font-display text-sm text-theme">
                  Remote control enabled
                </p>
                <p className="mt-2 text-theme-muted text-xs">
                  Create a new one-time pairing to connect another device.
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <controlFetcher.Form
            action="/remote-control"
            method="post"
            className="flex-1"
          >
            <input type="hidden" name="intent" value="enable" />
            <input type="hidden" name="roomId" value={machineRoomId} />
            <Button
              type="submit"
              className="w-full gap-3 whitespace-nowrap"
              variant="secondary"
              disabled={controlFetcher.state !== 'idle'}
            >
              <RemoteIcon className="h-5 w-5" />
              {remote.enabled ? 'New Pairing' : 'Enable Remote'}
            </Button>
          </controlFetcher.Form>

          {remote.enabled && (
            <controlFetcher.Form
              action="/remote-control"
              method="post"
              className="flex-1"
            >
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="remoteId" value={remote.id} />
              <Button
                type="submit"
                className="w-full"
                variant="destructive"
                disabled={controlFetcher.state !== 'idle'}
              >
                Disable
              </Button>
            </controlFetcher.Form>
          )}
        </div>
        <div className="mt-3 border-theme border-t pt-3">
          <Button
            type="button"
            className="w-full gap-3"
            onClick={() => {
              setIsOpen(false);
              navigate('/remotes');
            }}
            variant="tertiary"
          >
            <RemoteIcon className="h-5 w-5" />
            Connect as a Remote
          </Button>
        </div>
      </Modal>
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
  const { openRemoteControl } = useRemoteControl();
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
      <Button
        type="button"
        onClick={openRemoteControl}
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

const remoteHeartbeatIntervalMs = 2_000;

const remotePairingStatusIntervalMs = 1_500;

const platformLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
