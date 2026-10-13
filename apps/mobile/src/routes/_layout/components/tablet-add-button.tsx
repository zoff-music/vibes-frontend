import { useState } from 'react';
import { View } from 'react-native';

import { AddPlaylistItemSheet } from '@/components/add-sheet';
import { IconButton } from '@/components/native';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';

export function TabletAddPlaylistItemButton() {
  const tabletLayout = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const { addLabel, canAddPlaylistItems } = useRoomNavigation();
  const [addPlaylistItemVisible, setAddPlaylistItemVisible] = useState(false);
  if (!tabletLayout.isTablet || !canAddPlaylistItems || keyboardVisible)
    return null;

  return (
    <>
      <View className="absolute right-6 bottom-6 z-50">
        <IconButton
          accessibilityLabel={addLabel}
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
