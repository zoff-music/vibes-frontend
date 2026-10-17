import { Form, Link } from '@kasperrt/smolter/preact';
import { roomNameMaxLength } from '@vibes/models';
import { getRoomLabels } from '@vibes/ui/shared';
import {
  Button,
  CastIcon,
  CloseIcon,
  Input,
  ListenerCount,
  QueueList,
  RemoteIcon,
  SettingsIcon,
  Tooltip,
} from '@vibes/ui/web';
import { RemotePlaybackControls } from '../components/RemotePlaybackControls';
import { RoomSettingsModal } from '../components/RoomSettingsModal';
import { PlaylistItemSearchModal } from '../components/SearchModal';
import { useRemoteController } from '../hooks/useRemoteController';

export function RemoteController() {
  const {
    loaderData,
    actionFetcher,
    roomFetcher,
    roomInput,
    showSearch,
    setShowSearch,
    showSettings,
    setShowSettings,
    remoteStatus,
    room,
    usersCount,
    currentPlaylistItem,
    isMachinePlaylistItemCurrent,
    handleRoomInputChange,
    handleVote,
    handleRemove,
    isPlaying,
    canSeek,
    queuedPlaylistItems,
  } = useRemoteController();

  if (loaderData.error || !loaderData.remote) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <section className="panel-strong w-full max-w-md rounded-4xl p-8 text-center">
          <RemoteIcon className="mx-auto h-12 w-12 text-theme-muted" />
          <h1 className="mt-5 font-display text-theme text-xl">
            Remote unavailable
          </h1>
          <p className="mt-3 text-sm text-theme-muted">{loaderData.error}</p>
          <Link
            to="/remotes/join"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-secondary px-5 py-2.5 text-text-inverse transition-opacity hover:opacity-90"
          >
            Pair another machine
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="panel-strong flex items-center justify-between gap-4 rounded-3xl px-5 py-4">
        <div className="min-w-0">
          <p className="font-pixel text-2xs text-secondary tracking-label">
            Controlling machine
          </p>
          <h1 className="mt-1 truncate font-display text-lg text-theme">
            {room?.name ?? 'No room selected'}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {room && remoteStatus?.currentRoomId === room.id && (
            <actionFetcher.Form method="post">
              <input type="hidden" name="intent" value="partyMode" />
              <input type="hidden" name="roomId" value={room.id} />
              <input
                type="hidden"
                name="partyMode"
                value={String(!remoteStatus.partyMode)}
              />
              <Tooltip
                className="inline-flex"
                content={`${remoteStatus.partyMode ? 'Hide' : 'Show'} ${getRoomLabels(room.roomType).presentation}`}
              >
                <Button
                  type="submit"
                  size="icon"
                  variant="tertiary"
                  aria-label={`${remoteStatus.partyMode ? 'Hide' : 'Show'} ${getRoomLabels(room.roomType).presentation}`}
                  aria-pressed={remoteStatus.partyMode}
                  disabled={
                    !remoteStatus.online || actionFetcher.state !== 'idle'
                  }
                >
                  <CastIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            </actionFetcher.Form>
          )}
          <ListenerCount
            count={usersCount}
            roomType={room?.roomType ?? 'MUSIC'}
          />
          {room && (
            <Button
              type="button"
              onClick={() => setShowSettings(true)}
              variant="tertiary"
              size="icon"
              aria-label="Room settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          )}
          <Form method="post" action="/remotes/disconnect" reloadDocument>
            <Tooltip className="inline-flex" content="Disconnect remote">
              <Button
                aria-label="Disconnect remote"
                size="icon"
                type="submit"
                variant="tertiary"
              >
                <CloseIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </Form>
        </div>
      </header>

      <roomFetcher.Form
        method="post"
        className="panel-surface mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-3"
      >
        <input type="hidden" name="intent" value="changeRoom" />
        <div className="min-w-0">
          <Input
            aria-label="Room name"
            containerClassName="mb-0!"
            name="nextRoomId"
            onChange={handleRoomInputChange}
            placeholder="Change room"
            maxLength={roomNameMaxLength}
            required
            value={roomInput}
          />
        </div>
        <Button
          type="submit"
          className="border border-transparent py-3"
          variant="secondary"
        >
          Go
        </Button>
      </roomFetcher.Form>

      {!room && (
        <section className="panel-surface mt-4 rounded-3xl p-8 text-center">
          <p className="text-sm text-theme-muted">
            Enter a room name to move the controlled machine.
          </p>
        </section>
      )}

      {room && (
        <div className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <RemotePlaybackControls
            canSeek={canSeek}
            currentPlaylistItem={currentPlaylistItem ?? null}
            fetcher={actionFetcher}
            initialPositionMs={loaderData.playback?.positionMs ?? 0}
            isMachinePlaylistItemCurrent={isMachinePlaylistItemCurrent}
            isPlaying={isPlaying}
            onAddPlaylistItem={() => setShowSearch(true)}
            {...(remoteStatus ? { remoteStatus } : {})}
            room={room}
          />

          <section className="panel-strong min-w-0 rounded-3xl p-4 sm:p-5">
            <h2 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
              Up next ({queuedPlaylistItems.length})
            </h2>
            <QueueList
              playlistItems={queuedPlaylistItems}
              roomId={room.id}
              onVote={handleVote}
              {...(room.isAdmin && { onRemove: handleRemove })}
              isAdmin={room.isAdmin}
            />
          </section>
        </div>
      )}

      {room && (
        <PlaylistItemSearchModal
          fetcher={actionFetcher}
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          providers={loaderData.providers}
          roomId={room.id}
          roomType={room.roomType}
        />
      )}
      {room && (
        <RoomSettingsModal
          fetcher={actionFetcher}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={room}
        />
      )}
    </main>
  );
}
