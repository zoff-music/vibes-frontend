import { useState } from 'react';
import { View } from 'react-native';

import { AddPlaylistItemSheet } from '@/components/add-sheet';
import { IconButton } from '@/components/native';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

export function TabletAddPlaylistItemButton() {
  const tabletLayout = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const { canAddPlaylistItems } = useRoomNavigation();
  const { enabled: konamiEnabled } = useKonamiMode();
  const [addPlaylistItemVisible, setAddPlaylistItemVisible] = useState(false);
  if (
    !tabletLayout.isTablet ||
    !canAddPlaylistItems ||
    konamiEnabled ||
    keyboardVisible
  )
    return null;

  return (
    <>
      <View className="absolute right-6 bottom-6 z-50">
        <IconButton
          accessibilityLabel="Add song"
          icon="add"
          onPress={() => setAddPlaylistItemVisible(true)}
        />
      </View>
      <AddPlaylistItemSheet
        visible={addPlaylistItemVisible}
        onClose={() => setAddPlaylistItemVisible(false)}
      />
    </>
  );
}
