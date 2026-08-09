import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';
import { pixelIconSources } from '@/components/pixel-icon';
import { palette } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = palette[scheme === 'light' ? 'light' : 'dark'];
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
          fontFamily: 'Pixelify Sans',
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
          src={pixelIconSources.home}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="player">
        <NativeTabs.Trigger.Label>Player</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={pixelIconSources.player}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remote">
        <NativeTabs.Trigger.Label>Remote</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={pixelIconSources.remote}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={pixelIconSources.settings}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
