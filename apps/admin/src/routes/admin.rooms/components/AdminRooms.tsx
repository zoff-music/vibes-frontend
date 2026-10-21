import { Button } from '@vibes/ui/web';
import { AdminRoomFilters } from '../../admin/components/AdminRoomFilters';
import { AdminRoomCard } from '../components/AdminRoomCard';
import { useAdminRooms } from '../hooks/useAdminRooms';

export function AdminRooms() {
  const {
    roomSearch,
    fetcher,
    liveRoomResult,
    editingRoomId,
    editingName,
    isLoading,
    rooms,
    hasRooms,
    totalViewers,
    refreshRooms,
    handleStartRename,
    cancelRename,
    handleEditingNameChange,
    saveRename,
    handleEditingNameKeyDown,
    handleClearPassword,
    handleDeleteRoom,
    handleFlagRoom,
    filterFlaggedRooms,
    searchRooms,
    sortRooms,
    loadPreviousRooms,
    loadNextRooms,
  } = useAdminRooms();

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-black text-3xl tracking-tight">Rooms</h1>
          <p className="text-sm text-theme-muted">
            {hasRooms
              ? `${liveRoomResult.total} rooms, ${totalViewers} participants on this page`
              : roomSearch.q
                ? 'No rooms match this search'
                : 'No active rooms yet'}
          </p>
        </div>
        <Button onClick={refreshRooms} variant="tertiary">
          Refresh
        </Button>
      </header>

      {fetcher.data?.error && !fetcher.data.rateLimitMessage && (
        <p
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-500 text-sm"
          role="alert"
        >
          {fetcher.data.error}
        </p>
      )}

      <AdminRoomFilters
        disabled={isLoading}
        onSearch={searchRooms}
        onSort={sortRooms}
        search={roomSearch}
      />

      <Button
        aria-pressed={roomSearch.flagged}
        disabled={isLoading}
        onClick={filterFlaggedRooms}
        size="small"
        variant={roomSearch.flagged ? 'tertiary-active' : 'tertiary'}
      >
        Flagged rooms
      </Button>

      <div className="grid gap-2">
        {rooms.map((room) => (
          <AdminRoomCard
            editingName={editingName}
            editingRoomId={editingRoomId}
            isLoading={isLoading}
            key={room.id}
            onCancelRename={cancelRename}
            onClearPassword={handleClearPassword}
            onDelete={handleDeleteRoom}
            onFlag={handleFlagRoom}
            onEditingNameChange={handleEditingNameChange}
            onEditingNameKeyDown={handleEditingNameKeyDown}
            onSaveRename={saveRename}
            onStartRename={handleStartRename}
            room={room}
          />
        ))}
      </div>

      <nav
        aria-label="Room pagination"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-theme-muted">
          {liveRoomResult.total === 0
            ? 'No rooms'
            : `${liveRoomResult.from + 1}–${liveRoomResult.to + 1} of ${liveRoomResult.total}`}
        </p>
        <div className="flex gap-3">
          <Button
            disabled={roomSearch.from === 0 || isLoading}
            onClick={loadPreviousRooms}
            variant="secondary"
          >
            Previous
          </Button>
          <Button
            disabled={
              liveRoomResult.to + 1 >= liveRoomResult.total || isLoading
            }
            onClick={loadNextRooms}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </nav>
    </main>
  );
}
