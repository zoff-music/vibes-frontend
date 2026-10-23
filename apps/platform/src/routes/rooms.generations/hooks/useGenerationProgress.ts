import {
  useFetcher,
  useNavigate,
  useSearchParams,
} from '@kasperrt/smolter/preact';
import { useEffect, useRef } from 'preact/hooks';
import {
  clearPendingGeneration,
  readPendingGeneration,
} from '../../../utils/pendingGeneration';
import type { clientLoader } from '../../resources.generations/clientLoader';

export function useGenerationProgress() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const roomType = searchParams.get('type') === 'watch' ? 'WATCH' : 'MUSIC';
  const valid = /^[1-9]\d*$/.test(id);
  const status = useFetcher<typeof clientLoader>();
  const navigate = useNavigate();
  const handled = useRef('');
  const result = status.data?.id === id ? status.data : null;
  const failed =
    !valid || result?.missing || result?.generation?.status === 'failed';

  useEffect(() => {
    if (!valid || failed) return;
    const load = () => {
      if (document.hidden || status.state !== 'idle') return;
      void status.load(`/resources/generations?id=${id}`);
    };
    const timer = window.setTimeout(load, status.data?.id === id ? 2000 : 0);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id, valid, failed, status.state, status.data, status.load]);

  useEffect(() => {
    const generation = result?.generation;
    if (!generation?.roomId || failed || handled.current === id) return;
    handled.current = id;
    clearPendingGeneration(roomType, id);
    void navigate(`/${encodeURIComponent(generation.roomId)}`, {
      replace: true,
    });
  }, [id, roomType, result, failed, navigate]);

  return {
    failed: Boolean(failed),
    error:
      result?.generation?.error ??
      'This generation is no longer available. Return to your prompt to try again.',
    retry: () => {
      const pending = readPendingGeneration(roomType);
      const prompt = pending?.id === id ? pending.prompt : '';
      clearPendingGeneration(roomType, id);
      void navigate(
        roomType === 'WATCH' ? '/features/watch?mode=ai' : '/?mode=ai',
        {
          replace: true,
          state: { generationPrompt: prompt },
        },
      );
    },
  };
}
