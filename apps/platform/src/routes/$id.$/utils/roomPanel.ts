import type { RoomLoaderData } from '../loader';
import { loadAddToQueueModal } from './preloadQueueModal';

export type RoomPanel = '' | 'add' | 'settings' | 'chat' | 'share' | 'cast';

let activeRoomData: RoomLoaderData | undefined;

// Only the mounted room owns this reference; this is not a room-data cache.
export function retainRoomData(data: RoomLoaderData) {
  activeRoomData = data;

  return () => {
    if (activeRoomData === data) activeRoomData = undefined;
  };
}

export function getRetainedRoomData(id: string) {
  return activeRoomData?.room.id === id ? activeRoomData : undefined;
}

export function roomPanel(value = ''): RoomPanel {
  if (
    value === '' ||
    value === 'add' ||
    value === 'settings' ||
    value === 'chat' ||
    value === 'share' ||
    value === 'cast'
  )
    return value;

  throw new Response('Not found', { status: 404 });
}

export async function loadRoomPanel(panel: RoomPanel) {
  switch (panel) {
    case 'add':
      await loadAddToQueueModal();
      break;
    case 'settings':
      await import('../components/RoomSettingsMenu');
      break;
    case 'share':
      await import('../components/RoomSharePanel');
      break;
    case 'chat':
      await import('@vibes/ui/web/components/ChatConversation');
      break;
    case 'cast':
      await import('../../../components/cast/DeviceSelector');
      break;
  }
}
