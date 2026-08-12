import { useState } from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddSongSheet } from '@/components/add-song-sheet';
import { IconButton } from '@/components/native';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useApp } from '@/providers/app-provider';

export function TabletAddSongButton() {
  const insets = useSafeAreaInsets();
  const tabletLayout = useTabletLandscapeLayout();
  const { controllerRemote, room } = useApp();
  const [addSongVisible, setAddSongVisible] = useState(false);
  const canAddSongs = Boolean(room || controllerRemote?.roomId);

  if (!tabletLayout.isTablet || !canAddSongs) return null;

  return (
    <>
      <View
        className="absolute right-6 z-50"
        style={{ bottom: insets.bottom + floatingButtonBottomOffset }}
      >
        <IconButton
          accessibilityLabel="Add song"
          icon="add"
          onPress={() => setAddSongVisible(true)}
        />
      </View>
      <Modal
        animationType="slide"
        presentationStyle="fullScreen"
        supportedOrientations={[
          'portrait',
          'portrait-upside-down',
          'landscape',
          'landscape-left',
          'landscape-right',
        ]}
        visible={addSongVisible}
        onRequestClose={() => setAddSongVisible(false)}
      >
        <AddSongSheet
          visible={addSongVisible}
          onClose={() => setAddSongVisible(false)}
        />
      </Modal>
    </>
  );
}

const floatingButtonBottomOffset = 24;
