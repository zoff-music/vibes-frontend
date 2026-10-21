import type { CastDevice, PlaylistItem } from '@vibes/models';
import {
  browserDebugLog,
  safeWrapAsync,
  usePlaybackStore,
} from '@vibes/shared';
import {
  Button,
  CastIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  IconButton,
  InfoIcon,
  Modal,
  PlayIcon,
  SpinnerIcon,
} from '@vibes/ui/web';
import React, { useEffect, useState } from 'preact/compat';
import { castManager } from '../../services/cast';
import { CAST_DEVICE_PICKER_ID } from '../../services/cast/constants';
import { useCastStore } from '../../stores/castStore';

interface DeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const isInitialized = useCastStore((state) => state.isInitialized);
  const availableDevices = useCastStore((state) => state.availableDevices);
  const currentSession = useCastStore((state) => state.currentSession);
  const isConnected = useCastStore((state) => state.isConnected);
  const initialize = useCastStore((state) => state.initialize);
  const connectToDevice = useCastStore((state) => state.connectToDevice);
  const disconnectFromDevice = useCastStore(
    (state) => state.disconnectFromDevice,
  );
  const discoverDevices = useCastStore((state) => state.discoverDevices);
  const castCurrentPlaylistItem = useCastStore(
    (state) => state.castCurrentPlaylistItem,
  );

  const currentPlaylistItem = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );

  const isDev = import.meta.env.VITE_DEVELOPMENT_MODE === 'true';

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const refreshOnOpen = async () => {
      browserDebugLog('[Cast] refreshing devices on open');

      if (!isInitialized) {
        const [initializeErr] = await safeWrapAsync(initialize());

        if (initializeErr) {
          console.error('Failed to initialize casting:', initializeErr);
        }

        return;
      }

      const [forceErr] = await safeWrapAsync(castManager.forceDiscovery());

      if (forceErr) {
        console.error('Failed to force cast discovery:', forceErr);
      }

      const [discoverErr] = await safeWrapAsync(discoverDevices());

      if (discoverErr) {
        console.error('Failed to discover cast devices:', discoverErr);
      }
    };

    refreshOnOpen();
  }, [isOpen, isInitialized, initialize, discoverDevices]);

  const handleDeviceSelect = async (device: CastDevice) => {
    setIsConnecting(device.id);

    if (device.id === 'local-cast-emulator') {
      const opened = castManager.prepareLocalReceiverWindow();

      if (!opened) {
        setIsConnecting(null);

        return;
      }
    }

    if (isConnected && currentSession) {
      await safeWrapAsync(disconnectFromDevice(currentSession.deviceId));
    }

    const [err] = await safeWrapAsync(connectToDevice(device.id));

    if (err) console.error('Failed to connect to device:', err);

    setIsConnecting(null);
  };

  const handleDisconnect = async () => {
    if (!currentSession) return;

    const [err] = await safeWrapAsync(
      disconnectFromDevice(currentSession.deviceId),
    );

    if (err) {
      console.error('Failed to disconnect:', err);

      return;
    }

    onClose();
  };

  const handleCastCurrentPlaylistItem = async (media?: PlaylistItem) => {
    const playlistItemToCast = media || currentPlaylistItem;

    if (!playlistItemToCast || !isConnected) return;

    setIsCasting(true);
    const [err] = await safeWrapAsync(
      castCurrentPlaylistItem(playlistItemToCast),
    );

    if (err) {
      console.error('Failed to cast:', err);

      if (err.message.includes('YouTube')) {
        browserDebugLog(
          '💡 YouTube casting requires a custom receiver - this is a known limitation',
        );
      }
    } else {
      browserDebugLog('✅ Successfully cast');
    }

    setIsCasting(false);
  };

  const handleRefresh = async () => {
    browserDebugLog('🔄 Refreshing devices...');
    browserDebugLog('Cast Debug Info:', castManager.getDebugInfo());
    await safeWrapAsync(castManager.forceDiscovery());
    await safeWrapAsync(discoverDevices());
  };

  const handleOpenDevicePicker = async () => {
    setIsConnecting(CAST_DEVICE_PICKER_ID);
    const [err] = await safeWrapAsync(connectToDevice(CAST_DEVICE_PICKER_ID));

    if (err) {
      console.error('Failed to open cast device picker:', err);
    }

    setIsConnecting(null);
  };

  return (
    <Modal
      ariaLabelledBy="cast-device-selector-title"
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 id="cast-device-selector-title" className="text-base text-theme">
          Cast to device
        </h3>
        <IconButton
          onClick={onClose}
          variant="ghost"
          aria-label="Close cast device selector"
        >
          <CloseIcon className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Current connection */}
      {isConnected && currentSession && (
        <div className="mb-4 rounded-2xl border border-theme bg-theme-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-secondary text-sm">Connected</div>
              <div className="text-sm text-theme-muted">
                {currentSession.deviceName}
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="primary">
              Disconnect
            </Button>
          </div>

          {/* Cast Current Song Button */}
          {isDev && currentPlaylistItem && (
            <div className="border-theme border-t pt-4">
              <Button
                onClick={() => handleCastCurrentPlaylistItem()}
                disabled={isCasting}
                variant="primary"
                className="w-full gap-2"
              >
                {isCasting && (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    <span>Casting...</span>
                  </>
                )}
                {!isCasting && (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span>Cast Current Song</span>
                  </>
                )}
              </Button>
              <div className="mt-2 text-center text-theme-muted text-xs">
                {currentPlaylistItem.title}
              </div>

              {/* YouTube Limitation Notice */}
              {currentPlaylistItem.sourceType === 'youtube' && (
                <div className="mt-3 rounded-2xl border border-theme bg-theme p-4 text-theme-muted text-xs">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-medium">Custom Receiver Ready</div>
                      <div className="mt-1">
                        YouTube content requires our custom receiver. Click
                        "Cast Current Song" to see the demo.
                      </div>
                      <div className="mt-2">
                        <a
                          href={`/casting/receiver/${isDev ? '?debug=true' : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary underline hover:no-underline"
                        >
                          View Custom Receiver →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Cast Button for Demo */}
              <Button
                onClick={() => {
                  const testMedia: PlaylistItem = {
                    id: 'test-song',
                    sourceType: 'youtube',
                    sourceId: 'dQw4w9WgXcQ',
                    title: 'Test Video - YouTube',
                    publisher: 'YouTube',
                    thumbnailUrl:
                      'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                    duration: 213,
                    addedBy: 'test',
                    addedAt: new Date().toISOString(),
                  };
                  handleCastCurrentPlaylistItem(testMedia);
                }}
                variant="secondary"
                className="mt-2 w-full gap-2 text-xs"
              >
                <PlayIcon className="h-3 w-3" />
                <span>Test Cast (Demo Video)</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Available devices - Only show when NOT connected */}
      {!isConnected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm text-theme">Available devices</h4>
            <Button onClick={handleRefresh} variant="ghost">
              Refresh
            </Button>
          </div>

          {availableDevices.length === 0 && (
            <div className="py-8 text-center text-theme-muted">
              <CastIcon className="mx-auto mb-2 h-12 w-12 text-theme-subtle" />
              <div className="font-medium text-theme-muted">
                No Chromecast devices found
              </div>
              <div className="mt-2 space-y-1 text-theme-muted text-xs">
                <div>Make sure your Chromecast is:</div>
                <div>• On the same Wi-Fi network</div>
                <div>• Powered on and ready</div>
                <div>• Not being used by another app</div>
              </div>
              <div className="mt-3 text-theme-muted text-xs">
                Chrome may still find devices while opening its device picker.
              </div>
              <Button
                className="mt-4 w-full"
                disabled={isConnecting === CAST_DEVICE_PICKER_ID}
                onClick={handleOpenDevicePicker}
                variant="secondary"
              >
                {isConnecting === CAST_DEVICE_PICKER_ID
                  ? 'Searching...'
                  : 'Open device picker'}
              </Button>
            </div>
          )}
          {availableDevices.length > 0 && (
            <div className="space-y-2">
              {availableDevices.map((device) => (
                <Button
                  key={device.id}
                  onClick={() => handleDeviceSelect(device)}
                  variant="tertiary"
                  size="large"
                  contentAlignment="between"
                  className="w-full"
                  disabled={
                    isConnecting === device.id ||
                    (isConnected && currentSession?.deviceId === device.id)
                  }
                >
                  <div className="flex w-full min-w-0 items-center gap-3">
                    <div className="shrink-0">
                      {device.type === 'chromecast' && (
                        <CastIcon className="h-6 w-6 text-theme-muted" />
                      )}
                      {device.type !== 'chromecast' && (
                        <CheckCircleIcon className="h-6 w-6 text-theme-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="break-words">{device.name}</div>
                      <div className="mt-1 font-pixel text-theme-muted text-xs capitalize tracking-normal">
                        {device.type}
                      </div>
                    </div>
                    {isConnecting === device.id && (
                      <div className="shrink-0">
                        <SpinnerIcon className="h-4 w-4 animate-spin text-secondary" />
                      </div>
                    )}
                    {isConnected && currentSession?.deviceId === device.id && (
                      <div className="shrink-0">
                        <CheckIcon className="h-4 w-4 text-secondary" />
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 text-center text-theme-muted text-xs">
        Make sure your device supports Google Cast and is connected to the same
        Wi-Fi network.
      </div>
    </Modal>
  );
};
