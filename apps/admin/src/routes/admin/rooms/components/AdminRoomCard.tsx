import type { AdminRoomSummaryV2 } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { getRoomLabels } from '@vibes/ui/shared';
import { Button, SoundCloudIcon, YouTubeIcon } from '@vibes/ui/web';
import type { ChangeEvent, JSX, KeyboardEvent, MouseEvent } from 'react';

interface AdminRoomCardProps {
  editingName: string;
  editingRoomId: string | null;
  isLoading: boolean;
  onCancelRename: () => void;
  onClearPassword: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
  onEditingNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEditingNameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSaveRename: () => void;
  onStartRename: (event: MouseEvent<HTMLButtonElement>) => void;
  room: AdminRoomSummaryV2;
}

export function AdminRoomCard({
  editingName,
  editingRoomId,
  isLoading,
  onCancelRename,
  onClearPassword,
  onDelete,
  onEditingNameChange,
  onEditingNameKeyDown,
  onSaveRename,
  onStartRename,
  room,
}: AdminRoomCardProps) {
  const isEditing = editingRoomId === room.id;
  const labels = getRoomLabels(room.roomType);

  return (
    <div className="panel-surface flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-theme p-5 transition-all hover:border-primary/40">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
            <h2 className="max-w-full break-words font-bold text-theme text-xl">
              {room.name}
            </h2>
            <span
              className={classNames(
                'shrink-0 rounded-full border px-3 py-1 font-semibold text-xs',
                room.roomType === 'WATCH'
                  ? 'border-secondary/50 bg-secondary/10 text-theme'
                  : 'border-primary/50 bg-primary/10 text-theme',
              )}
            >
              {room.roomType === 'WATCH' ? 'Watch room' : 'Music room'}
            </span>
            <span className="max-w-full truncate rounded-full border border-theme bg-theme-surface px-3 py-1 font-mono text-theme-muted text-xs uppercase tracking-wider">
              {room.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-theme-muted">
            <span className="rounded-lg bg-theme-surface px-2 py-1 font-semibold">
              {room.userCount}{' '}
              {room.userCount === 1 ? labels.participant : labels.participants}
            </span>
            <span className="rounded-lg bg-theme-surface px-2 py-1 font-semibold">
              {room.playlistItemCount}{' '}
              {room.playlistItemCount === 1 ? labels.item : labels.items}
            </span>
            <span className="rounded-lg bg-theme-surface px-2 py-1 font-semibold">
              {room.hasAdminPassword ? 'password set' : 'no password'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {room.activeSources.length === 0 && (
            <span className="text-theme-subtle text-xs uppercase tracking-widest">
              No sources
            </span>
          )}
          {room.activeSources.map((source) => (
            <span
              className="rounded-lg border border-theme bg-theme-surface p-2"
              key={source}
              title={source}
            >
              {sourceIcons[source]}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-theme bg-theme-surface p-3 sm:flex-row sm:items-center">
          <input
            className="min-w-0 flex-1 rounded-xl border border-theme bg-theme px-3 py-2 text-base text-theme outline-hidden transition-all focus:border-primary"
            disabled={isLoading}
            onChange={onEditingNameChange}
            onKeyDown={onEditingNameKeyDown}
            type="text"
            value={editingName}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!editingName.trim() || isLoading}
              onClick={onSaveRename}
              variant="tertiary"
            >
              Save
            </Button>
            <Button
              disabled={isLoading}
              onClick={onCancelRename}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <a
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-primary/40 px-4 py-2 font-semibold text-primary text-sm transition-all hover:border-primary hover:bg-primary/10"
          href={`/${encodeURIComponent(room.name)}`}
        >
          Open Room
        </a>
        <Button
          disabled={isLoading || isEditing}
          onClick={onStartRename}
          value={room.id}
          variant="tertiary"
        >
          Rename
        </Button>
        <Button
          disabled={!room.hasAdminPassword || isLoading}
          onClick={onClearPassword}
          value={room.id}
          variant="secondary"
        >
          Clear Password
        </Button>
        <Button
          disabled={isLoading}
          onClick={onDelete}
          value={room.id}
          variant="destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

const sourceIcons: Record<string, JSX.Element> = {
  youtube: <YouTubeIcon className="h-4 w-4 text-red-500" />,
  soundcloud: <SoundCloudIcon className="h-4 w-4 text-orange-500" />,
};
