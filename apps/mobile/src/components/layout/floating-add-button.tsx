import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddPlaylistItemSheet } from '@/components/add-sheet';
import { IconButton } from '@/components/native';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';

export function FloatingAddPlaylistItemButton() {
  const insets = useSafeAreaInsets();
  const tabletLayout = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const { addLabel, canAddPlaylistItems } = useRoomNavigation();
  const [addPlaylistItemVisible, setAddPlaylistItemVisible] = useState(false);

  if ((!tabletLayout.isTablet && Platform.OS !== 'ios') || !canAddPlaylistItems)
    return null;

  return (
    <>
      {!keyboardVisible && (
        <View
          className="absolute right-6 z-50"
          style={{
            bottom: tabletLayout.isTablet
              ? insets.bottom + 24
              : insets.bottom + 76,
          }}
        >
          <IconButton
            accessibilityLabel={addLabel}
            icon="add"
            onPress={() => setAddPlaylistItemVisible(true)}
          />
        </View>
      )}
      <AddPlaylistItemSheet
        visible={addPlaylistItemVisible}
        onClose={() => setAddPlaylistItemVisible(false)}
      />
    </>
  );
}
