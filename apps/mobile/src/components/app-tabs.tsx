import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, useColorScheme } from 'react-native';
import { zoffIconSources } from '@/components/zoff-icon';
import { palette } from '@/constants/theme';
import { useApp } from '@/providers/app-provider';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = palette[scheme === 'light' ? 'light' : 'dark'];
  const { room } = useApp();
  return (
    <NativeTabs
      blurEffect={
        scheme === 'light' ? 'systemMaterialLight' : 'systemMaterialDark'
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
        <NativeTabs.Trigger.Label>Rooms</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={zoffIconSources.home}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="player">
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={zoffIconSources.player}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remote">
        <NativeTabs.Trigger.Label>Remote</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={zoffIconSources.remote}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={zoffIconSources.settings}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        hidden={!room}
        name="add"
        role={Platform.OS === 'ios' ? 'search' : undefined}
      >
        <NativeTabs.Trigger.Label>Add song</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={zoffIconSources.add}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
