import { safeWrapAsync } from '@vibes/shared';
import { Button } from '@vibes/ui';
import React, { useEffect } from 'react';
import { useCastStore } from '../../stores/castStore';
import { CastIcon } from '../icons/CastIcon';

interface CastButtonProps {
  onDeviceSelect?: () => void;
}

export const CastButton: React.FC<CastButtonProps> = ({ onDeviceSelect }) => {
  const {
    isInitialized,
    availableDevices,
    isConnected,
    currentSession,
    initialize,
    discoverDevices,
    connectToDevice,
    disconnectFromDevice,
    lastError,
    clearError,
  } = useCastStore();

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
      return <CastIcon className={iconClasses} isActive={true} />;
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
        <span className="font-medium text-sm transition-colors duration-200">
          {getButtonText()}
        </span>
      </Button>

      {/* Error Display */}
      {lastError && (
        <div className="mt-2 rounded border border-red-300 bg-red-100 p-2 text-red-700 text-xs transition-colors duration-200 dark:border-red-700/30 dark:bg-red-900/20 dark:text-red-400">
          {lastError.description}
        </div>
      )}

      {/* Connection Status */}
      {isConnected && currentSession && (
        <div className="mt-1 text-center text-primary text-xs transition-colors duration-200 dark:text-primary-light">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary dark:bg-primary-light"></div>
            <span>Casting to {currentSession.deviceName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
