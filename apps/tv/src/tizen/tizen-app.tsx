import {
  getRoomAnalyticsPath,
  plausibleClient,
  useRoomEventsV3,
} from '@vibes/api';
import type {
  PlaybackStateV2,
  PlaylistItem,
  RoomGenerationUpdate,
  RoomV2,
} from '@vibes/models';
import { synchronizeServerClock } from '@vibes/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useRevalidator, useSubmit } from 'react-router';
import { tizenApiV3 } from '@/tizen/api';
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
  const [room, setRoom] = useState<RoomV2 | null>(
    loaderData.snapshot?.room ?? null,
  );
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>(
    loaderData.snapshot?.playlistItems ?? [],
  );
  const [playback, setPlayback] = useState<PlaybackStateV2>(
    loaderData.snapshot?.playback ?? emptyPlaybackState,
  );
  const [listenerCount, setListenerCount] = useState(
    loaderData.snapshot?.room.userCount ?? 0,
  );
  useEffect(() => {
    const path = loaderData.roomId
      ? getRoomAnalyticsPath(loaderData.roomId)
      : '/tv';
    void plausibleClient.trackPageview({ path, surface: 'tv' });
  }, [loaderData.roomId]);
  useEffect(() => {
    const snapshot = loaderData.snapshot;
    setRoom(snapshot?.room ?? null);
    setPlaylistItems(snapshot?.playlistItems ?? []);
    setPlayback(snapshot?.playback ?? emptyPlaybackState);
    setListenerCount(snapshot?.room.userCount ?? 0);
  }, [loaderData.snapshot]);
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
      onPlaybackUpdate: (nextPlayback: PlaybackStateV2) => {
        synchronizeServerClock(nextPlayback.serverTimeMs);
        setPlayback(nextPlayback);
      },
      onReconnect: revalidator.revalidate,
      onRoomUpdate: setRoom,
      onPlaylistItemAdded: (playlistItem: PlaylistItem) => {
        setPlaylistItems((current) => {
          if (current.some((item) => item.id === playlistItem.id))
            return current;
          return [...current, playlistItem];
        });
      },
      onPlaylistItemRemoved: ({ id }: { id: string }) => {
        setPlaylistItems((current) =>
          current.filter((playlistItem) => playlistItem.id !== id),
        );
      },
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: {
        playlistItem: PlaylistItem;
        position: number;
      }) => {
        setPlaylistItems((current) => {
          const nextPlaylistItems = current.filter(
            (item) => item.id !== playlistItem.id,
          );
          const boundedPosition = Math.min(
            Math.max(position, 0),
            nextPlaylistItems.length,
          );
          nextPlaylistItems.splice(boundedPosition, 0, playlistItem);
          return nextPlaylistItems;
        });
      },
      onPlaylistItemsUpdate: setPlaylistItems,
      onUsersUpdate: setListenerCount,
    }),
    [revalidator.revalidate],
  );
  useRoomEventsV3(loaderData.roomId || undefined, callbacks, tizenApiV3);

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
        playlistItems={playlistItems}
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

const emptyPlaybackState: PlaybackStateV2 = {
  currentPlaylistItem: null,
  isPlaying: false,
  positionMs: 0,
  serverTimeMs: 0,
  updatedAt: '',
};
