import { classNames, useRoomStore } from '@vibes/shared';
import { CrownIcon, RemoteIcon } from '@vibes/ui/web';

interface RoomMembersProps {
  roomId: string;
}

export function RoomMembers({ roomId }: RoomMembersProps) {
  const presence = useRoomStore((state) =>
    state.room?.id === roomId ? state.members : null,
  );
  const userId = useRoomStore((state) => state.userId);

  return (
    <section
      aria-label="People in this room"
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl p-1"
    >
      {!presence && (
        <p role="status" className="p-4 text-sm text-theme-muted">
          Connecting to room members…
        </p>
      )}
      {presence && presence.members.length === 0 && (
        <p className="p-4 text-sm text-theme-muted">No listeners connected.</p>
      )}
      {presence && (
        <ul className="space-y-2">
          {presence.members.map((member) => (
            <li
              key={member.userId}
              className="panel-surface flex min-h-14 items-center gap-3 rounded-2xl border border-theme px-4 py-3 text-theme"
            >
              {(member.isAdmin || member.isModerator) && (
                <span
                  title={member.isModerator ? 'Moderator' : 'Room admin'}
                  className={classNames(
                    'shrink-0',
                    member.isModerator
                      ? 'text-amber-300 [.theme-light_&]:text-amber-700'
                      : 'text-primary',
                  )}
                >
                  <CrownIcon aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">
                    {member.isModerator ? 'Moderator' : 'Room admin'}
                  </span>
                </span>
              )}
              {member.isHost && (
                <span title="Room host" className="shrink-0 text-secondary">
                  <RemoteIcon aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Room host</span>
                </span>
              )}
              <span className="wrap-anywhere min-w-0 flex-1">
                {member.name}
              </span>
              {member.userId === userId && (
                <span className="text-theme-muted text-xs">You</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {presence && presence.castReceivers > 0 && (
        <p className="p-4 text-sm text-theme-muted">
          {presence.castReceivers} Cast{' '}
          {presence.castReceivers === 1 ? 'receiver' : 'receivers'}
        </p>
      )}
    </section>
  );
}
