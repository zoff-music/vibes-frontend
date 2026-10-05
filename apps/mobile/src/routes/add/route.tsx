import { Route } from '@vibes/native-router';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AddPlaylistItemSheet } from '@/components/add-sheet';
import { useRoomSession } from '@/providers/app-provider';

export { ErrorBoundary } from '@/routes/_index/components/route-boundaries';

export default function AddRoute() {
  return (
    <Route routeId="add">
      <AddPlaylistItemScreen />
    </Route>
  );
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
