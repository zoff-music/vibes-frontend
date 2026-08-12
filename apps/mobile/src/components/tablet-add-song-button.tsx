import { useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/native';
import { useApp } from '@/providers/app-provider';

export function TabletAddSongButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { controllerRemote, room } = useApp();
  const canAddSongs = Boolean(room || controllerRemote?.roomId);

  if (Platform.OS !== 'ios' || !Platform.isPad || !canAddSongs) return null;

  return (
    <View
      className="absolute right-6 z-50"
      style={{ bottom: insets.bottom + floatingButtonBottomOffset }}
    >
      <IconButton
        accessibilityLabel="Add song"
        icon="add"
        onPress={() => router.push('/add')}
      />
    </View>
  );
}

const floatingButtonBottomOffset = 24;
