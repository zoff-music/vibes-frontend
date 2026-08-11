import Slider from '@react-native-community/slider';
import {
  formatPlaybackMilliseconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

interface PlaybackProgressProps {
  duration: number;
  onSeek?: (position: number) => void;
  position: number;
  seekable?: boolean;
}

export function PlaybackProgress({
  duration,
  onSeek,
  position,
  seekable = false,
}: PlaybackProgressProps) {
  const theme = useAppTheme();
  const durationMs = duration * 1_000;
  const { boundedPositionMs, progress } = getPlaybackPresentation(
    position,
    durationMs,
  );

  return (
    <View className="gap-1">
      <Text className="font-heading text-mobile-muted text-xs tracking-widest dark:text-mobile-dark-muted">
        PLAYBACK POSITION
      </Text>
      {seekable && durationMs > 0 && (
        <Slider
          accessibilityLabel="Playback position"
          maximumTrackTintColor={theme.surface}
          maximumValue={durationMs}
          minimumTrackTintColor={theme.accent}
          minimumValue={0}
          onSlidingComplete={onSeek}
          tapToSeek
          thumbTintColor={theme.accent}
          value={boundedPositionMs}
        />
      )}
      {(!seekable || durationMs === 0) && (
        <View
          accessibilityLabel="Playback position"
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: durationMs,
            min: 0,
            now: boundedPositionMs,
          }}
          className="my-3 h-1.5 overflow-hidden rounded-full bg-mobile-surface dark:bg-mobile-dark-surface"
        >
          <View
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      )}
      <View className="flex-row justify-between">
        <Text className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatPlaybackMilliseconds(boundedPositionMs)}
        </Text>
        <Text className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatPlaybackMilliseconds(durationMs)}
        </Text>
      </View>
    </View>
  );
}
