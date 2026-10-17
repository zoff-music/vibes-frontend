import type { PublicRoomResultV3, RoomType } from '@vibes/models';
import { useRequest } from '@vibes/shared/use-request';
import { useRef, useState } from 'react';
import { loadPublicRooms } from '@/requests/load-public-rooms';

export function useRoomBrowser(roomType: RoomType) {
  const [, fetcherLoad] = useRequest(loadPublicRooms);
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
    const response = await fetcherLoad({
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
