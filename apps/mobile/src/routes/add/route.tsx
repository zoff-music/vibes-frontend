import { Route } from '@vibes/native-router';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AddSongSheet } from '@/components/add-song-sheet';
import { useRoomSession } from '@/providers/app-provider';

export { ErrorBoundary } from '@/routes/_index/components/route-boundaries';

export default function AddRoute() {
  return (
    <Route routeId="add">
      <AddSongScreen />
    </Route>
  );
}

function AddSongScreen() {
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

  return <AddSongSheet visible={visible} onClose={close} />;
}
