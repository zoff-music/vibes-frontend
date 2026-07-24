import type { RoomNameSuggestion } from '@vibes/models';
import { useCallback } from 'react';
import { headApiUrl } from '../fetchProvider';
import { api } from '../index';

interface RoomNamesApi {
  getRoomNameSuggestion: () => Promise<
    [Error | null, RoomNameSuggestion | null]
  >;
  roomExists: (name: string) => Promise<[Error | null, boolean | null]>;
}

export function useRoomNames(): RoomNamesApi {
  const getRoomNameSuggestion = useCallback<
    RoomNamesApi['getRoomNameSuggestion']
  >(async () => {
    const [err, suggestion] = await api.get('/rooms/suggestions', null);
    return [err, suggestion];
  }, []);

  const roomExists = useCallback<RoomNamesApi['roomExists']>(
    async (name: string) => {
      const roomID = slugifyRoomName(name);
      if (!roomID) {
        return [new Error('error invalid room name'), null];
      }

      const [urlError, url] = await api.url('/rooms/{id}', { id: roomID });
      if (urlError || !url) {
        return [urlError ?? new Error('error building room URL'), null];
      }

      const result = await headApiUrl(url);
      return result;
    },
    [],
  );

  return { getRoomNameSuggestion, roomExists };
}

function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '');
}
