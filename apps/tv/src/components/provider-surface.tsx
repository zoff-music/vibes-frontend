import type { Song } from '@vibes/models';
import { NativeYouTubePlayer } from '@vibes/ui/native';
import { Image } from 'expo-image';
import { Text, useWindowDimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface ProviderSurfaceProps {
  isPlaying: boolean;
  playbackKey: string;
  positionMs: number;
  song: Song | null;
}

export function ProviderSurface({
  isPlaying,
  playbackKey,
  positionMs,
  song,
}: ProviderSurfaceProps) {
  const { height, width } = useWindowDimensions();
  if (!song) {
    return (
      <View className="h-full items-center justify-center rounded-[2rem] bg-black">
        <Text className="font-heading text-4xl text-tv-muted">
          No song is playing
        </Text>
      </View>
    );
  }

  if (song.sourceType === 'youtube') {
    return (
      <View className="h-full overflow-hidden rounded-[2rem] bg-black">
        <NativeYouTubePlayer
          height={Math.max(360, height * 0.62)}
          isPlaying={isPlaying}
          key={song.sourceId}
          positionMs={positionMs}
          resetVersion={playbackKey}
          sourceId={song.sourceId}
          synchronizePosition={false}
          width={Math.max(640, width * 0.61)}
        />
      </View>
    );
  }

  if (song.sourceType === 'soundcloud' && song.providerUrl) {
    const uri = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.providerUrl)}&auto_play=${String(isPlaying)}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
    return (
      <View className="h-full overflow-hidden rounded-[2rem] bg-black">
        <WebView
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          source={{ uri }}
        />
      </View>
    );
  }

  if (song.sourceType === 'spotify') {
    const uri = `https://open.spotify.com/embed/track/${encodeURIComponent(song.sourceId)}?utm_source=zoff`;
    return (
      <View className="h-full overflow-hidden rounded-[2rem] bg-black">
        <WebView
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          source={{ uri }}
        />
      </View>
    );
  }

  return (
    <View className="h-full overflow-hidden rounded-[2rem] bg-black">
      <Image
        className="absolute inset-0 h-full w-full opacity-45"
        contentFit="cover"
        source={{ uri: song.thumbnailUrl }}
      />
      <View className="absolute inset-0 items-center justify-center bg-black/45">
        <Image
          className="h-72 w-72 rounded-3xl"
          contentFit="cover"
          source={{ uri: song.thumbnailUrl }}
        />
      </View>
    </View>
  );
}
