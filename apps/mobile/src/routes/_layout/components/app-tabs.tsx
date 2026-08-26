import { msw98uiFontFamily } from '@vibes/ui/shared';
import { useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  zoffAndroidIconSources,
  zoffIconSources,
} from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

export default function AppTabs() {
  const router = useRouter();
  const [{ resolvedScheme }] = useThemePreference();
  const theme = useAppTheme();
  const tabletLayout = useTabletLandscapeLayout();
  const { canAddSongs, hasRoom } = useRoomNavigation();
  const showsFloatingAddButton = tabletLayout.isTablet;
  const hidesAddTab = Platform.OS === 'ios' && showsFloatingAddButton;
  const hidesNativeTabs = Platform.OS === 'android';
  const iconSources =
    Platform.OS === 'android' ? zoffAndroidIconSources : zoffIconSources;

  useEffect(() => {
    router.prefetch('/remote');
    router.prefetch('/settings');
  }, [router]);

  return (
    <NativeTabs
      hidden={hidesNativeTabs}
      blurEffect={
        resolvedScheme === 'light'
          ? 'systemMaterialLight'
          : 'systemMaterialDark'
      }
      iconColor={{ default: theme.muted, selected: theme.pink }}
      minimizeBehavior="onScrollDown"
      tintColor={theme.pink}
      labelStyle={{
        default: {
          color: theme.muted,
          fontFamily: msw98uiFontFamily,
          fontSize: 11,
        },
        selected: {
          color: theme.text,
          fontFamily: msw98uiFontFamily,
          fontSize: 11,
        },
      }}
      shadowColor="transparent"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {hasRoom ? 'Room' : 'Rooms'}
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
        hidden={!canAddSongs || hidesAddTab}
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
