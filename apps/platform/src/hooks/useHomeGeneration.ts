import {
  useFetcher,
  useNavigate,
  useURLLocation,
} from '@kasperrt/smolter/preact';
import type { RoomType } from '@vibes/models';
import { showToast } from '@vibes/shared';
import { useEffect, useRef } from 'preact/hooks';
import type { HomeActionData } from '../routes/_index/utils/actions/clientAction';
import { readPendingGeneration } from '../utils/pendingGeneration';

export function useHomeGeneration(
  roomType: RoomType,
  onRestoreGeneration: (prompt: string) => void,
) {
  const action = useFetcher<HomeActionData>();
  const navigate = useNavigate();
  const location = useURLLocation();
  const handledAction = useRef<HomeActionData | null>(null);

  useEffect(() => {
    const state: unknown = location.state;
    if (
      state &&
      typeof state === 'object' &&
      'generationPrompt' in state &&
      typeof state.generationPrompt === 'string'
    ) {
      onRestoreGeneration(state.generationPrompt);
      return;
    }

    const pending = readPendingGeneration(roomType);
    if (!pending) return;
    void navigate(
      `/rooms/generations?id=${pending.id}&type=${roomType.toLowerCase()}`,
      { replace: true },
    );
  }, [roomType, location.state, onRestoreGeneration, navigate]);

  useEffect(() => {
    if (!action.data || action.data === handledAction.current) return;
    handledAction.current = action.data;
    if (action.data.error) showToast(action.data.error, 'error');
    if (action.data.generation && action.data.generationRoomType === roomType) {
      void navigate(
        `/rooms/generations?id=${action.data.generation.id}&type=${roomType.toLowerCase()}`,
      );
    }
  }, [action.data, roomType, navigate]);

  return {
    generating: action.state !== 'idle',
    submit: (prompt: string) => {
      if (action.state !== 'idle') return;
      void action.submit(
        { intent: 'generateRoom', prompt, roomType },
        { method: 'post' },
      );
    },
  };
}
