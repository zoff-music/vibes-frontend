import { classNames, useRoomStore } from '@vibes/shared';
import { CrownIcon, chatNameColor, RemoteIcon } from '@vibes/ui/web';

interface RoomMembersProps {
  roomId: string;
}

export function RoomMembers({ roomId }: RoomMembersProps) {
  const presence = useRoomStore((state) =>
    state.room?.id === roomId ? state.members : null,
  );
  const userId = useRoomStore((state) => state.userId);
  const members = [...(presence?.members ?? [])].sort(
    (left, right) =>
      Number(right.userId === userId) - Number(left.userId === userId),
  );

  return (
    <section
      aria-label="People in this room"
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl lg:[scrollbar-gutter:stable]"
    >
      {!presence && (
        <p role="status" className="text-theme-muted p-4 text-sm">
          Connecting to room members…
        </p>
      )}
      {presence && presence.members.length === 0 && (
        <p className="text-theme-muted p-4 text-sm">No listeners connected.</p>
      )}
      {presence && (
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.userId}
              className="border-theme bg-theme-surface text-theme relative flex min-h-14 w-full min-w-0 items-center gap-2.5 rounded-2xl border p-3 sm:gap-3"
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
                <span title="Room host" className="text-secondary shrink-0">
                  <RemoteIcon aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Room host</span>
                </span>
              )}
              <span
                className={classNames(
                  'wrap-anywhere min-w-0 flex-1',
                  chatNameColor(member.userId),
                )}
              >
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
        <p className="text-theme-muted p-4 text-sm">
          {presence.castReceivers} Cast{' '}
          {presence.castReceivers === 1 ? 'receiver' : 'receivers'}
        </p>
      )}
    </section>
  );
}
