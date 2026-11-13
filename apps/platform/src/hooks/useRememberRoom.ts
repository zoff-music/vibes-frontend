import type { PublicRoomV3 } from '@vibes/models';
import { useEffect } from 'preact/compat';
import { rememberRecentRoom } from '../utils/recentRooms';
import { clearRoomReminder, rememberRoom } from '../utils/roomReminder';
import { isInternalDeparture } from '../utils/roomReminderNavigation';

export function useRememberRoom(
  roomId: string,
  roomName: string,
  minimized: boolean,
  roomType: PublicRoomV3['roomType'],
) {
  useEffect(() => {
    rememberRecentRoom({ id: roomId, name: roomName }, roomType);
  }, [roomId, roomName, roomType]);

  useEffect(() => {
    // A retained player is still mounted after leaving the room page.
    if (minimized) {
      clearRoomReminder(roomId);
      return;
    }

    rememberRoom(roomId);
    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null;

      if (
        !anchor ||
        anchor.download ||
        (anchor.target && anchor.target !== '_self')
      )
        return;

      if (isInternalDeparture(window.location.href, anchor.href)) {
        clearRoomReminder(roomId);
      }
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) rememberRoom(roomId);
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('pageshow', handlePageShow);
    // React cleans up on in-app departure, but not when the document closes.
    // Writing on entry also survives browsers that never fire unload events.
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('pageshow', handlePageShow);
      clearRoomReminder(roomId);
    };
  }, [roomId, minimized]);
}
