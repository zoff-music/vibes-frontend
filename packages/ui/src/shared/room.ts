import type { RoomType } from '@vibes/models';

export function getRoomLabels(roomType: RoomType) {
  const watch = roomType === 'WATCH';

  return {
    item: watch ? 'video' : 'song',
    items: watch ? 'videos' : 'songs',
    participant: watch ? 'watcher' : 'listener',
    participants: watch ? 'watchers' : 'listeners',
    activity: watch ? 'watching' : 'listening',
    add: watch ? 'Add video' : 'Add song',
    presentation: watch ? 'Cinema mode' : 'Party mode',
  };
}
