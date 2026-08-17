import { useRoomEvents } from '@vibes/api';
import type {
  PlaybackState,
  Room,
  RoomGenerationUpdate,
  Song,
} from '@vibes/models';
import { synchronizeServerClock } from '@vibes/shared';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useRevalidator, useSubmit } from 'react-router';
import { tizenApi } from '@/tizen/api';
import type { TizenSessionLoaderData } from '@/tizen/routes/session/loader';
import { TizenLanding } from '@/tizen/tizen-landing';
import { TizenRoom } from '@/tizen/tizen-room';
import { useSpatialNavigation } from '@/tizen/use-spatial-navigation';

interface TizenAppProps {
  actionError: string;
  loaderData: TizenSessionLoaderData;
  loading: boolean;
}

export function TizenApp({ actionError, loaderData, loading }: TizenAppProps) {
  useSpatialNavigation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const [isAIMode, setIsAIMode] = useState(false);
  const [room, setRoom] = useState<Room | null>(
    loaderData.snapshot?.room ?? null,
  );
  const [songs, setSongs] = useState<Song[]>(loaderData.snapshot?.songs ?? []);
  const [playback, setPlayback] = useState<PlaybackState>(
    loaderData.snapshot?.playback ?? emptyPlaybackState,
  );
  const [listenerCount, setListenerCount] = useState(
    loaderData.snapshot?.room.userCount ?? 0,
  );
  const callbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onGenerationUpdate: (update: RoomGenerationUpdate) => {
        setRoom((current) => {
          if (!current) return null;
          return {
            ...current,
            generationError:
              update.status === 'failed'
                ? (update.error ??
                  'Playlist generation could not be completed.')
                : undefined,
            isGenerating: update.status === 'generating',
          };
        });
      },
      onHostUpdate: ({ userId }: { userId: string }) => {
        setRoom((current) => (current ? { ...current, hostId: userId } : null));
      },
      onPlaybackUpdate: (nextPlayback: PlaybackState) => {
        synchronizeServerClock(nextPlayback.serverTimeMs);
        setPlayback(nextPlayback);
      },
      onReconnect: revalidator.revalidate,
      onRoomUpdate: setRoom,
      onSongAdded: (song: Song) => {
        setSongs((current) => {
          if (current.some((item) => item.id === song.id)) return current;
          return [...current, song];
        });
      },
      onSongsUpdate: setSongs,
      onUsersUpdate: setListenerCount,
    }),
    [revalidator.revalidate],
  );
  useRoomEvents(loaderData.roomId || undefined, callbacks, tizenApi);

  const submitRoomAction = useCallback(
    (intent: 'generate' | 'joinOrCreate', value: string) => {
      submit({ intent, value }, { method: 'post' });
    },
    [submit],
  );
  const leaveRoom = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  let screen = (
    <TizenLanding
      error={actionError || loaderData.error}
      isAIMode={isAIMode}
      loading={loading}
      onGenerateRoom={(value) => submitRoomAction('generate', value)}
      onJoinOrCreateRoom={(value) => submitRoomAction('joinOrCreate', value)}
      onToggleAIMode={() => setIsAIMode((current) => !current)}
      publicRooms={loaderData.publicRooms}
    />
  );
  if (room && loaderData.roomId) {
    screen = (
      <TizenRoom
        listenerCount={listenerCount}
        onLeave={leaveRoom}
        playback={playback}
        room={room}
        roomId={loaderData.roomId}
        songs={songs}
      />
    );
  }
  return (
    <main className="relative h-full overflow-hidden bg-tv-background font-heading text-tv-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_100%,rgba(255,46,151,0.14),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(0,217,255,0.08),transparent_30%)]" />
      {screen}
    </main>
  );
}

const emptyPlaybackState: PlaybackState = {
  currentSong: null,
  isPlaying: false,
  positionMs: 0,
  serverTimeMs: 0,
  updatedAt: '',
};
