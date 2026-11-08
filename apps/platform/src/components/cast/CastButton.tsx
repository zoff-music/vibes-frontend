import { safeWrapAsync } from '@vibes/shared';
import { Button, CastIcon } from '@vibes/ui/web';
import React, { useEffect } from 'preact/compat';
import { useCastStore } from '../../stores/castStore';

interface CastButtonProps {
  onDeviceSelect?: () => void;
}

export const CastButton: React.FC<CastButtonProps> = ({ onDeviceSelect }) => {
  const isInitialized = useCastStore((state) => state.isInitialized);
  const availableDevices = useCastStore((state) => state.availableDevices);
  const isConnected = useCastStore((state) => state.isConnected);
  const currentSession = useCastStore((state) => state.currentSession);
  const initialize = useCastStore((state) => state.initialize);
  const discoverDevices = useCastStore((state) => state.discoverDevices);
  const connectToDevice = useCastStore((state) => state.connectToDevice);
  const disconnectFromDevice = useCastStore(
    (state) => state.disconnectFromDevice,
  );
  const lastError = useCastStore((state) => state.lastError);
  const clearError = useCastStore((state) => state.clearError);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleCastClick = async () => {
    if (lastError) clearError();

    if (isConnected && currentSession) {
      if (onDeviceSelect) {
        onDeviceSelect();
      } else {
        const [err] = await safeWrapAsync(
          disconnectFromDevice(currentSession.deviceId),
        );

        if (err) console.error('Failed to disconnect:', err);
      }

      return;
    }

    if (availableDevices.length > 0) {
      if (onDeviceSelect) {
        onDeviceSelect();
      } else {
        const [err] = await safeWrapAsync(
          connectToDevice(availableDevices[0].id),
        );

        if (err) console.error('Failed to connect:', err);
      }

      return;
    }

    const [err] = await safeWrapAsync(discoverDevices());

    if (err) console.error('Cast discovery error:', err);
  };

  const getCastIcon = () => {
    const iconClasses = isConnected
      ? 'w-6 h-6 text-white'
      : 'w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-200';

    if (isConnected) {
      return <CastIcon className={iconClasses} showDot />;
    }

    return <CastIcon className={iconClasses} />;
  };

  const getButtonText = () => {
    if (isConnected && currentSession) {
      return `Connected`;
    }

    if (availableDevices.length > 0) {
      return 'Cast';
    }

    return 'No devices';
  };

  const isDisabled =
    !isInitialized || (availableDevices.length === 0 && !isConnected);

  if (!isConnected && availableDevices.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleCastClick}
        disabled={isDisabled}
        variant={isConnected ? 'primary' : 'tertiary'}
        aria-label={
          isConnected
            ? `Connected to ${currentSession?.deviceName}`
            : 'Cast to device'
        }
      >
        {getCastIcon()}
        <span className="text-sm font-medium transition-colors duration-200">
          {getButtonText()}
        </span>
      </Button>

      {/* Error Display */}
      {lastError && (
        <div className="mt-2 rounded border border-red-300 bg-red-100 p-2 text-xs text-red-700 transition-colors duration-200 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400">
          {lastError.description}
        </div>
      )}

      {/* Connection Status */}
      {isConnected && currentSession && (
        <div className="text-primary dark:text-primary-light mt-1 text-center text-xs transition-colors duration-200">
          <div className="flex items-center gap-1">
            <div className="bg-primary dark:bg-primary-light h-2 w-2 animate-pulse rounded-full"></div>
            <span>Casting to {currentSession.deviceName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
