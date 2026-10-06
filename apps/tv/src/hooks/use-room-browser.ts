import type { PublicRoomResultV3, RoomType } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { useRef, useState } from 'react';

export function useRoomBrowser(roomType: RoomType) {
  const [, fetcher] = useFetcher<PublicRoomResultV3>({
    routeId: 'rooms.public',
  });
  const [browsing, setBrowsing] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PublicRoomResultV3 | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const load = async (from = 0, search = query) => {
    const id = ++requestId.current;
    setBrowsing(true);
    setLoading(true);
    setError('');
    const response = await fetcher.load({
      params: { from: String(from), q: search, roomType },
    });
    if (id !== requestId.current) return;
    setResult(response.data);
    setError(response.error);
    setLoading(false);
  };
  const showLive = () => {
    requestId.current += 1;
    setBrowsing(false);
    setLoading(false);
    setError('');
  };
  return { browsing, query, setQuery, result, error, loading, load, showLive };
}
