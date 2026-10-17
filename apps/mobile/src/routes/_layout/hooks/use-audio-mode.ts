import { safeWrapAsync } from '@vibes/shared';
import { setAudioModeAsync } from 'expo-audio';
import { useEffect } from 'react';

export function useAudioMode() {
  useEffect(() => {
    const configureAudio = async () => {
      const [error] = await safeWrapAsync(
        setAudioModeAsync({
          interruptionMode: 'doNotMix',
          playsInSilentMode: true,
        }),
      );

      if (error) return;
    };

    void configureAudio();
  }, []);
}
