import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';
import {
  zoffAndroidIconSources,
  zoffIconSources,
} from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useApp } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

export default function AppTabs() {
  const { resolvedScheme } = useThemePreference();
  const theme = useAppTheme();
  const { controllerRemote, room } = useApp();
  const canAddSongs = Boolean(room || controllerRemote?.roomId);
  const iconSources =
    Platform.OS === 'android' ? zoffAndroidIconSources : zoffIconSources;
  return (
    <NativeTabs
      blurEffect={
        resolvedScheme === 'light'
          ? 'systemMaterialLight'
          : 'systemMaterialDark'
      }
      iconColor={{ default: theme.muted, selected: theme.pink }}
      minimizeBehavior="onScrollDown"
      tintColor={theme.accent}
      labelStyle={{
        default: {
          color: theme.muted,
          fontFamily: 'Pixelify Sans Bold',
          fontSize: 11,
        },
        selected: {
          color: theme.text,
          fontFamily: 'Pixelify Sans Bold',
          fontSize: 11,
        },
      }}
      shadowColor="transparent"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {room ? 'Room' : 'Rooms'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.home}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remote">
        <NativeTabs.Trigger.Label>Remote</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.remote}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.settings}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        hidden={!canAddSongs}
        name="add"
        {...(Platform.OS === 'ios' ? { role: 'search' as const } : {})}
      >
        <NativeTabs.Trigger.Label>Add song</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.add}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
