import { classNames } from '@vibes/shared';
import { NativePressable as Pressable } from '@vibes/ui/native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { usePathname, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ZoffIcon, type ZoffIconName } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { useRoomNavigation } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

interface NavigationItem {
  href: '/' | '/remote' | '/settings';
  icon: ZoffIconName;
  label: string;
}

interface GlassSurfaceProps {
  colorScheme: 'light' | 'dark';
  isInteractive?: boolean;
  style?: {
    position?: 'absolute';
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    borderRadius?: number;
  };
}

function GlassSurface(props: GlassSurfaceProps) {
  return (
    <GlassView {...props} glassEffectStyle="regular" pointerEvents="none" />
  );
}

const NativeGlass = styled(GlassSurface, { className: 'style' });

export function PhoneNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useAppTheme();
  const [{ resolvedScheme }] = useThemePreference();
  const { isTablet } = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const { addLabel, canAddPlaylistItems, hasRoom } = useRoomNavigation();

  if (isTablet || keyboardVisible || pathname === '/add') return null;

  const glass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  const items: NavigationItem[] = [
    {
      href: '/',
      icon: 'home',
      label: hasRoom ? 'Room' : 'Rooms',
    },
    {
      href: '/remote',
      icon: 'remote',
      label: 'Remote',
    },
    {
      href: '/settings',
      icon: 'settings',
      label: 'Settings',
    },
  ];

  return (
    <View
      className="absolute inset-x-4 z-50 flex-row items-center gap-3"
      pointerEvents="box-none"
      style={{
        bottom: insets.bottom + navigationBottomOffset,
      }}
    >
      <View
        className={classNames(
          'min-w-0 flex-1 flex-row rounded-full p-1',
          !glass &&
            'border border-mobile-border/70 bg-mobile-card/95 shadow-black/20 shadow-lg dark:border-mobile-dark-border/70 dark:bg-mobile-dark-card/95',
        )}
      >
        {glass && (
          <NativeGlass
            className="absolute inset-0 rounded-full"
            colorScheme={resolvedScheme}
          />
        )}
        {items.map((item) => {
          const selected = pathname === item.href;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                selected,
              }}
              className={classNames(
                'min-w-0 flex-1 items-center gap-0.5 overflow-hidden rounded-full py-2 active:opacity-70',
                selected && 'bg-primary/15',
              )}
              key={item.href}
              onPress={() => router.navigate(item.href)}
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
      {canAddPlaylistItems && (
        <Pressable
          accessibilityLabel={addLabel}
          accessibilityRole="button"
          className={classNames(
            'size-16 items-center justify-center rounded-full',
            !glass &&
              'border border-primary bg-primary shadow-lg shadow-primary/30 active:opacity-80',
          )}
          onPress={() => router.push('/add')}
        >
          {glass && (
            <NativeGlass
              className="absolute inset-0 rounded-full"
              colorScheme={resolvedScheme}
              isInteractive
            />
          )}
          <ZoffIcon
            color={glass ? theme.text : '#ffffff'}
            name="add"
            size={26}
          />
        </Pressable>
      )}
    </View>
  );
}

const navigationBottomOffset = 12;
