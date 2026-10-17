import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AddPlaylistItemSheet } from '@/components/add-sheet';
import { useRoomSession } from '@/providers/app-provider';

export { ErrorBoundary } from '@/components/route-error-boundary';

export default function AddRoute() {
  return <AddPlaylistItemScreen />;
}

function AddPlaylistItemScreen() {
  const { controllerRemote } = useRoomSession();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setVisible(true);

      return () => setVisible(false);
    }, []),
  );

  const close = () => {
    setVisible(false);
    router.replace(controllerRemote ? '/remote' : '/');
  };

  return <AddPlaylistItemSheet visible={visible} onClose={close} />;
}
