import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { AddSongSheet } from '@/components/add-song-sheet';
import { useApp } from '@/providers/app-provider';

export default function AddSongScreen() {
  const { controllerRemote } = useApp();
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
