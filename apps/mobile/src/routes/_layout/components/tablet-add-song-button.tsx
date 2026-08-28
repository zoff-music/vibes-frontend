import { useState } from 'react';
import { View } from 'react-native';

import { AddSongSheet } from '@/components/add-song-sheet';
import { IconButton } from '@/components/native';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

export function TabletAddSongButton() {
  const tabletLayout = useTabletLandscapeLayout();
  const { canAddSongs } = useRoomNavigation();
  const { enabled: konamiEnabled } = useKonamiMode();
  const [addSongVisible, setAddSongVisible] = useState(false);
  if (!tabletLayout.isTablet || !canAddSongs || konamiEnabled) return null;

  return (
    <>
      <View className="absolute right-6 bottom-6 z-50">
        <IconButton
          accessibilityLabel="Add song"
          icon="add"
          onPress={() => setAddSongVisible(true)}
        />
      </View>
      <AddSongSheet
        visible={addSongVisible}
        onClose={() => setAddSongVisible(false)}
      />
    </>
  );
}
