import type { GeneratedRoom } from '@vibes/models';
import { useCallback } from 'react';
import { api } from '../index';

export interface RoomGeneration {
  generateRoom: (
    prompt: string,
  ) => Promise<[Error | null, GeneratedRoom | null]>;
}

export function useRoomGeneration(): RoomGeneration {
  const generateRoom = useCallback(
    async (prompt: string): Promise<[Error | null, GeneratedRoom | null]> => {
      const [error, generatedRoom] = await api.post(
        '/rooms/generations',
        null,
        {
          prompt,
        },
        { timeout: 50_000 },
      );
      return [error, generatedRoom];
    },
    [],
  );

  return { generateRoom };
}
