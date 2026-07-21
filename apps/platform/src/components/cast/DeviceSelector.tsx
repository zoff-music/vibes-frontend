import type { CastDevice, Song } from '@vibes/models';
import { safeWrapAsync, usePlaybackStore } from '@vibes/shared';
import { Button } from '@vibes/ui';
import React, { useEffect, useState } from 'react';
import { castManager } from '../../services/cast';
import { useCastStore } from '../../stores/castStore';
import { CastDeviceIcon } from '../icons/CastDeviceIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { InfoCircleIcon } from '../icons/InfoCircleIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';

interface DeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    availableDevices,
    currentSession,
    isConnected,
    connectToDevice,
    disconnectFromDevice,
    discoverDevices,
    castCurrentSong,
  } = useCastStore();

  const currentSong = usePlaybackStore((state) => state.currentSong);

  const isDev = import.meta.env.VITE_DEVELOPMENT_MODE === 'true';

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const refreshOnOpen = async () => {
      console.log('[Cast] refreshing devices on open');
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
  }, [isOpen, discoverDevices]);

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

    if (!err && currentSong) {
      const [castErr] = await safeWrapAsync(castCurrentSong(currentSong));
      if (castErr) {
        console.error('Failed to auto-cast current song:', castErr);
      }
    }

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

  const handleCastCurrentSong = async (media?: Song) => {
    const songToCast = media || currentSong;
    if (!songToCast || !isConnected) return;

    setIsCasting(true);
    const [err] = await safeWrapAsync(castCurrentSong(songToCast));

    if (err) {
      console.error('Failed to cast:', err);
      if (err.message.includes('YouTube')) {
        console.log(
          '💡 YouTube casting requires a custom receiver - this is a known limitation',
        );
      }
    } else {
      console.log('✅ Successfully cast');
    }

    setIsCasting(false);
  };

  const handleRefresh = async () => {
    console.log('🔄 Refreshing devices...');
    const { castManager } = await import('../../services/cast');

    console.log('Cast Debug Info:', castManager.getDebugInfo());
    await safeWrapAsync(castManager.forceDiscovery());
    await safeWrapAsync(discoverDevices());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Button
        type="button"
        aria-label="Close cast device selector"
        variant="ghost"
        size="none"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={onClose}
      />
      <div className="relative mx-4 w-80 max-w-sm rounded-lg border-2 border-gray-200 bg-white p-6 shadow-xl transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg dark:text-white">
            Cast to Device
          </h3>
          <Button onClick={onClose} variant="ghost">
            <CloseIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Current connection */}
        {isConnected && currentSession && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 transition-colors duration-200 dark:border-primary/30 dark:bg-primary/20">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-primary dark:text-primary-light">
                  Connected
                </div>
                <div className="text-primary/80 text-sm dark:text-primary-light/80">
                  {currentSession.deviceName}
                </div>
              </div>
              <Button onClick={handleDisconnect} variant="primary">
                Disconnect
              </Button>
            </div>

            {/* Cast Current Song Button */}
            {isDev && currentSong && (
              <div className="border-primary/20 border-t pt-3 dark:border-primary/30">
                <Button
                  onClick={() => handleCastCurrentSong()}
                  disabled={isCasting}
                  variant="primary"
                  className="w-full gap-2"
                >
                  {isCasting ? (
                    <>
                      <SpinnerIcon className="h-4 w-4 animate-spin" />
                      <span>Casting...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      <span>Cast Current Song</span>
                    </>
                  )}
                </Button>
                <div className="mt-1 text-center text-primary/70 text-xs dark:text-primary-light/70">
                  {currentSong.title}
                </div>

                {/* YouTube Limitation Notice */}
                {currentSong.sourceType === 'youtube' && (
                  <div className="mt-2 rounded border border-blue-300 bg-blue-100 p-3 text-blue-800 text-xs transition-colors duration-200 dark:border-blue-700/30 dark:bg-blue-900/20 dark:text-blue-400">
                    <div className="flex items-start gap-2">
                      <InfoCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
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
                            className="text-blue-600 underline hover:no-underline dark:text-blue-400"
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
                    const testMedia: Song = {
                      id: 'test-song',
                      sourceType: 'youtube',
                      sourceId: 'dQw4w9WgXcQ',
                      title: 'Test Video - YouTube',
                      artist: 'YouTube',
                      thumbnailUrl:
                        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                      duration: 213,
                      addedBy: 'test',
                      addedAt: new Date().toISOString(),
                    };
                    handleCastCurrentSong(testMedia);
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
              <h4 className="font-medium text-gray-900 dark:text-white">
                Available Devices
              </h4>
              <Button onClick={handleRefresh} variant="ghost">
                Refresh
              </Button>
            </div>

            {availableDevices.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <CastDeviceIcon className="mx-auto mb-2 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <div className="font-medium text-gray-500 dark:text-gray-400">
                  No Chromecast devices found
                </div>
                <div className="mt-2 space-y-1 text-gray-400 text-xs dark:text-gray-500">
                  <div>Make sure your Chromecast is:</div>
                  <div>• On the same Wi-Fi network</div>
                  <div>• Powered on and ready</div>
                  <div>• Not being used by another app</div>
                </div>
                <div className="mt-3 text-gray-400 text-xs dark:text-gray-500">
                  Check browser console for debug info
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {availableDevices.map((device) => (
                  <Button
                    key={device.id}
                    onClick={() => handleDeviceSelect(device)}
                    variant="tertiary"
                    size="none"
                    className="w-full justify-start p-3 text-left"
                    disabled={
                      isConnecting === device.id ||
                      (isConnected && currentSession?.deviceId === device.id)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="shrink-0">
                        {device.type === 'chromecast' ? (
                          <CastDeviceIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        ) : (
                          <CheckCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </div>
                        <div className="text-gray-500 text-sm capitalize dark:text-gray-400">
                          {device.type}
                        </div>
                      </div>
                      {isConnecting === device.id && (
                        <div className="shrink-0">
                          <SpinnerIcon className="h-4 w-4 animate-spin text-primary dark:text-primary-light" />
                        </div>
                      )}
                      {isConnected &&
                        currentSession?.deviceId === device.id && (
                          <div className="shrink-0">
                            <CheckIcon className="h-4 w-4 text-primary dark:text-primary-light" />
                          </div>
                        )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-gray-500 text-xs transition-colors duration-200 dark:text-gray-400">
          Make sure your device supports Google Cast and is connected to the
          same Wi-Fi network.
        </div>
      </div>
    </div>
  );
};
