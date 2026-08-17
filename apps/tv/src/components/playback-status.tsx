import {
  formatPlaybackSeconds,
  getPlaybackPresentation,
} from '@vibes/ui/shared';
import { Text, View } from 'react-native';
import { useLivePlaybackPosition } from '@/hooks/use-live-playback-position';

interface PlaybackStatusProps {
  durationSeconds: number;
  hasRoom: boolean;
}

export function PlaybackStatus({
  durationSeconds,
  hasRoom,
}: PlaybackStatusProps) {
  const positionMs = useLivePlaybackPosition(hasRoom);
  const durationMs = durationSeconds * millisecondsPerSecond;
  const { progress } = getPlaybackPresentation(positionMs, durationMs);

  return (
    <>
      <View className="mt-2 flex-row justify-between">
        <Text className="font-heading text-tv-muted text-xs">
          {formatPlaybackSeconds(positionMs / millisecondsPerSecond)}
        </Text>
        <Text className="font-heading text-tv-muted text-xs">
          {formatPlaybackSeconds(durationSeconds)}
        </Text>
      </View>
      <View className="mt-1 h-2 flex-row overflow-hidden rounded-full bg-white/20">
        <View className="bg-accent" style={{ flex: progress }} />
        <View style={{ flex: 1 - progress }} />
      </View>
    </>
  );
}

const millisecondsPerSecond = 1000;
