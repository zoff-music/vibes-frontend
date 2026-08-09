import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { palette } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = palette[scheme === 'light' ? 'light' : 'dark'];
  return (
    <NativeTabs
      backgroundColor={theme.card}
      indicatorColor={theme.surface}
      tintColor={theme.accent}
      labelStyle={{
        default: { color: theme.muted },
        selected: { color: theme.text },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Rooms</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="music.note.house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="player">
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="play.square.stack.fill" md="queue_music" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remote">
        <NativeTabs.Trigger.Label>Remote</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="iphone.radiowaves.left.and.right"
          md="settings_remote"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
