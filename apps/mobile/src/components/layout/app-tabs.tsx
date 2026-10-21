import { msw98uiFontFamily } from '@vibes/ui/shared';
import { Tabs, useRouter } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  zoffAndroidIconSources,
  zoffIconSources,
} from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';
import { useRoomNavigation } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

export function AppTabs() {
  const router = useRouter();
  const [{ resolvedScheme }] = useThemePreference();
  const theme = useAppTheme();
  const tabletLayout = useTabletLandscapeLayout();
  const { addLabel, canAddPlaylistItems, hasRoom } = useRoomNavigation();
  const hidesNativeTabs = Platform.OS === 'android';
  const iconSources =
    Platform.OS === 'android' ? zoffAndroidIconSources : zoffIconSources;

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    router.prefetch('/remote');
    router.prefetch('/settings');
  }, [router]);

  if (Platform.OS === 'android') {
    return (
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="remote" />
        <Tabs.Screen name="settings" />
        <Tabs.Screen name="add" />
      </Tabs>
    );
  }

  return (
    <NativeTabs
      screenListeners={{
        tabPress: (event) => {
          if (!event.data.isPrevented) void triggerSelectionFeedback();
        },
      }}
      hidden={hidesNativeTabs}
      blurEffect={
        resolvedScheme === 'light'
          ? 'systemMaterialLight'
          : 'systemMaterialDark'
      }
      iconColor={{
        default: theme.muted,
        selected: theme.pink,
      }}
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
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>
          {hasRoom ? 'Room' : 'Rooms'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.home}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="remote" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Remote</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.remote}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.settings}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        disableAutomaticContentInsets
        hidden={!canAddPlaylistItems || tabletLayout.isTablet}
        name="add"
        role="search"
        unstable_nativeProps={{
          ios: {
            role: 'search',
            automaticallyActivatesSearch: true,
          },
        }}
      >
        <NativeTabs.Trigger.Label>{addLabel}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          renderingMode="template"
          src={iconSources.add}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
