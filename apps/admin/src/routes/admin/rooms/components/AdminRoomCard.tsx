import type { AdminRoomSummary } from '@vibes/models';
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
  room: AdminRoomSummary;
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

  return (
    <div className="glass flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border-2 border-ink/10 p-5 transition-all hover:border-primary/30 dark:border-gray-700">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
            <h2 className="max-w-full break-words font-bold text-ink text-xl dark:text-white">
              {room.name}
            </h2>
            <span className="max-w-full truncate rounded-full bg-ink/10 px-3 py-1 font-mono text-ink/60 text-xs uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">
              {room.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-ink/60 text-sm dark:text-gray-400">
            <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
              {room.userCount} viewers
            </span>
            <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
              {room.songCount} songs
            </span>
            <span className="rounded-lg bg-ink/5 px-2 py-1 font-semibold dark:bg-gray-800">
              {room.hasAdminPassword ? 'password set' : 'no password'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {room.activeSources.length === 0 && (
            <span className="text-ink/50 text-xs uppercase tracking-widest dark:text-gray-500">
              No sources
            </span>
          )}
          {room.activeSources.map((source) => (
            <span
              className="rounded-lg bg-ink/5 p-2 dark:bg-gray-800"
              key={source}
              title={source}
            >
              {sourceIcons[source]}
            </span>
          ))}
        </div>
      </div>

      {isEditing && (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-ink/10 bg-ink/5 p-3 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800/60">
          <input
            className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-surface px-3 py-2 text-base text-ink outline-hidden transition-all focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-primary/40 px-4 py-2 font-semibold text-primary text-sm transition-all hover:border-primary hover:bg-primary/10 dark:text-primary-light"
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
