import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { useApp } from '@/providers/app-provider';

export default function AddSongScreen() {
  const { requestAddSong } = useApp();

  useEffect(() => {
    requestAddSong();
  }, [requestAddSong]);

  return <Redirect href="/player" />;
}
