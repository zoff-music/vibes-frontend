import type { Song } from '@vibes/models';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Copy } from '@/components/native';

function getProviderUrl(song: Song) {
  if (song.sourceType === 'youtube') {
    return `https://www.youtube.com/embed/${encodeURIComponent(song.sourceId)}?playsinline=1&controls=1&rel=0`;
  }
  if (song.sourceType === 'spotify') {
    return `https://open.spotify.com/embed/track/${encodeURIComponent(song.sourceId)}`;
  }
  const sourceUrl =
    song.providerUrl ?? `https://soundcloud.com/${song.sourceId}`;
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(sourceUrl)}&auto_play=false`;
}

export function ProviderPlayer({ song }: { song: Song | null }) {
  if (!song) {
    return (
      <View className="aspect-video w-full items-center justify-center overflow-hidden rounded-3xl bg-black">
        <Copy muted>Add a song to start listening.</Copy>
      </View>
    );
  }

  return (
    <View className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
      <WebView
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        source={{ uri: getProviderUrl(song) }}
        className="flex-1 bg-black"
      />
    </View>
  );
}
