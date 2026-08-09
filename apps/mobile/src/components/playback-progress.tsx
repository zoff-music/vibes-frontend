import { Text, View } from 'react-native';

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1_000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function PlaybackProgress({
  duration,
  position,
}: {
  duration: number;
  position: number;
}) {
  const durationMs = duration * 1_000;
  const progress =
    durationMs > 0 ? Math.min(1, Math.max(0, position / durationMs)) : 0;
  return (
    <View className="gap-2">
      <View className="h-1 overflow-hidden rounded-full bg-mobile-surface dark:bg-mobile-dark-surface">
        <View
          className="h-1 rounded-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatTime(position)}
        </Text>
        <Text className="font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted">
          {formatTime(durationMs)}
        </Text>
      </View>
    </View>
  );
}
