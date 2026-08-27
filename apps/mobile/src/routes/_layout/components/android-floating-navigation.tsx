import { classNames } from '@vibes/shared';
import { usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ZoffIcon, type ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

interface NavigationItem {
  href: '/' | '/remote' | '/settings';
  icon: ZoffIconName;
  label: string;
}

export function AndroidFloatingNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useAppTheme();
  const { isTablet } = useTabletLandscapeLayout();
  const { canAddSongs, hasRoom } = useRoomNavigation();
  const { enabled: konamiEnabled } = useKonamiMode();

  if (Platform.OS !== 'android' || isTablet || konamiEnabled) return null;

  const items: NavigationItem[] = [
    { href: '/', icon: 'home', label: hasRoom ? 'Room' : 'Rooms' },
    { href: '/remote', icon: 'remote', label: 'Remote' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ];
  return (
    <View
      className="absolute inset-x-4 z-50 flex-row items-center gap-3"
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + navigationBottomOffset }}
    >
      <View className="min-w-0 flex-1 flex-row rounded-full border border-mobile-border/70 bg-mobile-card/95 p-1 shadow-black/20 shadow-lg dark:border-mobile-dark-border/70 dark:bg-mobile-dark-card/95">
        {items.map((item) => {
          const selected = pathname === item.href;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={classNames(
                'min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-full py-2 active:opacity-70',
                selected && 'bg-primary/15',
              )}
              key={item.href}
              onPress={() => router.replace(item.href)}
            >
              <ZoffIcon
                color={selected ? theme.pink : theme.muted}
                name={item.icon}
                size={20}
              />
              <Text
                className={classNames(
                  'font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted',
                  selected && 'text-mobile-text dark:text-mobile-dark-text',
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {canAddSongs && (
        <Pressable
          accessibilityLabel="Add song"
          className="size-16 items-center justify-center rounded-full border border-primary bg-primary shadow-lg shadow-primary/30 active:opacity-80"
          onPress={() => router.push('/add')}
        >
          <ZoffIcon color="#ffffff" name="add" size={26} />
        </Pressable>
      )}
    </View>
  );
}

const navigationBottomOffset = 12;
