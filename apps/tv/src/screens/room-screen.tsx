import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { FocusButton } from '@/components/focus-button';
import { ProviderSurface } from '@/components/provider-surface';
import { TvIcon } from '@/components/tv-icon';
import type { useTvSession } from '@/hooks/use-tv-session';

interface RoomScreenProps {
  session: ReturnType<typeof useTvSession>;
}

export function RoomScreen({ session }: RoomScreenProps) {
  const currentSong = session.playback.currentSong;
  const queuedSongs = currentSong
    ? session.songs.filter((song) => song.id !== currentSong.id)
    : session.songs;
  const joinUrl = `https://zoff.me/${encodeURIComponent(session.roomId)}`;
  let currentThumbnail = (
    <View className="h-24 w-24 rounded-2xl bg-tv-surface" />
  );
  if (currentSong?.thumbnailUrl) {
    currentThumbnail = (
      <Image
        className="h-24 w-24 rounded-2xl"
        contentFit="cover"
        source={{ uri: currentSong.thumbnailUrl }}
      />
    );
  }

  return (
    <View className="flex-1 flex-row gap-8 p-8">
      <View className="min-w-0 flex-[1.65] gap-5">
        <View className="flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1">
            <Text className="font-heading text-accent text-xl">
              NOW PLAYING
            </Text>
            <Text
              className="font-heading text-4xl text-tv-text"
              numberOfLines={1}
            >
              {currentSong?.title ?? 'Waiting for music'}
            </Text>
          </View>
          <FocusButton onPress={session.leaveRoom}>
            <TvIcon color="#e8dff5" name="back" size={28} />
            <Text className="font-heading text-tv-text text-xl">Leave</Text>
          </FocusButton>
        </View>
        <View className="min-h-0 flex-1 rounded-[2rem] border-2 border-tv-border bg-black p-1">
          <ProviderSurface
            isPlaying={session.playback.isPlaying}
            song={currentSong}
          />
        </View>
        <View className="flex-row items-center gap-5 rounded-3xl border-2 border-tv-border bg-tv-card px-7 py-5">
          {currentThumbnail}
          <View className="min-w-0 flex-1 gap-1">
            <Text
              className="font-heading text-3xl text-tv-text"
              numberOfLines={1}
            >
              {currentSong?.title ?? 'Add songs to play'}
            </Text>
            <Text className="font-heading text-tv-muted text-xl">
              {currentSong?.artist ?? session.room?.name}
            </Text>
          </View>
          <Text className="font-heading text-tv-muted text-xl">
            {currentSong?.sourceType ?? ''}
          </Text>
        </View>
      </View>

      <View className="min-w-0 flex-1 gap-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-heading text-4xl text-tv-text">
              Up next ({queuedSongs.length})
            </Text>
            <Text className="font-heading text-tv-muted text-xl">
              {session.listenerCount || session.room?.userCount || 0} listening
            </Text>
          </View>
        </View>
        <View className="min-h-0 flex-1 gap-3 overflow-hidden rounded-[2rem] border-2 border-tv-border bg-tv-card p-5">
          {queuedSongs.slice(0, visibleQueueLength).map((song, index) => (
            <View
              className="flex-row items-center gap-4 rounded-2xl border border-tv-border bg-tv-surface px-5 py-4"
              key={song.id}
            >
              <Text className="w-8 font-heading text-tv-muted text-xl">
                {index + 1}
              </Text>
              <Image
                className="h-16 w-16 rounded-xl"
                contentFit="cover"
                source={{ uri: song.thumbnailUrl }}
              />
              <View className="min-w-0 flex-1">
                <Text
                  className="font-heading text-tv-text text-xl"
                  numberOfLines={1}
                >
                  {song.title}
                </Text>
                <Text
                  className="font-heading text-lg text-tv-muted"
                  numberOfLines={1}
                >
                  {song.artist ?? song.sourceType} · {song.voteCount ?? 0} votes
                </Text>
              </View>
            </View>
          ))}
          {queuedSongs.length === 0 && (
            <View className="flex-1 items-center justify-center">
              <Text className="font-heading text-2xl text-tv-muted">
                The queue is ready for your picks.
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-5 rounded-[2rem] border-2 border-primary/60 bg-tv-card p-5">
          <View className="rounded-2xl bg-white p-3">
            <QRCode
              backgroundColor="#ffffff"
              color="#120b1e"
              ecl="H"
              logo={require('../../assets/icon.png')}
              logoBackgroundColor="#120b1e"
              logoBorderRadius={10}
              logoMargin={4}
              logoSize={32}
              size={150}
              value={joinUrl}
            />
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="font-heading text-accent text-xl">
              SCAN TO JOIN
            </Text>
            <Text
              className="font-heading text-4xl text-tv-text"
              numberOfLines={1}
            >
              {session.room?.name}
            </Text>
            <Text className="font-heading text-lg text-tv-muted">
              Add songs and vote from your phone
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const visibleQueueLength = 5;
