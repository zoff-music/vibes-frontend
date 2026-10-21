import type { AdminRoomSummaryV2 } from '@vibes/models';
import { getRoomLabels } from '@vibes/ui/shared';
import {
  Button,
  ExplicitBadge,
  SoundCloudIcon,
  YouTubeIcon,
} from '@vibes/ui/web';
import type {
  ChangeEvent,
  JSX,
  KeyboardEvent,
  MouseEvent,
} from 'preact/compat';

interface AdminRoomCardProps {
  editingName: string;
  editingRoomId: string | null;
  isLoading: boolean;
  onCancelRename: () => void;
  onClearPassword: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
  onFlag: (event: MouseEvent<HTMLButtonElement>) => void;
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
  onFlag,
  onEditingNameChange,
  onEditingNameKeyDown,
  onSaveRename,
  onStartRename,
  room,
}: AdminRoomCardProps) {
  const isEditing = editingRoomId === room.id;
  const labels = getRoomLabels(room.roomType);

  return (
    <article className="panel-surface min-w-0 rounded-xl border border-theme px-4 py-3">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="break-words font-bold text-base text-theme">
              {room.name}
            </h2>
            {room.flagged && <ExplicitBadge />}
            <span className="text-theme-muted text-xs">
              {room.roomType === 'WATCH' ? 'Watch' : 'Music'}
            </span>
            {room.activeSources.map((source) => (
              <span key={source} title={source}>
                {sourceIcons[source]}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-theme-muted text-xs">
            <span>{room.isPublic ? 'Public' : 'Private'}</span>
            <span>
              {room.userCount}{' '}
              {room.userCount === 1 ? labels.participant : labels.participants}
            </span>
            <span>
              {room.playlistItemCount}{' '}
              {room.playlistItemCount === 1 ? labels.item : labels.items}
            </span>
            <span>
              {room.hasAdminPassword ? 'Password set' : 'No password'}
            </span>
            <span>{room.checkedAt ? 'Checked' : 'Not checked'}</span>
            {room.flaggedAt && (
              <time dateTime={room.flaggedAt}>
                Flagged {room.flaggedAt.slice(0, 16).replace('T', ' ')} UTC
              </time>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          <a
            className="inline-flex min-h-9 items-center rounded-full px-3 text-primary text-sm transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-secondary"
            href={`/${encodeURIComponent(room.id)}`}
          >
            Open
          </a>
          <Button
            disabled={isLoading || isEditing}
            onClick={onStartRename}
            size="small"
            value={room.id}
            variant="ghost"
          >
            Rename
          </Button>
          <Button
            disabled={!room.hasAdminPassword || isLoading}
            onClick={onClearPassword}
            size="small"
            value={room.id}
            variant="ghost"
          >
            Clear password
          </Button>
          <Button
            disabled={isLoading}
            onClick={onFlag}
            size="small"
            value={room.id}
            variant={room.flagged ? 'tertiary-active' : 'tertiary'}
          >
            {room.flagged ? 'Unflag' : 'Flag'}
          </Button>
          <Button
            disabled={isLoading}
            onClick={onDelete}
            size="small"
            value={room.id}
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </div>
      {isEditing && (
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 border-theme border-t pt-3">
          <input
            aria-label="Room name"
            className="min-w-0 flex-1 rounded-full border border-theme bg-theme px-3 py-2 text-base text-theme outline-hidden focus:border-primary"
            disabled={isLoading}
            onChange={onEditingNameChange}
            onKeyDown={onEditingNameKeyDown}
            type="text"
            value={editingName}
          />
          <Button
            disabled={!editingName.trim() || isLoading}
            onClick={onSaveRename}
            size="small"
            variant="tertiary"
          >
            Save
          </Button>
          <Button
            disabled={isLoading}
            onClick={onCancelRename}
            size="small"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      )}
    </article>
  );
}

const sourceIcons: Record<string, JSX.Element> = {
  youtube: <YouTubeIcon className="h-4 w-4 text-red-500" />,
  soundcloud: <SoundCloudIcon className="h-4 w-4 text-orange-500" />,
};
