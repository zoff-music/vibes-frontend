import type { Song } from '@vibes/models';
import { NativeSoundCloudPlayer, NativeYouTubePlayer } from '@vibes/ui/native';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, Text, View } from 'react-native';
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
  const [surfaceSize, setSurfaceSize] = useState(initialSurfaceSize);
  const handleSurfaceLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSurfaceSize((currentSize) => {
      if (currentSize.height === height && currentSize.width === width) {
        return currentSize;
      }
      return { height, width };
    });
  }, []);
  const playerWidth = Math.min(
    surfaceSize.width,
    surfaceSize.height * youtubeAspectRatio,
  );
  const playerHeight = playerWidth / youtubeAspectRatio;
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
      <View
        className="h-full items-center justify-center overflow-hidden rounded-[2rem] bg-black"
        onLayout={handleSurfaceLayout}
      >
        <NativeYouTubePlayer
          height={playerHeight}
          isPlaying={isPlaying}
          key={song.sourceId}
          positionMs={positionMs}
          resetVersion={playbackKey}
          sourceId={song.sourceId}
          synchronizePosition={false}
          width={playerWidth}
        />
      </View>
    );
  }

  if (song.sourceType === 'soundcloud') {
    return (
      <View
        className="h-full items-center justify-center overflow-hidden rounded-[2rem] bg-black"
        onLayout={handleSurfaceLayout}
      >
        <NativeSoundCloudPlayer
          artworkUrl={song.thumbnailUrl}
          height={surfaceSize.height}
          isPlaying={isPlaying}
          key={song.id}
          positionMs={positionMs}
          resetVersion={playbackKey}
          sourceId={song.sourceId}
          synchronizePosition
          width={surfaceSize.width}
          {...(song.providerUrl ? { providerUrl: song.providerUrl } : {})}
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

const youtubeAspectRatio = 16 / 9;
const initialSurfaceSize = { height: 360, width: 640 };
