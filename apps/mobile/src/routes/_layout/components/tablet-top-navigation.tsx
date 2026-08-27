import { classNames } from '@vibes/shared';
import { usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

export function TabletTopNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const tabletLayout = useTabletLandscapeLayout();
  const { hasRoom } = useRoomNavigation();
  const { enabled: konamiEnabled } = useKonamiMode();

  if (Platform.OS !== 'android' || !tabletLayout.isTablet || konamiEnabled) {
    return null;
  }

  const items = [
    { href: '/', label: hasRoom ? 'Room' : 'Rooms' },
    { href: '/remote', label: 'Remote' },
    { href: '/settings', label: 'Settings' },
  ] as const;

  return (
    <View
      className="absolute inset-x-0 z-40 items-center"
      pointerEvents="box-none"
      style={{ top: insets.top + topNavigationOffset }}
    >
      <View className="flex-row rounded-full bg-mobile-card/95 p-1 shadow-black/15 shadow-lg dark:bg-mobile-dark-card/95">
        {items.map((item) => {
          const selected = pathname === item.href;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={classNames(
                'overflow-hidden rounded-full px-5 py-2 active:opacity-70',
                selected && 'bg-primary/15',
              )}
              key={item.href}
              onPress={() => router.replace(item.href)}
            >
              <Text
                className={classNames(
                  'font-heading text-base text-mobile-muted dark:text-mobile-dark-muted',
                  selected && 'text-accent dark:text-accent',
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const topNavigationOffset = 8;
