import { useLoaderData, useRouter } from '@kasperrt/smolter/preact';
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'preact/compat';
import type { RoomLoaderData } from '../../routes/$id.$/loader';
import { useCastStore } from '../../stores/castStore';
import { usePersistentPlayerStore } from '../../stores/persistentPlayerStore';

const RoomView = lazy(async () => {
  const module = await import('../../routes/$id.$/components/RoomView');
  return { default: module.RoomView };
});

// This owner stays at one position above the outlet. Never portal/reparent
// provider iframes: moving their DOM nodes can reset playback too.
export function RoomSession() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    router.subscribe,
    router.getSnapshot,
    router.getSnapshot,
  );
  const data = useLoaderData<RoomLoaderData>();
  const active =
    snapshot.path === '/:id/*' && !snapshot.error && Boolean(data?.room);
  const enabled = usePersistentPlayerStore((state) => state.enabled);
  const [retained, setRetained] = useState<RoomLoaderData | null>(null);
  const current = active ? data : enabled ? retained : null;
  const setActiveRoomId = usePersistentPlayerStore(
    (state) => state.setActiveRoomId,
  );

  useEffect(() => {
    setActiveRoomId(current?.room.id ?? null);
    return () => setActiveRoomId(null);
  }, [current?.room.id, setActiveRoomId]);

  useEffect(() => {
    if (active) setRetained(data);
    else if (!enabled) setRetained(null);
  }, [active, data, enabled]);

  return (
    <Suspense fallback={null}>
      {current && (
        <RoomView
          loaderData={current}
          minimized={!active}
          onClose={() => {
            setRetained(null);
            useCastStore.getState().cleanup();
          }}
        />
      )}
    </Suspense>
  );
}
