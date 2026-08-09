import Slider from '@react-native-community/slider';
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
  const boundedPosition = Math.min(Math.max(position, 0), durationMs);

  return (
    <View className="gap-1">
      <Text className="font-mono text-mobile-muted text-xs tracking-widest dark:text-mobile-dark-muted">
        PLAYBACK POSITION
      </Text>
      <Slider
        accessibilityLabel="Playback position"
        disabled={!seekable || durationMs === 0}
        maximumTrackTintColor={theme.surface}
        maximumValue={durationMs}
        minimumTrackTintColor={theme.accent}
        minimumValue={0}
        onSlidingComplete={onSeek}
        tapToSeek={seekable}
        thumbTintColor={seekable ? theme.accent : 'transparent'}
        value={boundedPosition}
      />
      <View className="flex-row justify-between">
        <Text className="font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatTime(boundedPosition)}
        </Text>
        <Text className="font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatTime(durationMs)}
        </Text>
      </View>
    </View>
  );
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1_000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
