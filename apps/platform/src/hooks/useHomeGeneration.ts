import { useFetcher, useNavigate } from '@kasperrt/smolter/preact';
import type { RoomType } from '@vibes/models';
import { showToast } from '@vibes/shared';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { HomeActionData } from '../routes/_index/utils/actions/clientAction';
import type { clientLoader } from '../routes/resources.generations/clientLoader';
import {
  clearPendingGeneration,
  type PendingGeneration,
  readPendingGeneration,
} from '../utils/pendingGeneration';

export function useHomeGeneration(
  roomType: RoomType,
  onRestoreGeneration: (prompt: string) => void,
) {
  const action = useFetcher<HomeActionData>();
  const status = useFetcher<typeof clientLoader>();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingGeneration | null>(null);
  const handled = useRef('');
  const handledAction = useRef<HomeActionData | null>(null);

  useEffect(() => {
    handled.current = '';
    const restored = readPendingGeneration(roomType);
    setPending(restored);
    if (restored) onRestoreGeneration(restored.prompt);
  }, [roomType, onRestoreGeneration]);

  useEffect(() => {
    if (!action.data || action.data === handledAction.current) return;
    handledAction.current = action.data;
    if (action.data?.error) showToast(action.data.error, 'error');
    if (action.data?.generation && action.data.generationRoomType === roomType)
      setPending(action.data.generation);
  }, [action.data, roomType]);

  useEffect(() => {
    if (!pending || pending.roomType !== roomType) return;
    const load = () => {
      if (document.hidden || status.state !== 'idle') return;
      void status.load(`/resources/generations?id=${pending.id}`);
    };
    const timer = window.setTimeout(
      load,
      status.data?.id === pending.id ? 2000 : 0,
    );
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pending, roomType, status.state, status.data, status.load]);

  useEffect(() => {
    if (
      !pending ||
      pending.roomType !== roomType ||
      status.data?.id !== pending.id ||
      handled.current === pending.id
    )
      return;
    const generation = status.data.generation;
    const missing = status.data.missing;
    if (
      !missing &&
      (!generation ||
        (generation.status === 'generating' && !generation.roomId))
    )
      return;

    handled.current = pending.id;
    clearPendingGeneration(roomType, pending.id);
    if (generation?.roomId && generation.status !== 'failed') {
      void navigate(`/${encodeURIComponent(generation.roomId)}`);
      return;
    }

    setPending(null);
    showToast(
      generation?.error ||
        'Could not finish generating your room. Please try again.',
      'error',
    );
  }, [pending, status.data, navigate, roomType]);

  return {
    generating: action.state !== 'idle' || pending !== null,
    pendingPrompt: pending?.prompt,
    submit: (prompt: string) => {
      if (action.state !== 'idle' || pending) return;
      void action.submit(
        { intent: 'generateRoom', prompt, roomType },
        { method: 'post' },
      );
    },
  };
}
